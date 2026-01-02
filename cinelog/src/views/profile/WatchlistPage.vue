<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title class="header-title">CINELOG</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">

      <!-- loading state -->
      <div v-if="loading" class="state-center">
        <ion-progress-bar type="indeterminate" color="danger" />
        <p class="state-text">Loading your watchlist…</p>
      </div>

      <!-- empty state -->
      <div v-else-if="watchlist.length === 0" class="state-center">
        <ion-text color="light">
          <h2>Your watchlist is empty</h2>
          <p>Add movies from the catalog</p>
        </ion-text>
      </div>

      <!-- watchlist grid -->
      <div v-else class="grid-container">
        <div v-for="movie in watchlist" :key="movie.tmdb_id ?? movie.id" class="grid-card" @click="openDetail(movie)">
          <img :src="movie.poster_url" :alt="movie.title" class="grid-poster" />

          <div class="grid-info">
            <p class="grid-title">{{ movie.title }}</p>
            <p class="grid-sub">{{ movie.year }}</p>
          </div>
        </div>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup>
/* imports */
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonProgressBar,
  IonText
} from "@ionic/vue";

import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

/* state */
const router = useRouter();

const user = JSON.parse(localStorage.getItem("user"));
const userId = user?.id;

const watchlist = ref([]);
const loading = ref(true);

const WATCHLIST_API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/watchlist.php";

/* load watchlist */
async function loadWatchlist() {
  // if no user id, skip loading (security)
  if (!userId) {
    loading.value = false;
    return;
  }

  try {
    const res = await axios.get(WATCHLIST_API, {
      params: { user_id: userId }
    });

    const data = res.data.data ?? [];

    watchlist.value = data.map(item => ({
      id: item.movie_id ?? item.id,
      tmdb_id: item.tmdb_id ?? null,
      title: item.title,
      year: item.year,
      poster_url: item.poster_url,
      genres: item.genre ? [item.genre] : [],
      description: item.description || "No description available.",
      source: item.tmdb_id ? "tmdb" : "internal"
    }));

  } catch (error) {
    console.error("Failed to load watchlist:", error);
  } finally {
    loading.value = false;
  }
}

/* open movie details */
function openDetail(movie) {
  localStorage.setItem("selected_movie", JSON.stringify(movie));

  router.push({
    name: "MovieDetails",
    params: { id: movie.tmdb_id ?? movie.id }
  });
}

/* lifecycle */
onMounted(loadWatchlist);
</script>

<style scoped>
ion-content::part(background) {
  --background: #000;
}

ion-toolbar {
  --background: #000;
  --color: white;
}

.header-title {
  text-align: center;
  font-weight: 700;
}

/* states */
.state-center {
  height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.state-text {
  margin-top: 12px;
  color: #bbb;
}

/* grid */
.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
  padding: 16px;
}

.grid-card {
  cursor: pointer;
  text-align: center;
  transition: transform 0.25s ease;
}

.grid-card:hover {
  transform: scale(1.05);
}

.grid-poster {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  border-radius: 14px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7);
}

.grid-info {
  margin-top: 8px;
}

.grid-title {
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.grid-sub {
  color: #aaa;
  font-size: 0.8rem;
}

/* responsive */
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
