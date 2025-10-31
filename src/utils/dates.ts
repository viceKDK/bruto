/**
 * Date utilities centralizing UTC handling with date-fns helpers.
 * Guarantees all daily limit logic uses a consistent UTC baseline.
 */

import { differenceInSeconds } from 'date-fns';

/**
 * Returns a Date representing UTC midnight for the provided moment.
 */
export function getUtcDate(date: Date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * Returns next UTC midnight following the provided moment.
 */
export function getNextUtcMidnight(date: Date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));
}

/**
 * Format a date as YYYY-MM-DD using UTC boundaries.
 */
export function getUtcDateString(date: Date = new Date()): string {
  return getUtcDate(date).toISOString().slice(0, 10);
}

/**
 * Seconds remaining until the next UTC midnight from the provided moment.
 */
export function secondsUntilNextUtcMidnight(date: Date = new Date()): number {
  return Math.max(0, differenceInSeconds(getNextUtcMidnight(date), date));
}
