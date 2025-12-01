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
import { ENDPOINT, hashData, hashDOB, hashGender, validateEmail } from "../../../src/config/index";
import { formatDateToReadable } from "../../../src/utils/formHelpers";
import { trackMetaEvent, fbqReady } from "../../../src/utils/pixelManager";
import CustomSelect from "../../../src/components/select";
import InputField from "../../../src/components/input";
import DatePicker from "../../../src/components/date-picker";
import Step1 from "./Step1";
import Step2 from "./Step2";
import {
    fieldOfWorkChoices,
    categoryChoices,
    genderOptions,
    phoneCode
} from "../../../src/config/data";
import styles from '../../HomePage.module.css';
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
            // Prepare hashed data for privacy
            const hashedEmail = hashData(formData.email);
            const hashedPhone = hashData(`${formData.countryCode}${formData.phoneNumber}`);
            const hashedDOB = hashDOB(formData.dateOfBirth);
            const hashedGender = hashGender(formData.gender);
            const hashedFirstName = hashData(formData.firstName);
            const hashedLastName = hashData(formData.lastName);

            const payload = {
                edition: editionId,
                eventId: eventId,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: `${formData.countryCode}${formData.phoneNumber}`,
                dateOfBirth: formData.dateOfBirth,
                gender: parseInt(formData.gender),
                fieldOfWork: parseInt(formData.fieldOfWork),
                category: parseInt(formData.category),
                instagramHandle: formData.instagramHandle,
                website: formData.website,
                // Hashed data for analytics
                hashedEmail,
                hashedPhone,
                hashedDOB,
                hashedGender,
                hashedFirstName,
                hashedLastName,
            };

            // TODO: Replace with your actual API endpoint
            const response = await fetch(`${ENDPOINT}/api/invite-request/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to submit invite request');
            }

            const data = await response.json();

            // Track conversion event
            const stableEventId = searchParams?.get('eventId') || sessionStorage.getItem('fbEventId') || window.fbEventId;
            fbqReady
                .then(() => trackMetaEvent('Lead', { content_name: editionData?.name }, stableEventId))
                .catch(() => console.warn('Lead event skipped'));

            toast.success('Invite request submitted successfully!');

            // Redirect to thank you page or show success message
            // router.push(`/thank-you?edition=${editionId}`);

        } catch (error: any) {
            toast.error(error.message || 'Failed to submit invite request');
            console.error('Error submitting form:', error);
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
                        {/* <div id="kt_app_header" className="app-header">
                            <div className="app-container container-xxl d-flex align-items-stretch justify-content-center" id="kt_app_header_container">
                                <div className="d-flex justify-content-center align-items-center flex-grow-1 flex-lg-grow-1">
                                    <a
                                        href="https://theexperience.co"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: "#5F2C41", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: "bold", fontSize: "20px" }}
                                    >
                                        the experience co.
                                    </a>
                                </div>
                            </div>
                        </div> */}
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
                    {/* <div id="kt_app_header" className="app-header">
                        <div className="app-container container-xxl d-flex align-items-stretch justify-content-center" id="kt_app_header_container">
                            <div className="d-flex justify-content-center align-items-center flex-grow-1 flex-lg-grow-1">
                                <a
                                    href="https://theexperience.co"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "#5F2C41", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: "bold", fontSize: "20px" }}
                                >
                                    the experience co.
                                </a>
                            </div>
                        </div>
                    </div> */}
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

