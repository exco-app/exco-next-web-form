import mixpanel from "mixpanel-browser";
import { MIXPANEL_TOKEN, prodMode } from "../config";

const clevertap = window.clevertap;

export function trackCheckoutStarted(editionData) {
    try {
        mixpanel.track("Checkout Started", {
            product: editionData?.name,
            edition: editionData?.id,
            project: editionData.project_name,
            form_variant: "web",
        });
    } catch (error) {
        console.error("Error tracking checkout started:", error);
    }
}

export function trackCheckoutStep(stepNumber, formData) {
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
    try {
        mixpanel.track(`${stepName} Filled`, {
            step: stepName,
            ...formData,
            product: editionData?.name,
            edition: editionData?.id,
            project: editionData.project_name,
            form_variant: "web",
        });
    } catch (error) {
        console.error(`Error tracking ${stepName} filled:`, error);
    }
}

export function trackPaymentStarted(formData, editionData) {
    try {
        mixpanel.track("Payment started", {
            product: editionData?.name,
            edition: editionData?.id,
            project: editionData.project_name,
            amount: editionData?.payment_schedule_info?.total_amount || 0,
            currency: "INR",
        });
    } catch (error) {
        console.error("Error tracking payment started:", error);
    }
}

export function trackPaymentCompleted(formData, editionData) {
    try {
        mixpanel.track("Payment completed", {
            product: editionData?.name,
            edition: editionData?.id,
            project: editionData.project_name,
            amount: editionData?.payment_schedule_info?.total_amount || 0,
            currency: "INR",
        });
    } catch (error) {
        console.error("Error tracking payment completed:", error);
    }
}

export function mixpanelInit(otherParams, editionData) {
    mixpanel.init(
        MIXPANEL_TOKEN,
        {
            autoCapture: true,
            debug: !prodMode,
            persistence: "localStorage",
            ignore_dnt: true,
        }
    );
    mixpanel.register_once({
        utm_source: otherParams.ss_source,
        utm_medium: otherParams.ss_medium,
        utm_campaign: otherParams.ss_campaign,
        utm_content: otherParams.ss_content,
        utm_term: otherParams.ss_term,
    })

    // Track Checkout Started when someone lands on this page
    trackCheckoutStarted(editionData);
}

export function CleverTapInit() {
    clevertap.privacy.push({ optOut: false }) // Set the flag to true, if the user of the device opts out of sharing their data
    clevertap.privacy.push({ useIP: false })  // Set the flag to true, if the user agrees to share their IP data
    clevertap.account.push({ "id": process.env.REACT_APP_CLEVERTAP_ACCOUNT_ID }, 'eu1')
    clevertap.spa = true
}