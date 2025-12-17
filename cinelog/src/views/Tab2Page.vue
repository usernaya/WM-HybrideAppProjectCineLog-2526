<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="dark">
        <ion-title>Mijn Watchlist</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">

      <!-- LOADING -->
      <div v-if="loading" class="ion-text-center ion-padding-top">
        <ion-progress-bar type="indeterminate" color="danger"></ion-progress-bar>
      </div>

      <!-- EMPTY -->
      <div v-else-if="watchlist.length === 0" class="ion-text-center ion-padding">
        <ion-text color="light">
          <h2>Je watchlist is leeg</h2>
          <p>Voeg films toe vanuit de catalogus</p>
        </ion-text>
      </div>

      <!-- GRID -->
      <div v-else class="grid-container">

        <div 
          v-for="film in watchlist" 
          :key="film.movie_id"
          class="grid-card"
          @click="openDetail(film)"
        >

          <img 
            :src="film.poster_url" 
            class="grid-poster"
            :alt="film.title"
          />

          <p class="grid-title">{{ film.title }}</p>
          <p class="grid-sub">{{ film.year }}</p>

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
  IonProgressBar,
  IonText
} from "@ionic/vue";

import axios from "axios";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const userId = 2;

const watchlist = ref([]);
const loading = ref(true);

// LOAD WATCHLIST
async function loadWatchlist() {
  try {
    const res = await axios.get(
      "https://anaseddaouodisee.be/WM-RESTfulAPIProjectCineLog-2526/api/watchlist.php",
      { params: { user_id: userId } }
    );

    const data = res.data.data || [];

    watchlist.value = data.map(f => ({
      id: f.movie_id,
      movie_id: f.movie_id,
      title: f.title,
      year: f.year,
      genres: f.genre ? [f.genre] : [],
      poster_url: f.poster_url,
      description: f.description || "Geen beschrijving beschikbaar.",
      source: f.is_default ? "tmdb" : "internal",
      in_watchlist: true
    }));

  } catch (err) {
    console.error("WATCHLIST ERROR:", err);
  }

  loading.value = false;
}

// OPEN DETAILS
function openDetail(movie) {
  localStorage.setItem("selected_movie", JSON.stringify(movie));
  router.push({ name: "MovieDetails", params: { id: movie.id } });
}

onMounted(() => {
  loadWatchlist();
});
</script>

<style scoped>
/* BACKGROUND */
ion-content::part(background) {
  --background: #000 !important;
}
ion-toolbar {
  --background: #000 !important;
  --color: white !important;
}

/* GRID CONTAINER */
.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
  padding: 15px;
}

/* FULL CARD */
.grid-card {
  cursor: pointer;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.25s ease;
}

.grid-card:hover {
  transform: scale(1.05);
}

/* POSTER */
.grid-poster {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  border-radius: 12px;

  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.grid-card:hover .grid-poster {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7);
}

/* TITEL */
.grid-title {
  margin-top: 7px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* SUBTEXT */
.grid-sub {
  color: #bbb;
  font-size: 0.85rem;
}

/* RESPONSIVE */
@media (min-width: 600px) {
  .grid-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 900px) {
  .grid-container {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
