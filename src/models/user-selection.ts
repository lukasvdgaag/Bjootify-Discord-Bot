export class UserSelection {
    userId: string;
    selectedSalonId?: string;
    selectedTreatmentId?: string;

    constructor(userId: string) {
        this.userId = userId;
    }

    selectSalon(salonId: string): void {
        this.selectedSalonId = salonId;
    }

    selectTreatment(treatmentId: string): void {
        this.selectedTreatmentId = treatmentId;
    }

    clearSelections(): void {
        this.selectedSalonId = undefined;
        this.selectedTreatmentId = undefined;
    }

}