"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickTrackingService = void 0;
const OutboundClickRepository_1 = require("../../repositories/OutboundClickRepository");
const ids_1 = require("../../utils/ids");
const time_1 = require("../../utils/time");
const EventLogService_1 = require("./EventLogService");
class ClickTrackingService {
    outboundClickRepository;
    eventLogService;
    constructor(outboundClickRepository = new OutboundClickRepository_1.OutboundClickRepository(), eventLogService = new EventLogService_1.EventLogService()) {
        this.outboundClickRepository = outboundClickRepository;
        this.eventLogService = eventLogService;
    }
    async track(input) {
        const now = (0, time_1.nowIso)();
        const clickId = (0, ids_1.createId)("click");
        await this.outboundClickRepository.create(omitUndefined({
            id: clickId,
            ...input,
            createdAt: now,
        }));
        await this.eventLogService.log({
            name: "outbound_clicked",
            userId: input.userId,
            sessionId: input.sessionId,
            metadata: omitUndefined({ clickId, placeId: input.placeId, partnerLinkId: input.partnerLinkId, source: input.source }),
            createdAt: now,
        });
        return { redirectUrl: input.url };
    }
}
exports.ClickTrackingService = ClickTrackingService;
function omitUndefined(value) {
    return Object.fromEntries(Object.entries(value).filter(([, entryValue]) => entryValue !== undefined));
}
//# sourceMappingURL=ClickTrackingService.js.map