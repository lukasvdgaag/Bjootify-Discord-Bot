import {SimpleTreatmentAssignment} from "@models/response/visit-slot";

export interface VisitSlotsRequest {
    startDate: string; // iso
    endDate: string; // iso
    isNewCustomer: boolean;
    treatmentAssignments: SimpleTreatmentAssignment[];
}