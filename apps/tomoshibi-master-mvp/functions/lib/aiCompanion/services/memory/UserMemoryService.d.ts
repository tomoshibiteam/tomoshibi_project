import type { FeedbackEvent } from "../../types/events";
import type { User } from "../../types/user";
export declare class UserMemoryService {
    applyFeedbackSignal(user: User, event: FeedbackEvent): User;
}
