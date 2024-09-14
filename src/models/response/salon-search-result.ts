export interface SalonDepartment {
    name: string;
    id: number;
}

export interface SalonSearchResult {
    salonName: string;
    salonNameAlias: string;
    pictureUrl: string;
    logoUrl: string;
    salonCity: string;
    salonStreet: string;
    salonHouseNumber: string;
    salonHouseSubNumber: string;
    salonDepartments: SalonDepartment[];
    hasBjootifyPlus: boolean;
    averageRating: number;
    reviewsCount: number;
    allowsGifts: boolean;
    distanceFromSearchedCity: boolean;
}