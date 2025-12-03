import mixpanel from "mixpanel-browser";
import { MIXPANEL_TOKEN, prodMode } from "../config";

// Track initialization state
let isInitialized = false;

// Safe access to clevertap (client-side only)
const getCleverTap = () => {
    if (typeof window !== 'undefined' && window.clevertap) {
        return window.clevertap;
    }
    return null;
};

// Check if Mixpanel is initialized and ready to track
export const isMixpanelReady = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    // Check if token exists
    if (!MIXPANEL_TOKEN) {
        return false;
    }

    // Use our initialization flag
    if (!isInitialized) {
        return false;
    }

    // Additional safety checks: ensure mixpanel object exists and is properly initialized
    try {
        if (!mixpanel || typeof mixpanel.track !== 'function') {
            return false;
        }

        // Critical check: Mixpanel's internal config must exist
        // This is what causes the "disable_all_events" error if missing
        // Try to access config safely - it might be a private property
        try {
            // Check if config exists by trying to access it
            const config = mixpanel.config;
            if (!config || typeof config !== 'object') {
                return false;
            }
        } catch (e) {
            // If we can't access config, assume not ready
            return false;
        }

        // Check if get_distinct_id exists and works
        if (typeof mixpanel.get_distinct_id !== 'function') {
            return false;
        }

        // Try to safely check if internal state is ready
        try {
            const testId = mixpanel.get_distinct_id();
            // If we can get distinct_id, Mixpanel is likely initialized
        } catch (e) {
            // If get_distinct_id fails, Mixpanel isn't ready
            return false;
        }
    } catch (error) {
        return false;
    }

    return true;
};

// Safe wrapper for mixpanel.track
export const safeTrack = (eventName, properties) => {
    if (!isMixpanelReady()) {
        console.warn(`Mixpanel not initialized yet, skipping tracking for ${eventName}`);
        return;
    }

    try {
        // Double-check mixpanel exists and is callable before tracking
        if (!mixpanel || typeof mixpanel.track !== 'function') {
            console.warn(`Mixpanel track method not available, skipping tracking for ${eventName}`);
            return;
        }

        // Critical check: Verify config exists - this prevents the disable_all_events error
        try {
            const config = mixpanel.config;
            if (!config || typeof config !== 'object') {
                console.warn(`Mixpanel config not available, skipping tracking for ${eventName}`);
                isInitialized = false;
                return;
            }
        } catch (e) {
            console.warn(`Mixpanel config not accessible, skipping tracking for ${eventName}`);
            isInitialized = false;
            return;
        }

        // Additional check: verify get_distinct_id works (indicates internal state is ready)
        try {
            mixpanel.get_distinct_id();
        } catch (e) {
            console.warn(`Mixpanel internal state not ready (get_distinct_id failed), skipping tracking for ${eventName}`);
            isInitialized = false;
            return;
        }

        mixpanel.track(eventName, properties);
    } catch (error) {
        // If error is about disable_all_events or config, mark as not initialized
        if (error.message && (error.message.includes('disable_all_events') || error.message.includes('config') || error.message.includes('undefined'))) {
            console.warn(`Mixpanel internal state not ready, marking as uninitialized: ${error.message}`);
            isInitialized = false;
        }
        // Silently handle the error to prevent it from breaking the app
        // The error is already logged, no need to throw or show to user
    }
};

export function trackCheckoutStarted(editionData) {
    // Only track on client-side
    if (typeof window === 'undefined') {
        return;
    }

    // Check if Mixpanel is ready before tracking
    if (!isMixpanelReady()) {
        console.warn('Mixpanel not initialized yet, skipping tracking for Checkout Started');
        return;
    }

    console.log("Tracking checkout started", mixpanel);
    try {
        mixpanel.track("Checkout Started", {
            product: editionData?.name,
            edition: editionData?.id,
            project: editionData?.project_name,
            form_variant: "web",
        });
    } catch (error) {
        console.error("Error tracking checkout started:", error);
    }
}

export function trackCheckoutStep(stepNumber, formData) {
    // Only track on client-side
    if (typeof window === 'undefined') {
        return;
    }

    // Check if Mixpanel is ready before tracking
    if (!isMixpanelReady()) {
        console.warn(`Mixpanel not initialized yet, skipping tracking for Checkout Step ${stepNumber}`);
        return;
    }

    try {
        mixpanel.track(`Checkout Step ${stepNumber}`, {
            step: stepNumber,
            email: formData?.email,
            firstName: formData?.firstName,
            lastName: formData?.lastName,
        });
    } catch (error) {
        console.error(`Error tracking checkout step ${stepNumber}:`, error);
    }
}

