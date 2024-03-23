<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />

  <button @click="loginHandler">Login</button>
  <button @click="getAHandler">Get A</button>
  <button @click="getBHandler">Get B</button>
</template>

<script setup lang="ts">
import HelloWorld from "./components/HelloWorld.vue";
import axiosInstance from "./axois-instance";

async function loginHandler() {
  try {
    const responseData = await axiosInstance.post("/auth/login", {
      name: "Alpha",
    });

    localStorage.setItem("test-token", responseData.data["access_token"]);
    localStorage.setItem("test-refresh", responseData.data["refresh_token"]);
  } catch (error) {
    console.error(error);
  }
}

async function getAHandler() {
  try {
    const responseData = await axiosInstance.get("/");

    console.log(responseData);
  } catch (error) {
    console.error(error);
  }
}

async function getBHandler() {
  try {
    const responseData = await axiosInstance.get("/b");

    console.log(responseData);
  } catch (error) {
    console.error(error);
  }
}
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
