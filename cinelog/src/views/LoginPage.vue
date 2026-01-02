<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title class="center-title">CINELOG</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <div class="login-container">

        <h2 class="login-title">Login</h2>

        <!-- identifier -->
        <ion-input v-model="identifier" label="Email or username" label-placement="stacked"
          placeholder="example@email.com or username" type="text" required />

        <!-- password -->
        <ion-input v-model="password" label="Password" label-placement="stacked" placeholder="••••••••" type="password"
          required />

        <!-- error message -->
        <ion-text color="danger" v-if="errorMessage">
          <p class="error-text">{{ errorMessage }}</p>
        </ion-text>

        <!-- login button -->
        <ion-button expand="block" color="danger" class="login-btn" :disabled="loading" @click="handleLogin">
          <ion-spinner v-if="loading" name="crescent" />
          <span v-else>Login</span>
        </ion-button>

        <!-- guest mode -->
        <ion-button expand="block" fill="clear" color="medium" @click="continueAsGuest">
          Continue as guest
        </ion-button>

        <!-- create account -->
        <ion-button expand="block" fill="clear" color="light" @click="goRegister">
          Create an account
        </ion-button>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonText,
  IonSpinner
} from "@ionic/vue";

import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useAuth } from "@/composables/useAuth";

/* state */
const router = useRouter();
const auth = useAuth();

const identifier = ref("");
const password = ref("");

const loading = ref(false);
const errorMessage = ref("");

/* api endpoint */
const LOGIN_API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/inc/auth/login.php";

/* login handler */
async function handleLogin() {
  errorMessage.value = "";

  if (!identifier.value || !password.value) {
    errorMessage.value = "Please fill in all fields";
    return;
  }

  loading.value = true;

  try {
    const res = await axios.post(LOGIN_API, {
      identifier: identifier.value,
      password: password.value
    });

    if (res.data.status !== 200) {
      throw new Error("Login failed");
    }

    // central login state
    auth.login(res.data.data);

    // redirect to home
    router.replace("/tabs/tab1");

  } catch (error) {
    errorMessage.value = "Invalid email/username or password";
  } finally {
    loading.value = false;
  }
}

/* guest mode */
function continueAsGuest() {
  auth.loginAsGuest();
  router.replace("/tabs/tab1");
}

/* go to register page */
function goRegister() {
  router.push({ name: "Register" });
}

</script>

<style scoped>
/* background */
ion-content::part(background) {
  --background: #000;
}

ion-toolbar {
  --background: #000;
  --color: white;
}

/* layout */
.login-container {
  max-width: 400px;
  margin: auto;
  margin-top: 20vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-title {
  color: white;
  text-align: center;
  font-size: 1.8rem;
  font-weight: 700;
}

/* error */
.error-text {
  text-align: center;
  font-size: 0.9rem;
}

/* button */
.login-btn {
  margin-top: 10px;
}
</style>
