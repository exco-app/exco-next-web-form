import { useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ENDPOINT, hashData, hashDOB, hashGender } from '../config';
import { safeTrack } from '../utils/mixpanel-helpers';
import Swal from 'sweetalert2';
export const useFormSubmission = (formData, editionData, otherParams, eventId, trackSubmitApplication) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const submitForm = useCallback(async () => {
    setIsSubmitting(true);

    try {
      // Format date of birth (handle DD-MM-YYYY or DD/MM/YYYY format)
      let formattedDateOfBirth = "";
      if (formData.dateOfBirth) {
        const dateStr = formData.dateOfBirth.replace(/\s*-\s*/g, "-").replace(/\s*\/\s*/g, "/");
        if (dateStr.includes("/")) {
          formattedDateOfBirth = dateStr.split("/").reverse().join("-");
        } else if (dateStr.includes("-")) {
          const parts = dateStr.split("-");
          if (parts.length === 3) {
            formattedDateOfBirth = `${parts[0]}-${parts[1]}-${parts[2]}`;
          }
        }
      }

      // Format Instagram/LinkedIn URL from instagramProfile field
      // Check if it's Instagram or LinkedIn
      let instagramUrl = null;
      let linkedinUrl = null;

      if (formData.instagramProfile && formData.instagramProfile.trim() !== "") {
        const profile = formData.instagramProfile.trim();
        if (profile.includes("linkedin.com")) {
          linkedinUrl = profile.includes("http") ? profile : `https://www.${profile}`;
        } else if (profile.includes("instagram.com")) {
          instagramUrl = profile.includes("http") ? profile : `https://www.${profile}`;
        } else {
          // Assume Instagram if no domain specified
          instagramUrl = `https://www.instagram.com/${profile.replace(/^@/, "")}`;
        }
      }

      // Also check linkedinProfile field if it exists separately
      if (formData.linkedinProfile && formData.linkedinProfile.trim() !== "") {
        const profile = formData.linkedinProfile.trim();
        linkedinUrl = profile.includes("http") ? profile : `https://www.linkedin.com/in/${profile.replace(/^@/, "")}`;
      }

      const userPayload = {
        phone: `${formData?.countryCode || ""}${formData?.phoneNumber || ""}`,
        first_name: formData?.firstName || "",
        last_name: formData?.lastName || "",
        date_of_birth: formattedDateOfBirth,
        gender: formData.gender || "",
        email: formData.email || "",
        user_profile: {
          instagram_url: instagramUrl,
          linkedin_url: linkedinUrl,
          bio: formData.story || null,
          nationality: "Indian",
        },
        customer_marketing_info: {
          how_did_you_hear_about_us: formData?.howDidYouHear || null,
          event_id: eventId,
          fbclid: otherParams?.fbclid || null,
        },
        professional_category: formData.professionalCategory || null,
        designation: formData.designation || null,
        what_are_you_looking_for: Array.isArray(formData.whatAreYouLookingFor)
          ? formData.whatAreYouLookingFor.map(item => item?.value ?? item).join(",")
          : formData.whatAreYouLookingFor || null,
        one_thing_ruins_trip: formData.oneThingRuinsTrip || null,
        occasion: formData.occasion || null,
        investment_range: formData.estimatedBudget || null,
        booking_timeline: formData.whenWouldYouBook || null,
        city: formData.city || null,
      };

      // Prepare booking payload
      const bookingPayload = {
        phone: `${formData?.countryCode || ""}${formData?.phoneNumber || ""}`,
        edition: editionData?.id,
        intentions: formData?.story || " story is deprecated ",
        investment_range: formData.estimatedBudget || null,
        booking_timeline: formData.whenWouldYouBook || null,
      };

      // Call create-user API
      await axios.post(
        `${ENDPOINT}/customer/api/web/update-user-details/`,
        userPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Call send-booking-request API
      const bookingResponse = await axios.post(
        `${ENDPOINT}/customer/api/booking/web/send-booking-request/`,
        bookingPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );


      // Track request invite completed in mixpanel (client-side only)
      if (typeof window !== 'undefined') {
        safeTrack("Request Invite Completed", {
          user_id: bookingResponse.data?.user_id,
          product: editionData?.name,
          edition: editionData?.id,
          project: editionData?.project_name,
        });
      }

      // Handle pixel tracking
      const eventTime = Math.floor(new Date().getTime() / 1000);

      const hashedFields = {
        em: hashData(formData.email),
        ph: hashData(formData.phoneNumber),
        db: hashDOB(formData.dateOfBirth),
        fn: hashData(formData.firstName),
        ln: hashData(formData.lastName),
        ge: hashGender(formData.gender),
        external_id: hashData(bookingResponse.data?.user_id),
        client_ip_address: "", // You might want to get this from a separate state
        client_user_agent: navigator.userAgent,
        event_time: eventTime,
      };

      trackSubmitApplication(editionData, hashedFields);

      // Extract event key
      const eventKey = bookingResponse.data?.meta_event_key;

      if (!eventKey) {
        console.error("Error: event_key is missing from bookingResponse!");
      } else {
        console.log("Extracted Event Key:", eventKey);
      }

      if (bookingResponse?.data?.user_id && eventKey) {
        // Prepare event data
        const eventBody = {
          event_key: eventKey,
          payload: {
            em: formData.email,
            ph: formData.phoneNumber,
            db: formData.dateOfBirth,
            fn: formData.firstName,
            ln: formData.lastName,
            ge: formData.gender,
            ge_check: hashGender(formData.gender),
            external_id: bookingResponse.data?.user_id,
            client_ip_address: "",
            client_user_agent: typeof window !== 'undefined' ? navigator.userAgent : "",
            event_time: eventTime,
          },
        };

        // Upload event data
        await axios.post(
          `${ENDPOINT}/v2/customer/api/events/web/evnet-data-upload/`,
          eventBody,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // Handle UTM tracking if available
        if (otherParams?.ss_source) {
          const utmBody = {
            ss_source: otherParams?.ss_source,
            ss_campaign_name: otherParams?.ss_campaign_name,
            ss_adset_name: otherParams?.ss_adset_name,
            ss_ad_name: otherParams?.ss_ad_name,
            ss_campaign_id: otherParams?.ss_campaign_id,
            ss_adset_id: otherParams?.ss_adset_id,
            ss_ad_id: otherParams?.ss_ad_id,
            utm_medium: otherParams?.utm_medium,
            utm_source: otherParams?.utm_source,
            utm_id: otherParams?.utm_id,
            utm_content: otherParams?.utm_content,
            utm_term: otherParams?.utm_term,
            utm_campaign: otherParams?.utm_campaign,
            user: bookingResponse?.data?.user_id,
            booking: bookingResponse?.data?.booking_id,
          };

          await axios.post(`${ENDPOINT}/api/utm/`, utmBody, {
            headers: {
              "Content-Type": "application/json",
            },
          });
        }

        // Save form data to session storage for thank you page
        if (typeof window !== 'undefined') {
          sessionStorage.setItem("formData", JSON.stringify(formData));
          if (editionData) {
            sessionStorage.setItem("editionData", JSON.stringify(editionData));
          }
        }

        // Navigate to thank you page
        setTimeout(() => {
          router.push("/thankyou");
          setIsSubmitting(false);
        }, 500);
      } else {
        setIsSubmitting(false);
        console.error("Error: user_id or event_key is missing from bookingResponse!");
      }
    } catch (error) {
      setIsSubmitting(false);

      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorResponse = error.response.data;
        Swal.fire({
          icon: "error",
          title: "Something is not right",
          html: errorResponse.message.replace(/\n/g, "<br>"),
        });
      } else if (error.request) {
        // No response received
        Swal.fire({
          icon: "error",
          title: "No Response",
          text: "The server did not respond. Please try again later.",
        });
      } else {
        // Other errors
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Something went wrong during the request.",
        });
      }

      console.error("Error calling API:", error);
    }
  }, [formData, editionData, otherParams, eventId, trackSubmitApplication, router]);

  return {
    isSubmitting,
    submitForm,
  };
}; 