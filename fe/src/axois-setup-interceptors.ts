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

const refreshAndRetryQueue: RetryQueueItem[] = [];
let isRefreshing = false;

const setup = () => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("test-token");
      if (token) {
        config.headers["Authorization"] = "Bearer " + token; // for Spring Boot back-end
      }
      return config;
    },
    (error) => {
      console.error(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (result) => {
      return result;
    },
    async (error) => {
      const originalRequest: AxiosRequestConfig = error.config;

      if (error.response && error.response.status === 403) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const responseData = await axios
              .create({
                baseURL: "http://localhost:3000",
                headers: {
                  "Content-type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                  Authorization:
                    "Bearer " + localStorage.getItem("test-refresh"),
                },
              })
              .post(APP_AXIOS_ENV_VAR.refreshTokenURI);

            localStorage.setItem(
              "test-token",
              responseData.data["access_token"]
            );
            localStorage.setItem(
              "test-refresh",
              responseData.data["refresh_token"]
            );

            error.config.headers[
              "Authorization"
            ] = `Bearer ${responseData.data["access_token"]}`;

            refreshAndRetryQueue.forEach(({ config, resolve, reject }) => {
              console.log(config);
              axiosInstance
                .request(config)
                .then((response) => resolve(response))
                .catch((err) => reject(err));
            });

            // Clear the queue
            refreshAndRetryQueue.length = 0;

            return axiosInstance(originalRequest);
          } catch (refreshError) {
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
    }
  );
};

export default setup;
