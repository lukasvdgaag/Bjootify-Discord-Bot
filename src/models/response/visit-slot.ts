export interface SimpleTreatmentAssignment {
    treatmentId: string;
    employeeId: string;
}

export interface VisitSlot {
    startDate: string; // iso date
    durationInMinutes: number; // minutes
    signature: string;
    treatmentAssignments: SimpleTreatmentAssignment[];
}