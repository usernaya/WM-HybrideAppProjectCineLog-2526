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
                <ion-button expand="block" color="danger" class="register-btn" :disabled="loading"
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

import { reactive, ref } from "vue";
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

/* api */
const REGISTER_API =
    "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/inc/auth/register.php";

/* register */
async function handleRegister() {
    errorMessage.value = "";

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
ion-content::part(background) {
    --background: #000;
}

ion-toolbar {
    --background: #000;
    --color: white;
}

.register-container {
    max-width: 400px;
    margin: auto;
    margin-top: 14vh;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.register-title {
    color: white;
    text-align: center;
    font-size: 1.8rem;
    font-weight: 700;
}

.error-text {
    text-align: center;
    font-size: 0.9rem;
}

.register-btn {
    margin-top: 10px;
}
</style>
