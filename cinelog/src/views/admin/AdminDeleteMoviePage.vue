<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/admin" />
        </ion-buttons>
        <ion-title>Delete Movie</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="card">
        <!-- header card -->
        <div class="card-header">
          <div class="title">Delete movies</div>
          <div class="subtitle">
            Permanently remove movies added manually by admins.
          </div>
        </div>

        <!-- loading -->
        <div v-if="loading" class="center">
          <ion-progress-bar type="indeterminate" />
        </div>

        <!-- list -->
        <template v-else>
          <ion-item v-for="movie in movies" :key="movie.id" class="field" lines="none">
            <ion-label>
              <h3>{{ movie.title }}</h3>
              <p>{{ movie.year ?? "—" }}</p>
            </ion-label>

            <ion-button color="danger" size="small" :disabled="processing" @click="confirmDelete(movie)">
              Delete
            </ion-button>
          </ion-item>

          <div v-if="movies.length === 0" class="empty">
            No internal movies found.
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
  IonLabel,
  IonButton,
  IonProgressBar,
  toastController,
  alertController,
  onIonViewWillEnter
} from "@ionic/vue";

import { ref } from "vue";
import axios from "axios";

/* state */
const movies = ref([]);
const loading = ref(true);
const processing = ref(false);

/* api */
const API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/movies.php";

/* load movies */
onIonViewWillEnter(loadMovies);

async function loadMovies() {
  loading.value = true;
  try {
    const res = await axios.get(API);
    const allMovies = res.data.data ?? [];

    // only manually added movies
    movies.value = allMovies.filter(
      movie => Number(movie.is_default) === 0
    );

  } catch (e) {
    console.error(e);
    await showToast("Failed to load movies");
    movies.value = [];
  } finally {
    loading.value = false;
  }
}

/* delete */
async function deleteMovie(id) {
  if (!id) return;

  processing.value = true;

  try {
    await axios.delete(API, { data: { id } });

    movies.value = movies.value.filter(m => m.id !== id);
    await showToast("Movie deleted");

  } catch (e) {
    console.error(e);
    await showToast("Delete failed");
  } finally {
    processing.value = false;
  }
}

async function confirmDelete(movie) {
  const alert = await alertController.create({
    header: "Confirm delete",
    message: `Are you sure you want to delete "${movie.title}"?`,
    buttons: [
      { text: "Cancel", role: "cancel" },
      {
        text: "Delete",
        role: "destructive",
        handler: () => deleteMovie(movie.id)
      }
    ]
  });

  await alert.present();
}

/* toast */
async function showToast(message) {
  const toast = await toastController.create({
    message,
    duration: 1600,
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

/* card */
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

/* loading */
.center {
  margin-top: 18px;
}

/* item */
.field {
  --background: rgba(255, 255, 255, 0.04);
  --border-radius: 14px;
  margin-bottom: 10px;
}

ion-item h3 {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
}

ion-item p {
  font-size: 0.8rem;
  color: #aaa;
  margin: 2px 0 0;
}

.empty {
  text-align: center;
  color: #aaa;
  font-size: 0.9rem;
  padding: 12px 0;
}
</style>
