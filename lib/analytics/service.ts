import { MockAnalyticsProvider } from "./mock-provider";
import type { AnalyticsEvent } from "./types";
const provider = new MockAnalyticsProvider();
export function track(event: AnalyticsEvent) {
  try { provider.track(event); } catch { /* Analytics never interrupts the product. */ }
}
