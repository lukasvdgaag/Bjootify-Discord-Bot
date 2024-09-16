import {SalonSearchResult} from "@models/response/salon-search-result";
import {SalonDetails, SalonSchedule} from "@models/response/salon-details";
import {SalonTreatment} from "@models/response/salon-treatment";

export const formatRating = (rating: number): string => {
    return '⭐️'.repeat(Math.round(rating * 2) / 2);
}

export const formatNumber = (number: number, decimals: number = 0): string => {
    return number.toFixed(decimals);
}

export const getReviewLine = (salon: SalonSearchResult | SalonDetails) => {
    return salon.reviewsCount === 0 ? '*No reviews*' : `${formatRating(salon.averageRating)} (${formatNumber(salon.averageRating, 1)}) - ${formatNumber(salon.reviewsCount)} reviews`;
}

export const getAddressLine = (salon: SalonSearchResult | SalonDetails) => {
    let location;
    if ('salonStreet' in salon) {
        location = `${salon.salonStreet} ${salon.salonHouseNumber}${salon.salonHouseSubNumber}, ${salon.salonCity}`;
    } else {
        location = `${salon.street} ${salon.houseNumber}${salon.houseNumberSub}, ${salon.postCode} ${salon.city}`;
    }

    const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(location)}`;
    return `${location} [(Show on Map)](${mapsUrl})`;
}

export const getScheduleLine = (salon: SalonSchedule[]): string => {
    // format schedule as "Monday: 09:00 - 18:00\nTuesday: 09:00 - 18:00\n..."
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const maxLength = Math.max(...days.map(day => day.length));
    // match dayOfWeek to day name. If a day is missing, it means the salon is closed on that day
    const schedule = days.map((day, index) => {
        const paddedDay = day.padEnd(maxLength, ' ');
        const daySchedule = salon.find(s => s.dayOfWeek === index);
        if (daySchedule) {
            return `${paddedDay}: ${daySchedule.timeSlots.map(slot => `${slot.start} - ${slot.end}`).join(', ')}`;
        }
        return `${paddedDay}: Closed`;
    });

    return "```\n" + schedule.join('\n') + "\n```";
}

export const formatTreatmentsLine = (treatments: SalonTreatment[], query: string | null) => {
    return treatments.map(treatment => {
        let highlightedName = treatment.name;
        if (query) {
            const regex = new RegExp(`(${query})`, 'gi');
            highlightedName = treatment.name.replace(regex, '__$1__');
        }
        return `**${highlightedName}** - ${treatment.durationInMinutes} minutes${treatment.isPriceVisibleForOnlineBooking ? ` - €${formatNumber(Number.parseInt(treatment.price, 2))}` : ''}`
    }).join('\n');
}