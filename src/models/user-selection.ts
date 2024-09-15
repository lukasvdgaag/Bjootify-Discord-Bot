export class UserSelection {
    userId: string;
    selectedCity?: string;
    selectedSalonName?: string;
    selectedSalonId?: string;
    selectedTreatmentId?: string;

    constructor(userId: string) {
        this.userId = userId;
    }

    selectCity(city: string): UserSelection {
        this.selectedCity = city;
        return this;
    }

    selectSalonName(salonName: string): UserSelection {
        this.selectedSalonName = salonName;
        return this;
    }

    selectSalon(salonId: string): UserSelection {
        this.selectedSalonId = salonId;
        return this;
    }

    selectTreatment(treatmentId: string): UserSelection {
        this.selectedTreatmentId = treatmentId;
        return this;
    }

    clearSelections(): UserSelection {
        this.selectedSalonId = undefined;
        this.selectedTreatmentId = undefined;
        return this;
    }

}