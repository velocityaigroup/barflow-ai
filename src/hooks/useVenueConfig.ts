'use client';

export interface VenueConfig {
  /** Display name of the venue — from NEXT_PUBLIC_VENUE_NAME env var. */
  venueName:  string;
  /** Business / tenant identifier — from NEXT_PUBLIC_BUSINESS_ID env var. */
  businessId: string;
  /** Currency symbol displayed on prices — from NEXT_PUBLIC_CURRENCY env var. */
  currency:   string;
  /** IANA timezone string — from NEXT_PUBLIC_TIMEZONE env var. */
  timezone:   string;
}

/**
 * useVenueConfig
 *
 * Returns all venue-level configuration derived from Next.js public env vars.
 * Provides sensible defaults so the app is always presentation-ready even
 * without a .env.local file.
 *
 * To configure a new venue, set these in .env.local (or your hosting dashboard):
 *   NEXT_PUBLIC_VENUE_NAME=Velocity Beach Club
 *   NEXT_PUBLIC_BUSINESS_ID=velocity-beach-001
 *   NEXT_PUBLIC_CURRENCY=€
 *   NEXT_PUBLIC_TIMEZONE=Europe/Lisbon
 */
export function useVenueConfig(): VenueConfig {
  return {
    venueName:  process.env.NEXT_PUBLIC_VENUE_NAME  || 'Velocity Beach Club',
    businessId: process.env.NEXT_PUBLIC_BUSINESS_ID || 'demo',
    currency:   process.env.NEXT_PUBLIC_CURRENCY    || '€',
    timezone:   process.env.NEXT_PUBLIC_TIMEZONE    || 'Europe/Lisbon',
  };
}
