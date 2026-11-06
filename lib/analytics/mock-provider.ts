import { analyticsEvents, type AnalyticsEvent, type AnalyticsProvider } from "./types";
/** Name-only allowlist; no payload, identity, URL or private content is accepted. */
export class MockAnalyticsProvider implements AnalyticsProvider {
  track(event: AnalyticsEvent) {
    if (!analyticsEvents.includes(event)) return;
    if (process.env.NODE_ENV === "development") console.info("[MockAnalytics]", { event, occurredAt: new Date().toISOString() });
  }
}
