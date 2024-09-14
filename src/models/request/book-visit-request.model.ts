import {CustomerCountry} from "../response/customer-country";
import {Gender} from "../../enums/gender";
import {SalonTreatment} from "../response/salon-treatment";
import {SalonEmployee} from "../response/salon-employee";
import {VisitSlot} from "../response/visit-slot";

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
    paymentType: number; // 1 ?
    adviceRequested: boolean // false
}