export function trackStepCompleted(stepName, formData, editionData) {
    // Only track on client-side
    if (typeof window === 'undefined') {
        return;
    }

    // Check if Mixpanel is ready before tracking
    if (!isMixpanelReady()) {
        console.warn(`Mixpanel not initialized yet, skipping tracking for ${stepName}`);
        return;
    }

    try {
        // Double-check mixpanel exists and is callable before tracking
        if (!mixpanel || typeof mixpanel.track !== 'function') {
            console.warn(`Mixpanel track method not available, skipping tracking for ${stepName}`);
            return;
        }

        // Critical check: Verify config exists - this prevents the disable_all_events error
        try {
            const config = mixpanel.config;
            if (!config || typeof config !== 'object') {
                console.warn(`Mixpanel config not available, skipping tracking for ${stepName}`);
                isInitialized = false;
                return;
            }
        } catch (e) {
            console.warn(`Mixpanel config not accessible, skipping tracking for ${stepName}`);
            isInitialized = false;
            return;
        }

        // Additional check: verify get_distinct_id works (indicates internal state is ready)
        try {
            mixpanel.get_distinct_id();
        } catch (e) {
            console.warn(`Mixpanel internal state not ready (get_distinct_id failed), skipping tracking for ${stepName}`);
            isInitialized = false;
            return;
        }

        mixpanel.track(`${stepName} Filled`, {
            step: stepName,
            ...formData,
            product: editionData?.name,
            edition: editionData?.id,
            project: editionData?.project_name,
            form_variant: "web",
        });
    } catch (error) {
        // If error is about disable_all_events or config, mark as not initialized
        if (error.message && (error.message.includes('disable_all_events') || error.message.includes('config') || error.message.includes('undefined'))) {
            console.warn(`Mixpanel internal state not ready, marking as uninitialized: ${error.message}`);
            isInitialized = false;
        }
        // Silently handle the error to prevent it from breaking the app
        // The error is already logged, no need to throw or show to user
    }
}

export function trackPaymentStarted(formData, editionData) {
    // Only track on client-side
    if (typeof window === 'undefined') {
        return;
    }

    // Check if Mixpanel is ready before tracking
    if (!isMixpanelReady()) {
        console.warn('Mixpanel not initialized yet, skipping tracking for Payment started');
        return;
    }

    try {
        mixpanel.track("Payment started", {
            product: editionData?.name,
            edition: editionData?.id,
            project: editionData?.project_name,
            amount: editionData?.payment_schedule_info?.total_amount || 0,
            currency: "INR",
        });
    } catch (error) {
        console.error("Error tracking payment started:", error);
    }
}

export function trackPaymentCompleted(formData, editionData) {
    // Only track on client-side
    if (typeof window === 'undefined') {
        return;
    }

    // Check if Mixpanel is ready before tracking
    if (!isMixpanelReady()) {
        console.warn('Mixpanel not initialized yet, skipping tracking for Payment completed');
        return;
    }

    try {
        mixpanel.track("Payment completed", {
            product: editionData?.name,
            edition: editionData?.id,
            project: editionData?.project_name,
            amount: editionData?.payment_schedule_info?.total_amount || 0,
            currency: "INR",
        });
    } catch (error) {
        console.error("Error tracking payment completed:", error);
    }
}

