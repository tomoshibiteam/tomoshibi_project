"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceAnnotationMergeService = void 0;
class PlaceAnnotationMergeService {
    merge(places, annotations) {
        return places.map((place) => {
            const annotation = findAnnotation(place, annotations);
            if (!annotation) {
                return place;
            }
            return {
                ...place,
                tomoshibiTags: mergeUnique(place.tomoshibiTags ?? [], annotation.tomoshibiTags),
                localStory: annotation.localStory ?? place.localStory,
                partnerLinkIds: mergeUnique(place.partnerLinkIds ?? [], annotation.partner?.linkIds ?? []),
            };
        });
    }
}
exports.PlaceAnnotationMergeService = PlaceAnnotationMergeService;
function findAnnotation(place, annotations) {
    return annotations.find((annotation) => annotation.providerPlaceId === place.providerPlaceId) ??
        annotations.find((annotation) => annotation.name.trim().toLowerCase() === place.name.trim().toLowerCase());
}
function mergeUnique(first, second) {
    return [...new Set([...first, ...second])];
}
//# sourceMappingURL=PlaceAnnotationMergeService.js.map