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
 * Track genetic algorithm initialization
 */
export function trackInitialized(config: {
  targetLength: number;
  populationSize: number;
  survivalPercentage: number;
  mutationRate: number;
  characterSet: string;
  selectionStrategy: string;
}): void {
  track('ga_initialized', config);
}

/**
 * Track simulation start
 */
export function trackSimulationStarted(config: {
  targetLength: number;
  populationSize: number;
  stepDelay: number;
}): void {
  track('simulation_started', config);
}

/**
 * Track simulation completion
 */
export function trackSimulationCompleted(stats: {
  generations: number;
  targetLength: number;
  populationSize: number;
  finalDiversity: number;
}): void {
  track('simulation_completed', stats);
}

/**
 * Track preset selection
 */
export function trackPresetSelected(presetName: string): void {
  track('preset_selected', { preset: presetName });
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
  trackSimulationCompleted,
  trackPresetSelected,
  trackHelpOpened,
  trackHelpClosed,
};
