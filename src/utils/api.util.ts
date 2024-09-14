import axios, {AxiosRequestConfig, AxiosResponse, Method} from 'axios';

export type ApiResponse<T> = {
    data: T;
    status: number;
    statusText: string;
}

export const fetchApi = async <T>(url: string, method: Method, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response: AxiosResponse<T> = await axios.request<T>({
        url,
        method,
        data,
        ...config,
    });

    return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
    };
}