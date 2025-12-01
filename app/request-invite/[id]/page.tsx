'use client';

// Extend Window interface to include fbEventId
declare global {
    interface Window {
        fbEventId?: string;
    }
}

import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { ENDPOINT, hashData, hashDOB, hashGender, validateEmail } from "../../../src/config/index";
import { trackMetaEvent, fbqReady } from "../../../src/utils/pixelManager";
import mixpanel from "mixpanel-browser";
import Step1 from "./Step1";
import Step2 from "./Step2";
import { EditionData } from "./formUtils";

interface FormData {
    countryCode: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    gender: string;
    professionalCategory: string;
    designation: string;
    howDidYouHear: string;
    whatAreYouLookingFor: any[];
    oneThingRuinsTrip: string;
    occasion: string;
    instagramProfile: string;
    estimatedBudget: string;
    whenWouldYouBook: string;
    fieldOfWork: string;
    category: string;
    instagramHandle: string;
    website: string;
}

interface Validation {
    errors: {
        countryCode?: string;
        phoneNumber?: string;
        firstName?: string;
        email?: string;
        gender?: string;
        dateOfBirth?: string;
        professionalCategory?: string;
        designation?: string;
        whatAreYouLookingFor?: string;
        oneThingRuinsTrip?: string;
        instagramProfile?: string;
    };
}

