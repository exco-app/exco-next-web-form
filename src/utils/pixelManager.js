import { prodMode } from '../config';

// Lazy load react-facebook-pixel only on client-side
let ReactPixel = null;
const loadReactPixel = async () => {
  if (typeof window === 'undefined') return null;
  if (ReactPixel) return ReactPixel;
  try {
    ReactPixel = (await import('react-facebook-pixel')).default;
    return ReactPixel;
  } catch (error) {
    console.error('[Pixel] Failed to load react-facebook-pixel:', error);
    return null;
  }
};

// promise that resolves once window.fbq is available
export const fbqReady = typeof window !== 'undefined'
  ? new Promise(resolve => {
    const check = () => {
      if (window.fbq) return resolve();
      setTimeout(check, 50);
    };
    check();
  })
  : Promise.resolve(); // Resolve immediately on server-side

// Simple pixel manager without localStorage
let currentPixelId = null;

export function trackMetaEvent(eventName, payload = {}, eventId) {
  if (typeof window === 'undefined') {
    return Promise.resolve(); // Skip on server-side
  }

  return fbqReady
    .then(() => {
      console.log('[Pixel Debug] trackMetaEvent called with eventId:', eventId, 'window.fbEventId:', window.fbEventId, 'sessionStorage:', sessionStorage.getItem('fbEventId'));
      const finalEventId =
        eventId ||
        window.fbEventId ||
        sessionStorage.getItem('fbEventId');

      if (!window.fbq) {
        console.warn('[Meta] fbq never loaded, skipping', eventName);
        return;
      }

      if (finalEventId) {
        window.fbq('track', eventName, payload, { eventID: finalEventId });
        console.log(`[Meta] fbq('track', ${eventName}, payload, { eventID: ${finalEventId} })`);
      } else {
        window.fbq('track', eventName, payload);
        console.log(`[Meta] fbq('track', ${eventName}, payload)`);
      }
    })
    .catch(() => {
      console.warn('[Meta] fbq promise rejected, skipping', eventName);
    });
}

export const initializePixel = async (pixelId, projectName, eventId = null) => {
  if (typeof window === 'undefined') {
    return false; // Skip on server-side
  }

  console.log(`[Pixel Debug] initializePixel called with pixelId: ${pixelId}, projectName: ${projectName}`);
  console.log(`[Pixel Debug] currentPixelId: ${currentPixelId}`);

  if (currentPixelId !== pixelId) {
    // Clear any existing pixel initialization before initializing new one
    if (currentPixelId) {
      console.log(`[Pixel] Switching from pixel ${currentPixelId} to ${pixelId} for ${projectName}`);
    }

    try {
      // Dynamically load react-facebook-pixel if not already loaded
      const Pixel = await loadReactPixel();
      if (!Pixel) {
        console.error(`[Pixel Error] Failed to load react-facebook-pixel`);
        return false;
      }

      console.log(`[Pixel Debug] Calling ReactPixel.init with pixelId: ${pixelId}`);
      Pixel.init(pixelId, {}, { autoConfig: true });
      console.log(`[Pixel Debug] ReactPixel.init completed`);
      // DO NOT fire PageView here!
      currentPixelId = pixelId;
      console.log(`[Pixel] Initialized for ${projectName}`);
      return true; // New initialization
    } catch (error) {
      console.error(`[Pixel Error] Failed to initialize pixel:`, error);
      return false;
    }
  } else {
    console.log(`[Pixel] Pixel already initialized for ${projectName}, skipping re-initialization`);
    return false; // Already initialized
  }
};

export const getCurrentPixelId = () => currentPixelId;

// Deprecated: Use trackMetaEvent for all Meta events
export const trackEvent = (eventName, data = {}, options = {}) => {
  const eventId = options.eventID;
  trackMetaEvent(eventName, data, eventId);
};

// Function to clear current pixel (useful for testing)
export const clearPixel = () => {
  currentPixelId = null;
  console.log('[Pixel] Pixel cleared');
};

export const RAZORPAY = !prodMode
  ? "rzp_test_RFqSbGEC7bSyAF"
  : "rzp_live_Ng7hAhOr51ajEB";