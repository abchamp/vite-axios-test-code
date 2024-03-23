import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import setupInterceptors from "./axois-setup-interceptors";

setupInterceptors();

createApp(App).mount("#app");
