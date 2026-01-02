<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/profile" />
        </ion-buttons>

        <ion-title>My Watchlist</ion-title>

      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">

      <!-- loading -->
      <div v-if="loading" class="center">
        <ion-progress-bar type="indeterminate" color="danger" />
      </div>

      <!-- empty -->
      <div v-else-if="watchlist.length === 0" class="empty">
        <p>Your watchlist is empty</p>
      </div>

      <!-- grid -->
      <div v-else class="grid">
        <div v-for="movie in watchlist" :key="movie.id" class="poster-wrapper">
          <img :src="movie.poster_url" class="poster" @click="!editMode && openMovie(movie)" />
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
  IonProgressBar
} from "@ionic/vue";

import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

/* router */
const router = useRouter();

/* state */
const user = JSON.parse(localStorage.getItem("user"));
const loading = ref(true);
const watchlist = ref([]);

/* api */
const WATCHLIST_API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/watchlist.php";

/* load watchlist */
async function loadWatchlist() {
  try {
    const res = await axios.get(WATCHLIST_API, {
      params: { user_id: user.id }
    });

    watchlist.value = res.data.data ?? [];
  } catch (e) {
    console.error("Failed to load watchlist", e);
  } finally {
    loading.value = false;
  }
}

/* open movie details */
function openMovie(movie) {
  localStorage.setItem("selected_movie", JSON.stringify({
    ...movie,
    source: movie.is_default === 1 ? "tmdb" : "internal"
  }));

  router.push({
    name: "MovieDetails",
    params: {
      id: movie.tmdb_id ?? movie.movie_id ?? movie.id
    }
  });
}

/* lifecycle */
onMounted(loadWatchlist);
</script>

<style scoped>
.center {
  margin-top: 40px;
}

.empty {
  text-align: center;
  color: #888;
  margin-top: 40px;
}

/* grid */
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

/* poster */
.poster-wrapper {
  position: relative;
}

.poster {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  border-radius: 10px;
  cursor: pointer;
}

/* remove button */
.remove-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.75);
  color: white;
  font-size: 14px;
  cursor: pointer;
}

/* responsive */
@media (max-width: 900px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
