import type { Character } from "../../types/character";
export declare const defaultCharacterCapabilities: {
    readonly canSuggestFood: true;
    readonly canSuggestCafe: true;
    readonly canSuggestHistory: true;
    readonly canSuggestNature: true;
    readonly canSuggestWorkSpot: true;
    readonly canSuggestActivity: true;
    readonly canGuideAreaMode: true;
};
export declare function createDefaultCharacter(characterId: string, now: string): Character;
