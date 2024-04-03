import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { createPinia } from "pinia";
import setupAxiosInterceptors from "./axois-setup-interceptors";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
const setupAxiosInstance = setupAxiosInterceptors();
app.provide("$appAxios", setupAxiosInstance);
app.mount("#app");
