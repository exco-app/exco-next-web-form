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
import { ENDPOINT, hashData, hashDOB, hashGender, validateEmail, getPixelId } from "../../../src/config/index";
import { initializePixel, trackMetaEvent, fbqReady } from "../../../src/utils/pixelManager";
import { mixpanelInit, safeTrack, CleverTapInit, trackCheckoutStep } from "../../../src/utils/mixpanel-helpers";
import { useCreateUser } from "../../../src/hooks/useCreateUser";
import { useFormSubmission } from "../../../src/hooks/useFormSubmission";
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
    // Note: submitting state is now managed by useFormSubmission hook via isFormSubmitting
    const [isStepSubmitting, setIsStepSubmitting] = useState(false);
    const [userExists, setUserExists] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isMobile, setIsMobile] = useState(false);
    const [authToken, setAuthToken] = useState<string | null>(null);
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

    // Initialize createUser hook
    const { createUser } = useCreateUser(formData, setAuthToken, authToken);

    // Prepare otherParams for UTM tracking
    const otherParams = React.useMemo(() => {
        if (typeof window === 'undefined') return {};
        const urlParams = new URLSearchParams(window.location.search);
        return {
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
            fbclid: urlParams.get('fbclid'),
        };
    }, [searchParams]);

    // Create trackSubmitApplication function for pixel tracking
    const trackSubmitApplication = React.useCallback((editionData: EditionData | null, hashedFields: any) => {
        if (typeof window === 'undefined' || !editionData) return;

        const stableEventId = searchParams?.get('eventId') ||
            sessionStorage.getItem('fbEventId') ||
            window.fbEventId ||
            null;

        fbqReady
            .then(() => trackMetaEvent('Lead', { content_name: editionData?.name }, stableEventId))
            .catch(() => console.warn('Lead event skipped'));
    }, [searchParams]);

    // Initialize form submission hook
    const { isSubmitting: isFormSubmitting, submitForm } = useFormSubmission(
        formData,
        editionData,
        otherParams,
        eventId,
        trackSubmitApplication
    );

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

    // Initialize Pixel when editionData is available
    useEffect(() => {
        if (typeof window === 'undefined' || !editionData) return;

        const pixelId = getPixelId(editionData.project_name);
        if (pixelId) {
            const stableEventId = searchParams?.get('eventId') || sessionStorage.getItem('fbEventId') || window.fbEventId || null;
            initializePixel(pixelId, editionData.project_name || 'Unknown', (stableEventId ?? null) as any)
                .then(() => {
                    // Track PageView after pixel is initialized
                    trackMetaEvent('PageView', {}, stableEventId ?? undefined);
                })
                .catch((error) => {
                    console.warn('Pixel initialization failed:', error);
                });
        } else {
            console.warn('No pixel ID configured for project:', editionData.project_name);
        }
    }, [editionData, searchParams]);

    // Initialize Mixpanel when editionData is available
    useEffect(() => {
        if (typeof window === 'undefined' || !editionData) return;

        // Extract UTM parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const otherParams = {
            ss_source: urlParams.get('ss_source') || urlParams.get('utm_source') || null,
            ss_medium: urlParams.get('ss_medium') || urlParams.get('utm_medium') || null,
            ss_campaign: urlParams.get('ss_campaign') || urlParams.get('utm_campaign') || null,
            ss_content: urlParams.get('ss_content') || urlParams.get('utm_content') || null,
            ss_term: urlParams.get('ss_term') || urlParams.get('utm_term') || null,
        };

        // Initialize Mixpanel
        mixpanelInit(otherParams, editionData);
        CleverTapInit();
    }, [editionData]);

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
            setValidation(prev => {
                const newErrors = { ...prev.errors };
                delete newErrors[name as keyof typeof newErrors];
                return { errors: newErrors };
            });
        }
    };

    const clearFieldError = (fieldName: string) => {
        setValidation(prev => {
            const newErrors = { ...prev.errors };
            delete newErrors[fieldName as keyof typeof newErrors];
            return { errors: newErrors };
        });
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
        if (!formData.firstName || !formData.firstName.trim()) {
            toast.error('First name is required');
            return false;
        }
        if (!formData.email || !formData.email.trim()) {
            toast.error('Email is required');
            return false;
        }
        if (!validateEmail(formData.email)) {
            toast.error('Please enter a valid email address');
            return false;
        }
        if (!formData.phoneNumber || !formData.phoneNumber.trim()) {
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
        if (!formData.instagramProfile || !formData.instagramProfile.trim()) {
            toast.error('Instagram handle or LinkedIn profile URL is required');
            return false;
        }
        return true;
    };

    const handleStep1Submit = async () => {
        const requiredFields = ['firstName', 'email', 'phoneNumber'];

        const hasErrors = requiredFields.some(field => {
            const value = formData[field as keyof FormData];
            return !value || (typeof value === 'string' && value.trim() === '');
        });

        if (hasErrors) {
            // Trigger validation display
            validateStep1();
            return;
        }

        setIsStepSubmitting(true);
        // @ts-ignore - createUser accepts string | null | undefined
        const result = await createUser(editionData?.id ?? null, false, editionData?.name ?? null);
        setIsStepSubmitting(false);

        if (result) {
            trackCheckoutStep(1, formData);

            const stableEventId = searchParams?.get('eventId') || (typeof window !== 'undefined' ? sessionStorage.getItem('fbEventId') : null) || (typeof window !== 'undefined' ? window.fbEventId : null) || null;
            if (trackMetaEvent) {
                trackMetaEvent('InitiateCheckout', {
                    content_ids: [editionData?.id],
                    content_name: editionData?.name,
                    currency: "INR",
                    value: (editionData as any)?.payment_schedule_info?.total_amount || 0,
                }, stableEventId ?? undefined);
            }

            setUserExists(result.user_exists || false);
            setCurrentStep(2);
        }
    };

    const validateStep2 = (): boolean => {
        const errors: Validation['errors'] = {};

        if (!formData.gender) {
            errors.gender = 'Gender is required';
        }
        if (!formData.dateOfBirth || (typeof formData.dateOfBirth === 'string' && !formData.dateOfBirth.trim())) {
            errors.dateOfBirth = 'Date of birth is required';
        }
        if (!formData.professionalCategory) {
            errors.professionalCategory = 'Professional category is required';
        }
        if (!formData.designation || (typeof formData.designation === 'string' && !formData.designation.trim())) {
            errors.designation = 'Designation is required';
        }
        if (!formData.whatAreYouLookingFor || formData.whatAreYouLookingFor.length === 0) {
            errors.whatAreYouLookingFor = 'Please select at least one option';
        }
        if (!formData.oneThingRuinsTrip) {
            errors.oneThingRuinsTrip = 'This field is required';
        }
        if (!formData.instagramProfile || (typeof formData.instagramProfile === 'string' && !formData.instagramProfile.trim())) {
            errors.instagramProfile = 'Instagram handle or LinkedIn profile URL is required';
        }

        setValidation({ errors });
        return Object.keys(errors).length === 0;
    };

    const handleStep2Submit = async () => {
        // Validate required fields
        const requiredFields = ['gender', 'dateOfBirth', 'professionalCategory', 'designation', 'whatAreYouLookingFor', 'oneThingRuinsTrip', 'instagramProfile'];

        const fieldErrors: string[] = [];
        requiredFields.forEach(field => {
            const value = formData[field as keyof FormData];
            let isValid = true;

            // Handle undefined/null values
            if (value === undefined || value === null) {
                isValid = false;
            } else if (Array.isArray(value)) {
                isValid = value.length > 0;
            } else if (typeof value === 'string') {
                isValid = value.trim() !== '';
            } else {
                isValid = value !== '' && value !== 0;
            }

            if (!isValid) {
                fieldErrors.push(field);
            }
        });

        if (fieldErrors.length > 0) {
            // Trigger validation display
            validateStep2();
            return;
        }

        // Use validateForm to ensure all required fields are present
        if (!validateForm()) {
            return;
        }

        // Use the form submission hook
        await submitForm();
    };

    // handleSubmit is now replaced by submitForm from useFormSubmission hook
    // Keeping this comment for reference - the actual submission logic is in useFormSubmission

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
                            isSubmitting={isStepSubmitting}
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
                        isSubmitting={isFormSubmitting}
                        onSubmit={handleStep2Submit}
                    />
                </div>
            </div>
        </div>
    );
};

export default RequestInvitePage;

