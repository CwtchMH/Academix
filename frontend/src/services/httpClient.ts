/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

export interface Response<T> {
  records: T;
  total_records: number;
}

class AxiosClient {
  private readonly axiosInstance: AxiosInstance;
  static instance: AxiosClient;
  private retryCount = 0;

  static getInstance() {
    if (!AxiosClient.instance) {
      AxiosClient.instance = new AxiosClient();
    }
    return AxiosClient.instance;
  }

  setAccessToken = (accessToken: string) => {
    window.localStorage.setItem("access_token", accessToken);
  };

  public constructor() {
    this.axiosInstance = axios.create({
      headers: {
        "content-type": "application/json",
      },
    });

    this._initializeInterceptor();
  }

  private _initializeInterceptor = () => {
    this.axiosInstance.interceptors.request.use(this._handleRequest);
    this.axiosInstance.interceptors.response.use(
      this._handleResponse
      // this._handleError,
    );
  };

  post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.axiosInstance.post(url, data, config);
  }

  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.get(url, config);
  }

  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.put(url, data, config);
  }

  patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.axiosInstance.patch(url, data, config);
  }

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.delete(url, config);
  }

  private _handleRequest = (config: InternalAxiosRequestConfig) => {
    const token =
      window.localStorage.getItem("access_token") ??
      window.localStorage.getItem("auth_token");

    if (token && config.headers && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  };

  private _handleResponse = (response: AxiosResponse) => {
    if (
      !["application/json"].includes(response.headers["content-type"] as string)
    )
      return response;

    if (response.data) return response.data;

    return response;
  };
}

export default AxiosClient.getInstance();
