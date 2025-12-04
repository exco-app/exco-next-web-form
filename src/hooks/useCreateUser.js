import { useState, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ENDPOINT } from '../../../config';
import mixpanel from 'mixpanel-browser';

// Safe access to clevertap (client-side only)
const getCleverTap = () => {
    if (typeof window !== 'undefined' && window.clevertap) {
        return window.clevertap;
    }
    return null;
};

export const useCreateUser = (formData, setAuthToken, authToken) => {
    const [isCreating, setIsCreating] = useState(false);

    // Fetch user details (gender, date_of_birth)
    const fetchUserDetails = useCallback(async () => {
        if (!authToken) {
            console.error('No auth token available');
            return null;
        }

        try {
            const response = await axios.get(
                `${ENDPOINT}/customer/api/web/update-user-details/`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Token ${authToken}`,
                    },
                }
            );

            console.log("User details fetched:", response.data);
            return {
                gender: response.data.gender,
                date_of_birth: response.data.date_of_birth,
            };
        } catch (error) {
            console.error('Error fetching user details:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch user details. Please try again.',
            });
            return null;
        }
    }, [authToken]);

    const createUser = useCallback(async (editionId = null, includeGenderAndDOB = false, editionName = null) => {
        setIsCreating(true);

        if (!formData?.firstName
            || !formData?.email
            || !formData?.countryCode
            || !formData?.phoneNumber) {
            setIsCreating(false);
            return null;
        }

        try {
            const userPayload = {
                phone: `${formData?.countryCode}${formData?.phoneNumber}`,
                first_name: formData?.firstName,
                email: formData.email,
                edition: editionId || null,
                referral_code: null,
            }

            // Add last_name only if it exists
            if (formData?.lastName) {
                userPayload.last_name = formData.lastName;
            }

            // Add gender and date_of_birth only if explicitly requested (Step 2)
            if (includeGenderAndDOB) {
                // Add gender if provided
                if (formData?.gender !== undefined && formData?.gender !== null) {
                    userPayload.gender = formData.gender;
                }

                // Add date_of_birth if provided (convert DD-MM-YYYY to YYYY-MM-DD)
                if (formData?.dateOfBirth) {
                    const parts = formData.dateOfBirth.split("-");
                    if (parts.length === 3) {
                        userPayload.date_of_birth = `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
                    }
                }
            }

            console.log("userPayload", userPayload);
            console.log("Calling create-user-v2 API with payload:", userPayload);

            // Call create-user-v2 API
            const userResponse = await axios.post(
                `${ENDPOINT}/customer/api/web/create-user-v2/`,
                userPayload,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            setIsCreating(false)

            const userId = userResponse?.data?.user_id;
            const token = userResponse?.data?.token;
            const message = userResponse?.data?.message || "";
            const userExists = message.toLowerCase().includes("user already exists");

            sessionStorage.setItem("token", token);

            // Store the token for later use
            if (token && setAuthToken) {
                setAuthToken(token);
                console.log("Auth token stored:", token);
            }

            if (userId) {
                // Only track on client-side
                if (typeof window !== 'undefined') {
                    try {
                        mixpanel?.identify(userId);

                        // Set user properties in Mixpanel
                        const fullName = formData.lastName
                            ? `${formData.firstName} ${formData.lastName}`
                            : formData.firstName;
                        mixpanel.people.set({
                            $name: fullName,
                            $email: formData.email,
                            firstName: formData.firstName,
                            lastName: formData.lastName || null,
                            phone: `${formData.countryCode}${formData.phoneNumber}`,
                            edition: editionName,
                        });
                    } catch (error) {
                        console.error("Error setting Mixpanel user properties:", error);
                    }

                    // CleverTap tracking
                    const clevertap = getCleverTap();
                    if (clevertap) {
                        try {
                            clevertap.profile.push({
                                "Site": {
                                    "Identity": userId,
                                    "Name": `${formData.firstName} ${formData.lastName}`,
                                    "Email": formData.email,
                                    "Phone": `${formData.countryCode}${formData.phoneNumber}`,
                                    "Gender": formData.gender === 1 || formData.gender === 6 ? "F" : "M",
                                    "City": formData.city,
                                }
                            });
                        } catch (error) {
                            console.error("Error setting CleverTap profile:", error);
                        }
                    }
                }
            }

            return {
                success: true,
                user_id: userId,
                token: token,
                user_exists: userExists,
            };

        } catch (error) {
            setIsCreating(false);

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
            return null;
        }
    }, [formData, setAuthToken]);

    const updateUserProfile = useCallback(async (updateData) => {
        // Build the data payload based on what's provided in updateData
        const data = {
            email: formData.email,
        };

        // Add DOB if provided (convert DD-MM-YYYY to YYYY-MM-DD)
        if (updateData.dateOfBirth) {
            const parts = updateData.dateOfBirth.split("-");
            if (parts.length === 3) {
                data.date_of_birth = `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
            }
        }

        // Add gender if provided
        if (updateData.gender !== undefined) {
            data.gender = updateData.gender;
        }

        // Build user_profile object for city, Instagram, or story
        const userProfile = {};

        if (updateData.city) {
            userProfile.city = updateData.city;
        }

        if (updateData.instagramProfile !== undefined) {
            userProfile.instagram_url = updateData.instagramProfile && updateData.instagramProfile.trim() !== ""
                ? updateData.instagramProfile.includes("instagram.com")
                    ? updateData.instagramProfile
                    : `https://instagram.com/${updateData.instagramProfile}`
                : null;
        }

        // Add user_profile if it has any properties
        if (Object.keys(userProfile).length > 0) {
            data.user_profile = userProfile;
        }

        // Add story/intentions if provided
        if (updateData.story !== undefined) {
            data.intentions = updateData.story;
        }

        console.log("updateUserProfile payload:", data);

        try {
            const headers = {
                "Content-Type": "application/json",
            };

            // Add Authorization header if token is available
            if (authToken) {
                headers["Authorization"] = `Token ${authToken}`;
            }

            const response = await axios.post(
                `${ENDPOINT}/customer/api/web/update-user-details/`,
                data,
                { headers }
            );

            console.log("updateUserProfile success:", response.data);
            return { success: true };
        } catch (error) {
            console.error("Error calling API:", error);
            Swal.fire({
                icon: "error",
                title: "Something is not right",
                html: error.response?.data?.message?.replace(/\n/g, "<br>") || "Failed to update user details",
            });
            return null;
        }
    }, [formData.email, authToken]);

    return {
        createUser,
        isCreating,
        updateUserProfile,
        fetchUserDetails
    };
}; 