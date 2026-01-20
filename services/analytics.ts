import posthog from 'posthog-js';

// Initialize PostHog
export const initAnalytics = () => {
    // Only initialize if a key is present (prevents errors in dev if not set)
    // In a real env, you might default to a dev key or check process.env.NODE_ENV
    if (process.env.POSTHOG_API_KEY) {
        posthog.init(process.env.POSTHOG_API_KEY, {
            api_host: process.env.POSTHOG_HOST || 'https://us.i.posthog.com',
            person_profiles: 'identified_only', // Save money/privacy by not profiling anonymous users excessively
            capture_pageview: false, // We will manually track pageviews in the React router
            autocapture: true // Automatically track clicks, inputs, etc.
        });
    } else {
        console.warn("PostHog API Key not found. Analytics disabled.");
    }
};

// Track a specific event
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (process.env.POSTHOG_API_KEY) {
        posthog.capture(eventName, properties);
    }
};

// Identify a signed-in user
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
    if (process.env.POSTHOG_API_KEY) {
        posthog.identify(userId, traits);
    }
};

// Reset tracker on logout
export const resetAnalytics = () => {
    if (process.env.POSTHOG_API_KEY) {
        posthog.reset();
    }
};

export default posthog;