<template>
  <button @click="testAuthService">Hello B Button</button>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { inject } from "vue";

const appAxios = inject("$appAxios");
// import AuthService from "../AuthService";

function testAuthService() {
  console.log("Hello B");
  appAxios.cancelAxiosToken("aaa", false);
  // console.log(AuthService.getDoubleCounterFromStore());
}
</script>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
