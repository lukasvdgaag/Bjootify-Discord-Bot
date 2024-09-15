import {SalonSearchResult} from "../models/response/salon-search-result";

export const formatRating = (rating: number): string => {
    return '⭐️'.repeat(Math.round(rating * 2) / 2);
}

export const formatNumber = (number: number, decimals: number = 0): string => {
    return number.toFixed(decimals);
}

export const getReviewLine = (salon: SalonSearchResult) => {
    return salon.reviewsCount === 0 ? '*No reviews*' : `${formatRating(salon.averageRating)} (${formatNumber(salon.averageRating, 1)}) - ${formatNumber(salon.reviewsCount)} reviews`;
}

export const getLocationLine = (salon: SalonSearchResult) => {
    const location = `${salon.salonStreet} ${salon.salonHouseNumber}${salon.salonHouseSubNumber}, ${salon.salonCity}`;
    const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(location)}`;
    return `${location} [(Show on Map)](${mapsUrl})`;
}