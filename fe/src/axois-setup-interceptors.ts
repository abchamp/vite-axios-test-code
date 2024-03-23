import axiosInstance from "./axois-instance";
import axios from "axios";
import { AxiosRequestConfig } from "axios";

const APP_AXIOS_ENV_VAR = {
  refreshTokenURI: "/auth/refresh",
  unAuthUri: ["/auth/login"],
};

interface RetryQueueItem {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
  config: AxiosRequestConfig;
}

const setup = () => {
  const refreshAndRetryQueue: RetryQueueItem[] = [];
  let isRefreshing = false;
  let pendingRequests: any = {};

  const getRefreshTokenRequest = () => {
    return axios
      .create({
        baseURL: "http://localhost:3000",
        headers: {
          "Content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: "Bearer " + localStorage.getItem("test-refresh"),
        },
      })
      .post(APP_AXIOS_ENV_VAR.refreshTokenURI);
  };

  const checkPendingRequest = (config: AxiosRequestConfig) => {
    if (config?.requestGroup) {
      removePendingRequest(config.requestGroup, true);
    } else {
      removePendingRequest(config.url, true);
    }
  };

  const removePendingRequest = (url: string, abort: boolean = false) => {
    if (url && pendingRequests[url]) {
      console.log("in");
      if (abort) {
        pendingRequests[url].abort();
      }
      delete pendingRequests[url];
    }
  };

  const preRequestHandler = (config) => {
    const token = localStorage.getItem("test-token");
    if (token) {
      config.headers["Authorization"] = "Bearer " + token; // for Spring Boot back-end
    }

    if (config?.cancelPreviousRequests && config?.url && !config.signal) {
      checkPendingRequest(config);

      const abortController = new AbortController();
      config.signal = abortController.signal;
      if (config?.requestGroup) {
        pendingRequests[config.requestGroup] = abortController;
      } else {
        pendingRequests[config.url] = abortController;
      }
    }

    return config;
  };

  const postResponseHandler = async (error) => {
    const originalRequest: AxiosRequestConfig = error.config;

    if (error.response && error.response.status === 403) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const responseData = await getRefreshTokenRequest();

          localStorage.setItem("test-token", responseData.data["access_token"]);
          localStorage.setItem(
            "test-refresh",
            responseData.data["refresh_token"]
          );

          error.config.headers[
            "Authorization"
          ] = `Bearer ${responseData.data["access_token"]}`;

          refreshAndRetryQueue.forEach(({ config, resolve, reject }) => {
            axiosInstance
              .request(config)
              .then((response) => resolve(response))
              .catch((err) => reject(err));
          });

          // Clear the queue
          refreshAndRetryQueue.length = 0;

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          checkPendingRequest(originalRequest);
          throw refreshError;
          // return Promise.reject(_error);
        } finally {
          isRefreshing = false;
        }
      }

      //
      return new Promise<void>((resolve, reject) => {
        // inject instance of error config
        refreshAndRetryQueue.push({
          config: originalRequest,
          resolve,
          reject,
        });
      });
    }

    return Promise.reject(error);
  };

  axiosInstance.interceptors.request.use(
    (config) => preRequestHandler(config),
    (error) => {
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (result) => {
      checkPendingRequest(result.config);
      return result;
    },
    async (error) => postResponseHandler(error)
  );
};

export default setup;
