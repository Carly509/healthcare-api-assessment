import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class HttpService {
  private readonly axiosInstance: AxiosInstance;

  constructor(private configService: ConfigService) {
    const baseURL = this.configService.get<string>('API_BASE_URL');
    const apiKey = this.configService.get<string>('API_KEY');

    console.log('=== HTTP Client Configuration ===');
    console.log('Base URL:', baseURL);
    console.log('API Key configured:', apiKey ? '✓ Yes' : '✗ No');

    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(`➡️  ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request error:', error.message);
        return Promise.reject(error);
      },
    );

    // Add response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(
          `✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
        );
        return response;
      },
      (error) => {
        if (error.response) {
          console.error(
            `❌ ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
          );
        } else {
          console.error('❌ Network error:', error.message);
        }
        return Promise.reject(error);
      },
    );

    console.log('✓ HTTP Client initialized');
    console.log('=================================');
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}
