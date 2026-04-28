"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventLogService = void 0;
const AnalyticsEventRepository_1 = require("../../repositories/AnalyticsEventRepository");
const ids_1 = require("../../utils/ids");
const time_1 = require("../../utils/time");
class EventLogService {
    analyticsEventRepository;
    constructor(analyticsEventRepository = new AnalyticsEventRepository_1.AnalyticsEventRepository()) {
        this.analyticsEventRepository = analyticsEventRepository;
    }
    async log(input) {
        await this.analyticsEventRepository.create({
            id: (0, ids_1.createId)("event"),
            name: input.name,
            userId: input.userId,
            sessionId: input.sessionId,
            characterId: input.characterId,
            metadata: input.metadata,
            createdAt: input.createdAt ?? (0, time_1.nowIso)(),
        });
    }
}
exports.EventLogService = EventLogService;
//# sourceMappingURL=EventLogService.js.map