import type { FeedbackEvent } from "../../types/events";
import type { JourneyMemory } from "../../types/memory";
import type { Relationship } from "../../types/relationship";
export declare class RelationshipService {
    recordSessionStarted(relationship: Relationship, now: string): Relationship;
    applyFeedbackSignal(relationship: Relationship, event: FeedbackEvent, now: string): Relationship;
    recordJourneyCompleted(relationship: Relationship, journeyMemory: JourneyMemory, now: string): Relationship;
}