export function mixpanelInit(otherParams, editionData) {
    // Only initialize on client-side
    if (typeof window === 'undefined') {
        return;
    }

    // Check if token exists
    if (!MIXPANEL_TOKEN) {
        console.warn('Mixpanel token is not configured. Please set NEXT_PUBLIC_MIXPANEL_TOKEN environment variable.');
        return;
    }

    // Don't re-initialize if already initialized
    if (isInitialized) {
        console.log('Mixpanel already initialized, skipping re-initialization');
        // Still register UTM params and track checkout if needed
        if (otherParams && isMixpanelReady()) {
            try {
                mixpanel.register_once({
                    utm_source: otherParams.ss_source,
                    utm_medium: otherParams.ss_medium,
                    utm_campaign: otherParams.ss_campaign,
                    utm_content: otherParams.ss_content,
                    utm_term: otherParams.ss_term,
                });
            } catch (error) {
                console.error("Error registering UTM parameters:", error);
            }
        }
        return;
    }

    // Initialize Mixpanel
    try {
        mixpanel.init(
            MIXPANEL_TOKEN,
            {
                autoCapture: true,
                debug: !prodMode,
                persistence: "localStorage",
                ignore_dnt: true,
            }
        );

        // Use a small delay to ensure Mixpanel's internal state is fully set up
        // Mixpanel.init() is synchronous but internal config setup might need a moment
        setTimeout(() => {
            // Verify initialization was successful before marking as ready
            try {
                if (!mixpanel || typeof mixpanel.track !== 'function') {
                    console.error("Mixpanel initialization verification failed");
                    isInitialized = false;
                    return;
                }

                // Critical check: Verify config exists - this prevents the disable_all_events error
                try {
                    const config = mixpanel.config;
                    if (!config || typeof config !== 'object') {
                        console.error("Mixpanel config not available, not ready yet");
                        isInitialized = false;
                        return;
                    }
                } catch (e) {
                    console.error("Mixpanel config not accessible, not ready yet");
                    isInitialized = false;
                    return;
                }

                // Verify that get_distinct_id works - this indicates internal state is ready
                try {
                    mixpanel.get_distinct_id();
                } catch (e) {
                    console.error("Mixpanel get_distinct_id failed, not ready yet");
                    isInitialized = false;
                    return;
                }

                // Test that tracking actually works by checking internal state
                // If we can't safely call track, don't mark as initialized
                isInitialized = true;

                // Register UTM parameters if provided
                if (otherParams) {
                    try {
                        mixpanel.register_once({
                            utm_source: otherParams.ss_source,
                            utm_medium: otherParams.ss_medium,
                            utm_campaign: otherParams.ss_campaign,
                            utm_content: otherParams.ss_content,
                            utm_term: otherParams.ss_term,
                        });
                    } catch (error) {
                        console.error("Error registering UTM parameters:", error);
                    }
                }

                // Track Checkout Started when someone lands on this page
                if (editionData) {
                    trackCheckoutStarted(editionData);
                }
            } catch (error) {
                console.error("Error in post-initialization setup:", error);
                isInitialized = false;
            }
        }, 300); // Delay to ensure Mixpanel's internal state is ready (increased to 300ms for safety)
    } catch (error) {
        console.error("Error initializing Mixpanel:", error);
        isInitialized = false;
        return;
    }
}

export function CleverTapInit() {
    // Only initialize on client-side
    if (typeof window === 'undefined') {
        console.log('[CleverTap] Skipping initialization - server-side');
        return;
    }

    console.log('[CleverTap] Initializing CleverTap...');
    console.log('[CleverTap] Checking for window.clevertap:', typeof window.clevertap);
    console.log('[CleverTap] Account ID:', process.env.NEXT_PUBLIC_CLEVERTAP_ACCOUNT_ID);

    const clevertap = getCleverTap();
    if (!clevertap) {
        console.warn('[CleverTap] CleverTap is not available - window.clevertap is undefined');
        console.warn('[CleverTap] Make sure the CleverTap script is loaded before calling CleverTapInit()');
        return;
    }

    console.log('[CleverTap] CleverTap object found, proceeding with initialization...');

    try {
        clevertap.privacy.push({ optOut: false }); // Set the flag to true, if the user of the device opts out of sharing their data
        console.log('[CleverTap] Privacy settings configured (optOut: false)');

        clevertap.privacy.push({ useIP: false });  // Set the flag to true, if the user agrees to share their IP data
        console.log('[CleverTap] Privacy settings configured (useIP: false)');

        const accountId = process.env.NEXT_PUBLIC_CLEVERTAP_ACCOUNT_ID;
        if (!accountId) {
            console.warn('[CleverTap] NEXT_PUBLIC_CLEVERTAP_ACCOUNT_ID is not set');
        } else {
            clevertap.account.push({ "id": accountId }, 'eu1');
            console.log('[CleverTap] Account configured with ID:', accountId);
        }

        clevertap.spa = true;
        console.log('[CleverTap] SPA mode enabled');
        console.log('[CleverTap] Initialization completed successfully');
    } catch (error) {
        console.error('[CleverTap] Error during initialization:', error);
    }
}