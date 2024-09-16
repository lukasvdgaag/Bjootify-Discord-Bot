export const BASE_URL = 'https://bjootify.com/api';

export const SALON_SEARCH_CITY_PATH = (city: string) => `${BASE_URL}/search/city/${city}/department/94`;
export const SALON_DETAILS_PATH = (city: string, salonSlug: string) => `${BASE_URL}/salons/city/${city}/salon/${salonSlug}/details`;
export const SALON_ID_DETAILS_PATH = (salonId: string) => `${BASE_URL}/salons/${salonId}/details`;
export const SALON_TREATMENTS_PATH = (salonId: string) => `${BASE_URL}/salontreatments/${salonId}/treatments`;
export const SALON_REVIEWS_PATH = (salonId: string) => `${BASE_URL}/salons/${salonId}/reviews`;
export const SALON_TREATMENT_EMPLOYEES_PATH = (salonId: string, treatmentId: string) => `${BASE_URL}/salonEmployees/${salonId}/treatment/${treatmentId}`;
export const SALON_TREATMENT_SLOTS_PATH = (salonId: string) => `${BASE_URL}/visitSlots/${salonId}/slots`;
export const SALON_BOOK_VISIT_PATH = `${BASE_URL}/bookvisit`;
export const COUNTRIES_PATH = `${BASE_URL}/countries/all`;

export const GENERIC_EMPLOYEE_ID = '00000000-0000-0000-0000-000000000000';
