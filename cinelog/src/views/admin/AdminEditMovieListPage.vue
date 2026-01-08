<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/admin" />
        </ion-buttons>
        <ion-title>Edit Movie</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="card">
        <!-- header card -->
        <div class="card-header">
          <div class="title">Select a movie</div>
          <div class="subtitle">
            Choose a movie added manually to edit its information.
          </div>
        </div>

        <!-- loading -->
        <div v-if="loading" class="center">
          <ion-progress-bar type="indeterminate" />
        </div>

        <!-- list -->
        <template v-else>
          <ion-item v-for="movie in movies" :key="movie.id" class="field" lines="none" button @click="edit(movie.id)">
            <ion-label>
              <h3>{{ movie.title }}</h3>
              <p>{{ movie.year ?? "—" }} · {{ movie.genre ?? "—" }}</p>
            </ion-label>
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
  IonProgressBar,
  onIonViewWillEnter
} from "@ionic/vue";

import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

/* state */
const router = useRouter();
const movies = ref([]);
const loading = ref(true);

/* api */
const API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/movies.php";

/* load movies in ionic safe way (had loading errors without onIonViewWillEnter) */
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
    movies.value = [];
  } finally {
    loading.value = false;
  }
}

/* navigation */
function edit(movieId) {
  router.push({
    name: "AdminEditMovie",
    params: { id: movieId }
  });
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

/* empty */
.empty {
  text-align: center;
  color: #aaa;
  font-size: 0.9rem;
  padding: 12px 0;
}
</style>
