export type PartnerLink = {
    id: string;
    type: "restaurant" | "hotel" | "activity" | "coupon" | "official";
    provider: "hotpepper" | "rakuten" | "veltra" | "klook" | "own_partner" | "official";
    placeId?: string;
    areaId?: string;
    url: string;
    label: string;
    trackingEnabled: boolean;
    createdAt: string;
    updatedAt: string;
};
