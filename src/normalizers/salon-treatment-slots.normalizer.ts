import {VisitSlot} from "@models/response/visit-slot";

export interface NormalizedSalonTreatmentDates {
    [date: string]: VisitSlot[];
}

export const normalizeSalonTreatmentSlots = (slots: VisitSlot[]): NormalizedSalonTreatmentDates => {
    const dateMap = new Map<string, VisitSlot[]>();

    slots.forEach(slot => {
        const date = new Date(slot.startDate).toISOString().split('T')[0];
        if (!dateMap.has(date)) {
            dateMap.set(date, []);
        }
        dateMap.get(date)!.push(slot);
    });

    const sortedDates = Array.from(dateMap.keys())
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return sortedDates.reduce((acc, date) => {
        acc[date] = dateMap.get(date)!;
        return acc;
    }, {} as NormalizedSalonTreatmentDates);
}