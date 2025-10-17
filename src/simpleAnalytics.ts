/**
 * Generic Simple Analytics integration for event tracking
 * Docs: https://docs.simpleanalytics.com/events
 *
 * This is a reusable module that can be used in any project with Simple Analytics.
 */

// Extend window type for Simple Analytics
declare global {
  interface Window {
    sa_event?: (eventName: string, metadata?: Record<string, any>) => void;
  }
}

/**
 * Track an event using Simple Analytics
 * @param eventName - The name of the event to track
 * @param metadata - Optional metadata object to include with the event
 */
export function track(eventName: string, metadata?: Record<string, any>): void {
  // Send to Simple Analytics if available
  if (typeof window !== 'undefined' && window.sa_event) {
    try {
      window.sa_event(eventName, metadata);
    } catch (e) {
      console.warn('Simple Analytics tracking failed:', e);
    }
  }
}

/**
 * Generic button click tracking
 * @param buttonName - The name/identifier of the button clicked
 * @param additionalData - Optional additional metadata
 */
export function trackButtonClick(buttonName: string, additionalData?: Record<string, any>): void {
  track('button_click', { button: buttonName, ...additionalData });
}
