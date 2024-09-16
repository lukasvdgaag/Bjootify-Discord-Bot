import {CustomerCountry} from "@models/response/customer-country";
import {Gender} from "@enums/gender";
import {SalonTreatment} from "@models/response/salon-treatment";
import {SalonEmployee} from "@models/response/salon-employee";
import {VisitSlot} from "@models/response/visit-slot";
import {PaymentType} from "@enums/payment-type";

export interface TreatmentAssignment {
    treatment: SalonTreatment;
    employee: SalonEmployee;
    id: string;
    isCollapsed: boolean // true
}

export interface BookVisitRequest {
    salonId: string;
    customerId: string | null;
    customerFirstName: string;
    customerLastName: string;
    customerNameInfix: string; // Tussenvoegsel
    customerMobile: string; // Format: +31611223344
    customerCountry: CustomerCountry;
    customerGender: Gender;
    customerEmail: string;
    customerPassword: string; // can be empty
    createCustomerAccount: boolean; // false
    remark: string; // can be empty
    isNewCustomer: boolean;
    treatmentAssignments: TreatmentAssignment[];
    visitSlot: VisitSlot;
    bookedWithWidget: boolean; // false
    paymentType: PaymentType; // 1 ?
    adviceRequested: boolean // false
}