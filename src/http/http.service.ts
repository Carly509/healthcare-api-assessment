import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import axiosRetry from 'axios-retry';

@Injectable()
export class HttpService {
  private readonly axiosInstance: AxiosInstance;

  constructor(private configService: ConfigService) {
    const baseURL = this.configService.get<string>('api.baseUrl');
    const apiKey = this.configService.get<string>('api.apiKey');

    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'x-api-key': apiKey ?? '',
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    axiosRetry(this.axiosInstance, {
      retries: 3,
      retryDelay: (retryCount: number, error: AxiosError) => {
        if (error.response?.status === 429) {
          const data = error.response.data as
            | { retry_after?: number }
            | undefined;
          const retryAfter = data?.retry_after ?? 5;
          return retryAfter * 1000;
        }
        return retryCount * 1000;
      },
      retryCondition: (error: AxiosError) => {
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          [429, 500, 503].includes(error.response?.status ?? 0)
        );
      },
    });

    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        console.log(`${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error: AxiosError) => {
        console.error('Request error:', error.message);
        return Promise.reject(error);
      },
    );

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(
          `${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
        );

        if (response.data && !('data' in response.data)) {
          console.warn('Warning: Response missing "data" property');
          console.log('Response keys:', Object.keys(response.data));
        }

        return response;
      },
      (error: AxiosError) => {
        if (error.response) {
          console.error(
            `${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
          );
          console.error('Error response data:', error.response.data);
        } else {
          console.error('Network error:', error.message);
        }
        return Promise.reject(error);
      },
    );
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}
