export type FeedbackEventType = "liked" | "not_interested" | "saved" | "skipped" | "visited" | "arrived" | "message_sent" | "route_selected";
export type FeedbackEvent = {
    id: string;
    userId: string;
    sessionId: string;
    characterId?: string;
    placeId?: string;
    routeId?: string;
    type: FeedbackEventType;
    metadata?: Record<string, unknown>;
    createdAt: string;
};
export type AnalyticsEventName = "session_started" | "route_suggested" | "route_selected" | "place_card_viewed" | "place_saved" | "place_skipped" | "place_liked" | "place_visited" | "companion_message_sent" | "outbound_clicked" | "journey_completed";
export type AnalyticsEvent = {
    id: string;
    name: AnalyticsEventName;
    userId?: string;
    sessionId?: string;
    characterId?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
};
export type OutboundClick = {
    id: string;
    userId: string;
    sessionId: string;
    placeId?: string;
    partnerLinkId?: string;
    url: string;
    source: "place_card" | "companion_message" | "route_detail" | "journey_recap";
    createdAt: string;
};
