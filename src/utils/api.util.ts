import axios, {AxiosRequestConfig, AxiosResponse, Method} from 'axios';
import {SalonSearchResult} from "@models/response/salon-search-result";
import {
    COUNTRIES_PATH,
    GENERIC_EMPLOYEE_ID,
    SALON_BOOK_VISIT_PATH,
    SALON_DETAILS_PATH,
    SALON_ID_DETAILS_PATH,
    SALON_REVIEWS_PATH,
    SALON_SEARCH_CITY_PATH,
    SALON_TREATMENT_EMPLOYEES_PATH,
    SALON_TREATMENT_SLOTS_PATH,
    SALON_TREATMENTS_PATH
} from "@constants/api.constant";
import {SalonDetails} from "@models/response/salon-details";
import {SalonTreatmentCategory} from "@models/response/salon-treatment";
import {SalonReview} from "@models/response/salon-review";
import {SalonEmployee} from "@models/response/salon-employee";
import {SimpleTreatmentAssignment, VisitSlot} from "@models/response/visit-slot";
import {VisitSlotsRequest} from "@models/request/visit-slots-request.model";
import {CustomerCountry} from "@models/response/customer-country";
import {BookVisitRequest, TreatmentAssignment} from "@models/request/book-visit-request.model";
import {Gender} from "@enums/gender";
import {PaymentType} from "@enums/payment-type";

export type ApiResponse<T> = {
    data: T;
    status: number;
    statusText: string;
}

export const fetchApi = async <T>(
    url: string,
    method: Method,
    data?: any,
    config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
    const response: AxiosResponse<T> = await axios.request<T>({
        ...config,
        url,
        method,
        data,
    });
    console.log('response', response)

    return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
    };
}

export const fetchSalonsInCity = async (
    city: string
): Promise<ApiResponse<SalonSearchResult[]>> => {
    return fetchApi<SalonSearchResult[]>(SALON_SEARCH_CITY_PATH(city), 'GET');
}

export const fetchSalonDetailsByCityAndSlug = async (
    city: string,
    salonSlug: string
): Promise<ApiResponse<SalonDetails>> => {
    return fetchApi<SalonDetails>(SALON_DETAILS_PATH(city, salonSlug), 'GET');
}

export const fetchSalonDetailsById = async (
    salonId: string
): Promise<ApiResponse<SalonDetails>> => {
    return fetchApi<SalonDetails>(SALON_ID_DETAILS_PATH(salonId), 'GET');
}

export const fetchSalonTreatments = async (
    salonId: string
): Promise<ApiResponse<SalonTreatmentCategory[]>> => {
    return fetchApi<SalonTreatmentCategory[]>(SALON_TREATMENTS_PATH(salonId), 'GET');
}

export const fetchSalonReviews = async (
    salonId: string
): Promise<ApiResponse<SalonReview[]>> => {
    return fetchApi<SalonReview[]>(SALON_REVIEWS_PATH(salonId), 'GET');
}

export const fetchSalonTreatmentEmployees = async (
    salonId: string,
    treatmentId: string
): Promise<ApiResponse<SalonEmployee[]>> => {
    return fetchApi<SalonEmployee[]>(SALON_TREATMENT_EMPLOYEES_PATH(salonId, treatmentId), 'GET');
}

export const fetchSalonTreatmentSlots = async (
    salonId: string,
    startDate: Date = new Date(),
    endDate: Date = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    treatments: string[],
    employees: string[] = [GENERIC_EMPLOYEE_ID]
): Promise<ApiResponse<VisitSlot[]>> => {
    const treatmentAssignments: SimpleTreatmentAssignment[] = employees.flatMap(
        employeeId => treatments.map(treatmentId => ({
            treatmentId,
            employeeId
        }))
    );

    const requests = await Promise.all(treatmentAssignments.map(treatmentAssignment => (
        fetchApi<VisitSlot[]>(SALON_TREATMENT_SLOTS_PATH(salonId), 'POST', {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            isNewCustomer: false,
            treatmentAssignments: [treatmentAssignment],
        } as VisitSlotsRequest)
    )));

    return {
        data: requests.flatMap(request => request.data),
        status: requests[0].status,
        statusText: requests[0].statusText,
    };
}

export const fetchCountries = async (): Promise<ApiResponse<CustomerCountry[]>> => {
    return fetchApi<CustomerCountry[]>(COUNTRIES_PATH, 'GET');
}

export const bookVisit = async (
    salonId: string,
    firstName: string,
    nameInfix: string = "",
    lastName: string,
    mobile: string,
    country: CustomerCountry,
    gender: Gender,
    email: string,
    treatment: TreatmentAssignment,
    visitSlot: VisitSlot,
    remark?: string,
): Promise<ApiResponse<any>> => {
    return fetchApi(SALON_BOOK_VISIT_PATH, 'POST', {
        salonId,
        customerId: null,
        customerFirstName: firstName,
        customerNameInfix: nameInfix,
        customerLastName: lastName,
        customerMobile: mobile,
        customerCountry: country,
        customerGender: gender,
        customerEmail: email,
        customerPassword: "",
        createCustomerAccount: false,
        remark: remark || "",
        isNewCustomer: false,
        treatmentAssignments: [treatment],
        visitSlot,
        bookedWithWidget: false,
        paymentType: PaymentType.IN_SALON,
        adviceRequested: false,
    } as BookVisitRequest);
}

