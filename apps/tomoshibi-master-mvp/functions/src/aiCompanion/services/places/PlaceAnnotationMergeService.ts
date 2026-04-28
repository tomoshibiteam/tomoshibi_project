import type { NormalizedPlace, PlaceAnnotation } from "../../types/place";

export class PlaceAnnotationMergeService {
  merge(places: NormalizedPlace[], annotations: PlaceAnnotation[]): NormalizedPlace[] {
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

function findAnnotation(place: NormalizedPlace, annotations: PlaceAnnotation[]): PlaceAnnotation | undefined {
  return annotations.find((annotation) => annotation.providerPlaceId === place.providerPlaceId) ??
    annotations.find((annotation) => annotation.name.trim().toLowerCase() === place.name.trim().toLowerCase());
}

function mergeUnique(first: string[], second: string[]): string[] {
  return [...new Set([...first, ...second])];
}
