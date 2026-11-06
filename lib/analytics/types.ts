export const analyticsEvents = ["creation_started", "creation_completed", "creation_failed", "free_creation_used", "free_quota_exhausted", "paywall_viewed", "checkout_started", "purchase_completed", "artwork_downloaded", "share_card_created", "artwork_shared", "regeneration_used"] as const;
export type AnalyticsEvent = typeof analyticsEvents[number];
export interface AnalyticsRecord { event: AnalyticsEvent; occurredAt: string }
export interface AnalyticsProvider { track(event: AnalyticsEvent): void }
