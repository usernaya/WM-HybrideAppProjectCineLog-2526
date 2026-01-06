<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/login" />
                </ion-buttons>
                <ion-title class="center-title">CINELOG</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true" class="ion-padding">
            <div class="register-container">

                <h2 class="register-title">Create account</h2>

                <!-- firstname -->
                <ion-input v-model="form.firstname" label="First name" label-placement="stacked" placeholder="John" />

                <!-- lastname -->
                <ion-input v-model="form.lastname" label="Last name" label-placement="stacked" placeholder="Doe" />

                <!-- username -->
                <ion-input v-model="form.username" label="Username" label-placement="stacked" placeholder="johndoe" />

                <!-- email -->
                <ion-input v-model="form.email" label="Email" label-placement="stacked" type="email"
                    placeholder="john@example.com" />

                <!-- email validation -->
                <ion-text color="danger" v-if="emailTouched && !isEmailValid">
                    <p class="error-text">Please enter a valid email address</p>
                </ion-text>


                <!-- password -->
                <ion-input v-model="form.password" label="Password" label-placement="stacked" type="password"
                    placeholder="••••••••" />

                <!-- confirm password -->
                <ion-input v-model="confirmPassword" label="Confirm password" label-placement="stacked" type="password"
                    placeholder="••••••••" />

                <!-- error -->
                <ion-text color="danger" v-if="errorMessage">
                    <p class="error-text">{{ errorMessage }}</p>
                </ion-text>

                <!-- register -->
                <ion-button expand="block" color="danger" class="register-btn" :disabled="loading || !isEmailValid"
                    @click="handleRegister">
                    <ion-spinner v-if="loading" name="crescent" />
                    <span v-else>Create account</span>
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
    IonSpinner,
    IonButtons,
    IonBackButton
} from "@ionic/vue";

import { reactive, ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

/* router */
const router = useRouter();

/* state */
const form = reactive({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: ""
});

const confirmPassword = ref("");
const loading = ref(false);
const errorMessage = ref("");

/* email validation */
const emailTouched = ref(false);

const isEmailValid = computed(() => {
    if (!form.email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
});

/* detect user typing email */
watch(
    () => form.email,
    () => {
        emailTouched.value = true;
    }
);

/* api */
const REGISTER_API =
    "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/inc/auth/register.php";

/* register */
async function handleRegister() {
    errorMessage.value = "";

    if (!isEmailValid.value) {
        errorMessage.value = "Invalid email address";
        return;
    }


    // basic validation
    if (
        !form.firstname ||
        !form.lastname ||
        !form.username ||
        !form.email ||
        !form.password
    ) {
        errorMessage.value = "Please fill in all fields";
        return;
    }

    if (form.password !== confirmPassword.value) {
        errorMessage.value = "Passwords do not match";
        return;
    }

    loading.value = true;

    try {
        const res = await axios.post(REGISTER_API, {
            ...form
        });

        if (res.data.status !== 200) {
            throw new Error("Register failed");
        }

        // redirect to login
        router.replace("/login");

    } catch (e) {
        console.error(e);
        errorMessage.value = e?.response?.data?.message || "Register failed";
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped>
/* background */
ion-content::part(background) {
  --background: radial-gradient(
    circle at top,
    #111 0%,
    #000 60%
  );
}

/* header */
ion-toolbar {
  --background: transparent;
  --color: white;
  backdrop-filter: blur(8px);
}

/* container */
.register-container {
  max-width: 420px;
  margin: auto;
  margin-top: 12vh;

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
.register-title {
  color: white;
  text-align: center;
  font-size: 1.9rem;
  font-weight: 700;
  letter-spacing: 0.4px;
  margin-bottom: 4px;
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

/* button */
.register-btn {
  margin-top: 14px;

  --border-radius: 16px;
  --background: linear-gradient(135deg, #ff4d4d, #ff1f1f);
  --color: white;

  font-weight: 600;
  letter-spacing: 0.3px;

  box-shadow: 0 6px 20px rgba(255, 77, 77, 0.35);
}

/* disabled button */
.register-btn.button-disabled {
  opacity: 0.6;
  box-shadow: none;
}


</style>
