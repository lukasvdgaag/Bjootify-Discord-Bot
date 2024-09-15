export interface SalonTreatment {
    id: string;
    name: string;
    price: string;
    isPriceInaccurate: boolean;
    isPriceVisibleForOnlineBooking: boolean;
    isDurationVisibleForOnlineBooking: boolean;
    durationInMinutes: number;
    mandatoryDownPayment: number;
}

export interface SalonTreatmentCategory {
    name: string;
    treatments: SalonTreatment[];
}