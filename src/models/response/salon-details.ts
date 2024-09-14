export interface SalonTimeSlot {
    start: string; // 09:00:00
    end: string;
}

export interface SalonSchedule {
    dayOfWeek: number;
    timeSlots: SalonTimeSlot[];
}

export interface SalonDepartment {
    name: string;
    id: number;
}

export interface SalonPageMessage {
    isActive: boolean;
    messageContent: string;
}

export interface SalonDetails {
    id: string;
    name: string;
    description: string;
    street: string;
    houseNumber: number;
    houseNumberSub: string;
    postCode: string;
    city: string;
    phoneNumber: string;
    email: string;
    website: string;
    twitter: string;
    facebook: string;
    logoUrl: string;
    photoUrl: string;
    alias: string;
    allowsOnlinePayments: boolean;
    allowsCustomerAdviceRequest: boolean;
    allowsBookingMultipleTreatmentsOnline: boolean;
    allowsGifts: boolean;
    newCustomersAllowed: boolean;
    schedule: SalonSchedule[];
    departments: SalonDepartment[];
    modules: number[];
    salonPageMessage: SalonPageMessage;
    averageRating: number;
    salonAverageRating: number;
    employeesAverageRating: number;
    treatmentsAverageRating: number;
    reviewsCount: number;
    websiteTheme: number;
}