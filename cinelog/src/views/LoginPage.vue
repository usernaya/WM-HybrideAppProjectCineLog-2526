<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title class="app-title">CINELOG</ion-title>
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

        <div>
          <!-- create account -->
          <ion-button expand="block" fill="clear" color="medium" @click="goRegister">
            Create an account 
          </ion-button>
          <!-- guest mode -->
          <ion-button expand="block" fill="clear" color="light" @click="continueAsGuest">
            Continue as guest
          </ion-button>

        </div>
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
  --background: radial-gradient(circle at top,
      #111 0%,
      #000 60%);
}

/* title app */
.app-title {
  text-align: center;
  font-weight: 800;
  letter-spacing: 10px;
}

/* header */
ion-toolbar {
  --background: transparent;
  --color: white;
  backdrop-filter: blur(8px);
}

/* container */
.login-container {
  max-width: 420px;
  margin: auto;
  margin-top: 18vh;

  padding: 22px;
  border-radius: 22px;

  display: flex;
  flex-direction: column;
  gap: 16px;

  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);

  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* title */
.login-title {
  color: white;
  text-align: center;
  font-size: 1.9rem;
  font-weight: 700;
  letter-spacing: 0.4px;
  margin-bottom: 6px;
}

/* inputs */
ion-input {
  --background: rgba(255, 255, 255, 0.04);
  --border-radius: 16px;
  --padding-start: 14px;
  --padding-end: 14px;

  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}

/* error */
.error-text {
  text-align: center;
  font-size: 0.85rem;
  color: #ff6b6b;
  margin-top: 4px;
}

/* login button */
.login-btn {
  margin-top: 14px;

  --border-radius: 16px;
  --background: linear-gradient(135deg, #ff4d4d, #ff1f1f);
  --color: white;

  font-weight: 600;
  letter-spacing: 0.3px;

  box-shadow: 0 6px 20px rgba(255, 77, 77, 0.35);
}

/* disabled state */
.login-btn.button-disabled {
  opacity: 0.6;
  box-shadow: none;
}
</style>
