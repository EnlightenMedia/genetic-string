/**
 * Application-specific analytics tracking
 * Uses the generic Simple Analytics module for the core functionality
 */

import { track, trackButtonClick as genericTrackButtonClick } from './simpleAnalytics';

/**
 * Track button click
 */
export function trackButtonClick(buttonName: string): void {
  genericTrackButtonClick(buttonName);
}

/**
 * Track grid initialization
 */
export function trackInitialized(config: {
  height: number;
  width: number;
  foodCount: number;
  cellCount: number;
  maxValue: number;
  energy: number;
  cellsDie: boolean;
  allowRandomMove: boolean;
  cannibalMode: boolean;
}): void {
  track('grid_initialized', config);
}

/**
 * Track simulation start
 */
export function trackSimulationStarted(delay: number): void {
  track('simulation_started', { delay });
}

/**
 * Track help modal events
 */
export function trackHelpOpened(): void {
  track('help_opened');
}

export function trackHelpClosed(method: 'close_button' | 'backdrop_click' | 'escape_key'): void {
  track('help_closed', { method });
}

/**
 * Analytics object for convenient access to all tracking functions
 */
export const analytics = {
  track,
  trackButtonClick,
  trackInitialized,
  trackSimulationStarted,
  trackHelpOpened,
  trackHelpClosed,
};
