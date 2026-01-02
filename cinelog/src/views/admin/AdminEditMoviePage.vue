<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="backHref" />
        </ion-buttons>
        <ion-title>{{ pageTitle }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="card">
        <div class="card-header">
          <div class="title">Movie details</div>
          <div class="subtitle">
            {{ subtitle }}
          </div>
        </div>

        <!-- loading -->
        <div v-if="loading" class="center">
          <ion-spinner name="crescent" />
        </div>

        <!-- form -->
        <template v-else>
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
              {{ saveLabel }}
            </ion-button>

            <ion-button expand="block" fill="outline" class="secondary" @click="cancel">
              Cancel
            </ion-button>
          </div>
        </template>
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
  IonSpinner,
  toastController,
  onIonViewWillEnter
} from "@ionic/vue";

import { reactive, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const route = useRoute();

const saving = ref(false);
const loading = ref(true);

const user = JSON.parse(localStorage.getItem("user") || "null");

const MOVIES_API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/movies.php";

const REQUESTS_API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/movie_requests.php";

/* opening page from adminRequestPage */
const isApproveMode = computed(() => route.name === "AdminApproveRequest");

/* id in url */
const idParam = computed(() => route.params.id);

/* form */
const form = reactive({
  request_id: null,  // only in approve mode
  movie_id: null,    // only in edit mode

  title: "",
  year: "",
  director: "",
  duration_minutes: "",
  genre: "",
  description: "",
  poster_url: ""
});

/* load data */
onIonViewWillEnter(async () => {
  await prefill();
});

async function prefill() {
  loading.value = true;

  try {
    if (!idParam.value) {
      await showToast("Missing id");
      return;
    }

    /* case 1: if approve request mode */
    if (isApproveMode.value) {
      const res = await axios.get(REQUESTS_API, {
        params: { id: idParam.value }
      });

      const req = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data;

      if (!req?.id) {
        await showToast("Request not found");
        router.replace("/tabs/admin/requests");
        return;
      }

      form.request_id = req.id;
      form.title = req.title ?? "";
      form.year = req.year ?? "";
      form.director = req.director ?? "";
      form.duration_minutes = req.duration_minutes ?? 120;
      form.genre = req.genre ?? "Drama";
      form.description = req.description ?? "";
      form.poster_url = req.poster_url ?? "https://via.placeholder.com/300x450?text=Poster";
      return;
    }

    /* case 2: if edit movie mode */
    const res = await axios.get(MOVIES_API, {
      params: { id: idParam.value }
    });

    const movie = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data;

    if (!movie?.id) {
      await showToast("Movie not found");
      router.replace("/tabs/admin/movies/edit");
      return;
    }

    form.movie_id = movie.id;
    form.title = movie.title ?? "";
    form.year = movie.year ?? "";
    form.director = movie.director ?? "";
    form.duration_minutes = movie.duration_minutes ?? "";
    form.genre = movie.genre ?? "";
    form.description = movie.description ?? "";
    form.poster_url = movie.poster_url ?? "";
  } catch (e) {
    console.error(e);
    await showToast("Failed to load data");
  } finally {
    loading.value = false;
  }
}

/* save */
async function save() {
  if (!user?.id) {
    await showToast("Not logged in");
    router.push("/login");
    return;
  }

  saving.value = true;

  try {
    /* approve mode: POST movie + PUT request */
    if (isApproveMode.value) {
      const addRes = await axios.post(MOVIES_API, {
        title: form.title,
        year: Number(form.year),
        director: form.director,
        duration_minutes: Number(form.duration_minutes),
        genre: form.genre,
        description: form.description,
        poster_url: form.poster_url,
        created_by: user.id
      });

      const createdMovieId = addRes.data?.movie_id;
      if (!createdMovieId) throw new Error("movie_id missing");

      await axios.put(REQUESTS_API, {
        id: form.request_id,
        admin_id: user.id,
        status: "approved",
        movie_id: createdMovieId
      });

      await showToast("Movie added & request approved");
      router.push("/tabs/admin/requests");
      return;
    }

    /* edit mode: PUT movie */
    await axios.put(MOVIES_API, {
      id: form.movie_id,
      title: form.title,
      year: Number(form.year),
      director: form.director,
      duration_minutes: Number(form.duration_minutes),
      genre: form.genre,
      description: form.description,
      poster_url: form.poster_url
    });

    await showToast("Movie updated");
    router.push("/tabs/admin/movies/edit");
  } catch (e) {
    console.error(e);
    await showToast("Save failed");
  } finally {
    saving.value = false;
  }
}

function cancel() {
  if (isApproveMode.value) {
    router.push("/tabs/admin/requests");
  } else {
    router.push("/tabs/admin/movies/edit");
  }
}

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

.card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 18px;
  padding: 14px;
}

.field {
  --background: rgba(255, 255, 255, 0.04);
  --border-radius: 14px;
  margin-bottom: 10px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.primary {
  --background: #fff;
  --color: #000;
  --border-radius: 14px;
}

.secondary {
  --border-radius: 14px;
}
</style>
