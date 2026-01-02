<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/admin" />
        </ion-buttons>
        <ion-title>Add Movie</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="card">
        <!-- header card -->
        <div class="card-header">
          <div class="title">Movie details</div>
          <div class="subtitle">
            Fill in the information to add a new movie to the database.
          </div>
        </div>

        <!-- form -->
        <ion-item class="field" lines="none">
          <ion-input label="Title" label-placement="stacked" v-model="form.title" />
        </ion-item>

        <ion-item class="field" lines="none">
          <ion-input type="number" label="Year" label-placement="stacked" v-model="form.year" />
        </ion-item>

        <ion-item class="field" lines="none">
          <ion-input label="Director" label-placement="stacked" v-model="form.director" />
        </ion-item>

        <ion-item class="field" lines="none">
          <ion-input type="number" label="Duration (minutes)" label-placement="stacked"
            v-model="form.duration_minutes" />
        </ion-item>

        <ion-item class="field" lines="none">
          <ion-input label="Genre" label-placement="stacked" v-model="form.genre" />
        </ion-item>

        <ion-item class="field" lines="none">
          <ion-input label="Poster URL" label-placement="stacked" v-model="form.poster_url" />
        </ion-item>

        <ion-item class="field" lines="none">
          <ion-textarea label="Description" label-placement="stacked" :auto-grow="true" v-model="form.description" />
        </ion-item>

        <!-- actions -->
        <div class="actions">
          <ion-button expand="block" class="primary" :disabled="saving" @click="save">
            Add Movie
          </ion-button>

          <ion-button expand="block" fill="outline" class="secondary" :disabled="saving" @click="cancel">
            Cancel
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
  IonButtons,
  IonBackButton,
  IonItem,
  IonInput,
  IonTextarea,
  IonButton,
  toastController
} from "@ionic/vue";

import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

/* state */
const router = useRouter();
const saving = ref(false);

const user = JSON.parse(localStorage.getItem("user") || "null");

const form = reactive({
  title: "",
  year: "",
  director: "",
  duration_minutes: "",
  genre: "",
  description: "",
  poster_url: ""
});

  /* api */
const API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/movies.php";

/* actions */
function cancel() {
  router.push({ name: "AdminPage" });
}

async function save() {
  if (!user?.id) {
    await showToast("Not logged in");
    return;
  }

  saving.value = true;

  try {
    await axios.post(API, {
      ...form,
      year: Number(form.year),
      duration_minutes: Number(form.duration_minutes),
      created_by: user.id
    });

    await showToast("Movie added successfully");
    router.push({ name: "AdminPage" });

  } catch (e) {
    console.error(e);
    await showToast("Failed to add movie");
  } finally {
    saving.value = false;
  }
}

/* toast */
async function showToast(message) {
  const toast = await toastController.create({
    message,
    duration: 1700,
    position: "bottom"
  });
  await toast.present();
}
</script>

<style scoped>
ion-content::part(background) {
  --background: #000;
  color: white;
}

/* CARD */
.card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 18px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.card-header {
  margin-bottom: 10px;
}

.title {
  font-size: 1.05rem;
  font-weight: 700;
}

.subtitle {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

/* INPUTS */
.field {
  --background: rgba(255, 255, 255, 0.04);
  --border-radius: 14px;
  margin-bottom: 10px;
}

/* ACTIONS */
.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.primary {
  --background: #ffffff;
  --color: #000000;
  --border-radius: 14px;
  font-weight: 600;
}

.secondary {
  --border-radius: 14px;
}
</style>