const RequestInvitePage = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const editionId = params?.id as string;
    const eventId = searchParams?.get('eventId') || null;

    const [editionData, setEditionData] = useState<EditionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isMobile, setIsMobile] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        countryCode: '+91',
        phoneNumber: '',
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        gender: '',
        professionalCategory: '',
        designation: '',
        howDidYouHear: '',
        whatAreYouLookingFor: [],
        oneThingRuinsTrip: '',
        occasion: '',
        instagramProfile: '',
        estimatedBudget: '',
        whenWouldYouBook: '',
        fieldOfWork: '',
        category: '',
        instagramHandle: '',
        website: '',
    });
    const [validation, setValidation] = useState<Validation>({
        errors: {},
    });

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (editionId) {
            fetchEditionData();
        }
    }, [editionId]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const stableEventId = searchParams?.get('eventId') || sessionStorage.getItem('fbEventId') || window.fbEventId;
        fbqReady
            .then(() => trackMetaEvent('PageView', {}, stableEventId))
            .catch(() => console.warn('PageView skipped—fbq never loaded'));
    }, []);

    const fetchEditionData = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${ENDPOINT}/customer/api/editions/web/get-edition/?edition=${editionId}`
            );
            const data = await response.json();
            setEditionData(data);
        } catch (error: any) {
            toast.error('Failed to load edition data');
            console.error("Error fetching edition data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (validation.errors[name as keyof typeof validation.errors]) {
            setValidation(prev => ({
                errors: { ...prev.errors, [name]: undefined }
            }));
        }
    };

    const clearFieldError = (fieldName: string) => {
        setValidation(prev => ({
            errors: { ...prev.errors, [fieldName]: undefined }
        }));
    };

    const handleSelectChange = (name: string) => (value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const updateField = (fieldName: string, values: any) => {
        setFormData(prev => ({ ...prev, [fieldName]: values }));
    };

    const handleDateChange = (dates: Date[]) => {
        if (dates && dates.length > 0) {
            const dateStr = dates[0].toISOString().split('T')[0];
            setFormData(prev => ({ ...prev, dateOfBirth: dateStr }));
        }
    };

    const validateStep1 = (): boolean => {
        const errors: Validation['errors'] = {};

        if (!formData.countryCode.trim()) {
            errors.countryCode = 'Country code is required';
        }
        if (!formData.phoneNumber.trim()) {
            errors.phoneNumber = 'Phone number is required';
        }
        if (!formData.firstName.trim()) {
            errors.firstName = 'Name is required';
        }
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        setValidation({ errors });
        return Object.keys(errors).length === 0;
    };

    const validateForm = (): boolean => {
        if (!formData.firstName.trim()) {
            toast.error('First name is required');
            return false;
        }
        if (!formData.lastName.trim()) {
            toast.error('Last name is required');
            return false;
        }
        if (!formData.email.trim()) {
            toast.error('Email is required');
            return false;
        }
        if (!validateEmail(formData.email)) {
            toast.error('Please enter a valid email address');
            return false;
        }
        if (!formData.phoneNumber.trim()) {
            toast.error('Phone number is required');
            return false;
        }
        if (!formData.dateOfBirth) {
            toast.error('Date of birth is required');
            return false;
        }
        if (!formData.gender) {
            toast.error('Gender is required');
            return false;
        }
        if (!formData.fieldOfWork) {
            toast.error('Field of work is required');
            return false;
        }
        if (!formData.category) {
            toast.error('Category is required');
            return false;
        }
        return true;
    };

    const handleStep1Submit = () => {
        if (validateStep1()) {
            setCurrentStep(2);
        }
    };

    const validateStep2 = (): boolean => {
        const errors: Validation['errors'] = {};

        if (!formData.gender) {
            errors.gender = 'Gender is required';
        }
        if (!formData.dateOfBirth.trim()) {
            errors.dateOfBirth = 'Date of birth is required';
        }
        if (!formData.professionalCategory) {
            errors.professionalCategory = 'Professional category is required';
        }
        if (!formData.designation.trim()) {
            errors.designation = 'Designation is required';
        }
        if (!formData.whatAreYouLookingFor || formData.whatAreYouLookingFor.length === 0) {
            errors.whatAreYouLookingFor = 'Please select at least one option';
        }
        if (!formData.oneThingRuinsTrip) {
            errors.oneThingRuinsTrip = 'This field is required';
        }
        if (!formData.instagramProfile.trim()) {
            errors.instagramProfile = 'Instagram handle or LinkedIn profile URL is required';
        }

        setValidation({ errors });
        return Object.keys(errors).length === 0;
    };

    const handleStep2Submit = async () => {
        if (validateStep2()) {
            await handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setSubmitting(true);

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
                        formattedDateOfBirth = `${parts[2]}-${parts[1]}-${parts[0]}`;
                    }
                }
            }

            // Format Instagram/LinkedIn URL from instagramProfile field
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

            // Prepare user payload
            const userPayload = {
                phone: `${formData.countryCode}${formData.phoneNumber}`,
                first_name: formData.firstName,
                last_name: formData.lastName || "",
                date_of_birth: formattedDateOfBirth,
                gender: formData.gender ? parseInt(formData.gender) : null,
                email: formData.email,
                user_profile: {
                    instagram_url: instagramUrl,
                    linkedin_url: linkedinUrl,
                    bio: null,
                    nationality: "Indian",
                },
                customer_marketing_info: {
                    how_did_you_hear_about_us: formData.howDidYouHear || null,
                    event_id: eventId,
                    fbclid: null,
                },
                professional_category: formData.professionalCategory ? parseInt(formData.professionalCategory) : null,
                designation: formData.designation || null,
                what_are_you_looking_for: Array.isArray(formData.whatAreYouLookingFor)
                    ? formData.whatAreYouLookingFor.map((item: any) => item.value || item).join(",")
                    : formData.whatAreYouLookingFor || null,
                one_thing_ruins_trip: formData.oneThingRuinsTrip || null,
                occasion: formData.occasion || null,
                investment_range: formData.estimatedBudget || null,
                booking_timeline: formData.whenWouldYouBook || null,
            };

            // Prepare booking payload
            const bookingPayload = {
                phone: `${formData.countryCode}${formData.phoneNumber}`,
                edition: editionId,
                intentions: " story is deprecated ",
                investment_range: formData.estimatedBudget || null,
                booking_timeline: formData.whenWouldYouBook || null,
            };

            // Call update-user-details API
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

            // Track request invite completed in mixpanel
            try {
                mixpanel.track("Request Invite Completed", {
                    user_id: bookingResponse.data?.user_id,
                    product: editionData?.name,
                    edition: editionData?.id,
                    project: editionData?.project_name,
                });
            } catch (error) {
                console.error("Error tracking request invite completed:", error);
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
                client_ip_address: "",
                client_user_agent: typeof window !== 'undefined' ? navigator.userAgent : "",
                event_time: eventTime,
            };

            const stableEventId = searchParams?.get('eventId') || (typeof window !== 'undefined' ? sessionStorage.getItem('fbEventId') : null) || (typeof window !== 'undefined' ? window.fbEventId : null);
            fbqReady
                .then(() => trackMetaEvent('Lead', { content_name: editionData?.name }, stableEventId))
                .catch(() => console.warn('Lead event skipped'));

            // Extract event key
            const eventKey = bookingResponse.data?.meta_event_key;

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
                const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
                if (urlParams.get('ss_source')) {
                    const utmBody = {
                        ss_source: urlParams.get('ss_source'),
                        ss_campaign_name: urlParams.get('ss_campaign_name'),
                        ss_adset_name: urlParams.get('ss_adset_name'),
                        ss_ad_name: urlParams.get('ss_ad_name'),
                        ss_campaign_id: urlParams.get('ss_campaign_id'),
                        ss_adset_id: urlParams.get('ss_adset_id'),
                        ss_ad_id: urlParams.get('ss_ad_id'),
                        utm_medium: urlParams.get('utm_medium'),
                        utm_source: urlParams.get('utm_source'),
                        utm_id: urlParams.get('utm_id'),
                        utm_content: urlParams.get('utm_content'),
                        utm_term: urlParams.get('utm_term'),
                        utm_campaign: urlParams.get('utm_campaign'),
                        user: bookingResponse?.data?.user_id,
                        booking: bookingResponse?.data?.booking_id,
                    };

                    await axios.post(`${ENDPOINT}/api/utm/`, utmBody, {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                }
            }

            // Store data in sessionStorage for thank you page
            if (typeof window !== 'undefined') {
                sessionStorage.setItem("formData", JSON.stringify(formData));
                if (editionData) {
                    sessionStorage.setItem("editionData", JSON.stringify(editionData));
                }
                // Store token if present in API response
                if (bookingResponse.data?.token) {
                    sessionStorage.setItem("token", bookingResponse.data.token);
                }
            }

            toast.success('Invite request submitted successfully!');
            router.push('/thankyou');

        } catch (error: any) {
            console.error('Error submitting form:', error);

            // Handle different types of errors
            if (error.response) {
                // Server responded with error status
                const errorResponse = error.response.data;
                const errorMessage = errorResponse?.message || 'Failed to submit invite request';
                toast.error(errorMessage.replace(/\n/g, " "));
            } else if (error.request) {
                // No response received
                toast.error("The server did not respond. Please try again later.");
            } else {
                // Other errors
                toast.error(error.message || "Something went wrong during the request.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div>Loading...</div>
            </div>
        );
    }

    if (!editionData) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div>Edition not found</div>
            </div>
        );
    }

    // Show Step1 component
    if (currentStep === 1) {
        return (
            <div>
                <div className="d-flex flex-column flex-root app-root" id="kt_app_root">
                    <div className="app-page flex-column flex-column-fluid" id="kt_app_page">
                        <Step1
                            editionData={editionData}
                            formData={formData}
                            validation={validation}
                            handleInputChange={handleInputChange}
                            handleSelectChange={handleSelectChange}
                            clearFieldError={clearFieldError}
                            isMobile={isMobile}
                            isSubmitting={submitting}
                            onSubmit={handleStep1Submit}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Show Step2 component
    return (
        <div>
            <div className="d-flex flex-column flex-root app-root" id="kt_app_root">
                <div className="app-page flex-column flex-column-fluid" id="kt_app_page">
                    <Step2
                        editionData={editionData}
                        formData={formData}
                        validation={validation}
                        handleInputChange={handleInputChange}
                        handleSelectChange={handleSelectChange}
                        updateField={updateField}
                        clearFieldError={clearFieldError}
                        isMobile={isMobile}
                        isSubmitting={submitting}
                        onSubmit={handleStep2Submit}
                    />
                </div>
            </div>
        </div>
    );
};

export default RequestInvitePage;

