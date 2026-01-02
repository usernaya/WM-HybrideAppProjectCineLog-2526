<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/tab1" />
        </ion-buttons>
        <ion-title>CINELOG</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">

      <!-- loading -->
      <div v-if="loading" class="ion-text-center ion-padding-top">
        <ion-progress-bar type="indeterminate" color="danger" />
        <ion-text color="light">
          <p>Loading movie…</p>
        </ion-text>
      </div>

      <!-- content -->
      <div v-else-if="movie">

        <!-- header -->
        <div class="movie-header">
          <img :src="posterSrc" class="detail-poster" :class="{ placeholder: isPlaceholder }" />

          <div class="movie-info">
            <h1 class="movie-title">{{ movie.title }}</h1>

            <p class="meta-line">
              {{ movie.year }}
              <span v-if="movie.genres?.length">
                · {{ movie.genres.join(", ") }}
              </span>
            </p>

            <!-- watchlist button -->
            <ion-button class="watchlist-btn" expand="block" color="danger" fill="outline" :disabled="watchlistLoading"
              @click="toggleWatchlist">
              <ion-spinner v-if="watchlistLoading" name="crescent" slot="start" />
              <ion-icon v-else :icon="inWatchlist ? heart : heartOutline" slot="start" />

              <span>
                <template v-if="watchlistLoading">
                  {{ inWatchlist ? "Removing..." : "Adding..." }}
                </template>
                <template v-else>
                  {{ inWatchlist ? "Remove from Watchlist" : "Add to Watchlist" }}
                </template>
              </span>
            </ion-button>
          </div>
        </div>

        <!-- badges -->
        <div class="badge-row">
          <span class="badge">{{ movie.year }}</span>
          <span v-for="g in movie.genres" :key="g" class="badge badge-genre">
            {{ g }}
          </span>
          <span class="badge badge-source">
            {{ movie.source.toUpperCase() }}
          </span>
        </div>

        <!-- overview -->
        <div class="overview-section">
          <h2 class="section-title">Overview</h2>
          <p v-if="movie.description && movie.description.trim().length" class="description-text">
            {{ movie.description }}
          </p>
          <p v-else class="description-text muted">
            No description available.
          </p>
        </div>

      </div>

      <!-- fallback -->
      <div v-else class="ion-text-center ion-padding">
        <ion-text color="medium">
          <p>Movie not found.</p>
        </ion-text>
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
  IonText,
  IonProgressBar,
  IonButton,
  IonIcon
} from "@ionic/vue";

import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { heart, heartOutline } from "ionicons/icons";
import { notifyWatchlistUpdated } from "@/utils/watchlistEvents";
import { toastController } from "@ionic/vue";
import noPoster from "@/assets/posters/no-poster.png";

/* user */
const user = JSON.parse(localStorage.getItem("user"));
const userId = user?.id;

/* state */
const movie = ref(null);
const loading = ref(true);
const inWatchlist = ref(false);
const watchlistLoading = ref(false);

/* poster logic */
const posterSrc = computed(() => {
  if (!movie.value) return noPoster;

  if (movie.value.source === "tmdb") {
    return movie.value.poster_url &&
      !movie.value.poster_url.endsWith("null")
      ? movie.value.poster_url
      : noPoster;
  }

  return movie.value.poster_url || noPoster;
});

const isPlaceholder = computed(() => posterSrc.value === noPoster);

/* api */
const WATCHLIST_API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/watchlist.php";

const TMDB_DETAILS_API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/inc/movies/TMDB_API/details.php";

/* load movie */
async function loadMovie() {
  const stored = localStorage.getItem("selected_movie");
  if (!stored) {
    loading.value = false;
    return;
  }

  const baseMovie = JSON.parse(stored);

  const mustFetchTmdb =
    baseMovie.source === "tmdb" ||
    !baseMovie.description ||
    !baseMovie.genres ||
    !baseMovie.year;

  if (mustFetchTmdb && (baseMovie.tmdb_id || baseMovie.id)) {
    const tmdbId = baseMovie.tmdb_id ?? baseMovie.id;

    const res = await axios.get(TMDB_DETAILS_API, {
      params: { id: tmdbId }
    });

    const data = JSON.parse(res.data.data);

    movie.value = {
      id: data.id,
      tmdb_id: data.id,
      title: data.title,
      year: data.release_date?.split("-")[0],
      poster_url: "https://image.tmdb.org/t/p/w300" + data.poster_path,
      genres: data.genres?.map(g => g.name) || [],
      description: data.overview,
      source: "tmdb"
    };
  } else {
    movie.value = baseMovie;
  }

  await checkWatchlist();
  loading.value = false;
}

/* check watchlist */
async function checkWatchlist() {
  if (!userId || !movie.value) return;

  const res = await axios.get(WATCHLIST_API, {
    params: {
      user_id: userId,
      movie_id: movie.value.source === "internal" ? movie.value.id : null,
      tmdb_id: movie.value.source === "tmdb" ? movie.value.tmdb_id : null
    }
  });

  inWatchlist.value = res.data.in_watchlist === true;

  if (res.data.movie_id) {
    movie.value.movie_id = res.data.movie_id;
  }
}

/* toggle watchlist */
async function toggleWatchlist() {
  if (!userId || !movie.value || watchlistLoading.value) return;

  watchlistLoading.value = true;

  try {
    if (!inWatchlist.value) {
      await axios.post(WATCHLIST_API, {
        user_id: userId,
        movie_id: movie.value.source === "internal" ? movie.value.id : null,
        tmdb_id: movie.value.source === "tmdb" ? movie.value.tmdb_id : null,
        title: movie.value.title,
        poster_url: movie.value.poster_url,
        year: movie.value.year,
        genre: movie.value.genres?.[0] ?? null
      });

      inWatchlist.value = true;
      showToast("Added to your watchlist");
    } else {
      await axios.delete(WATCHLIST_API, {
        data: {
          user_id: userId,
          movie_id: movie.value.source === "internal" ? movie.value.id : null,
          tmdb_id: movie.value.source === "tmdb" ? movie.value.tmdb_id : null
        }
      });

      inWatchlist.value = false;
      showToast("Removed from your watchlist");
    }

    notifyWatchlistUpdated();
  } catch (err) {
    showToast("Something went wrong");
    console.error(err);
  } finally {
    watchlistLoading.value = false;
  }
}

onMounted(loadMovie);

/* toast */
async function showToast(message) {
  const toast = await toastController.create({
    message,
    duration: 1600,
    position: "bottom",
    cssClass: "design-toast",
    translucent: true
  });

  await toast.present();
}
</script>

<style scoped>
/* global */

ion-content::part(background) {
  --background: #000;
}

ion-toolbar {
  --background: #000;
  --color: #fff;
}


/* header layout */

.movie-header {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  align-items: flex-start;
}

/* Mobile stack */
@media (max-width: 600px) {
  .movie-header {
    flex-direction: column;
    align-items: center;
  }
}


/* poster */

.detail-poster {
  width: 180px;
  height: 270px;
  border-radius: 18px;
  background: #181818;
  object-fit: cover;
}

/* no poster placeholder */
.detail-poster.placeholder {
  object-fit: contain;
  padding: 18px;
}


/* movie info */

.movie-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* Mobile text centering */
@media (max-width: 600px) {
  .movie-info {
    align-items: center;
    text-align: center;
  }
}

.movie-title {
  color: white;
  font-size: 1.9rem;
  font-weight: 700;
}

.meta-line {
  color: #bbb;
  margin-top: 4px;
}

.muted {
  color: #777;
}


/* watchlist button */

.watchlist-btn {
  --border-radius: 999px;
  --padding-start: 18px;
  --padding-end: 18px;
  --padding-top: 8px;
  --padding-bottom: 8px;

  font-size: 0.85rem;
  letter-spacing: 0.4px;

  width: fit-content !important;
  max-width: none;
  margin-top: 14px;
}

/* center button on mobile */
@media (max-width: 600px) {
  .watchlist-btn {
    margin-left: auto;
    margin-right: auto;
  }
}


/* badges */

.badge-row {
  display: flex;
  gap: 8px;
  margin-top: 18px;
  flex-wrap: wrap;
  justify-content: flex-start;
}

/* center badges on mobile */
@media (max-width: 600px) {
  .badge-row {
    justify-content: center;
  }
}

.badge {
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  color: #eee;
  font-size: 0.75rem;
}

.badge-genre {
  background: rgba(255, 0, 0, 0.15);
}

.badge-source {
  background: rgba(255, 0, 0, 0.25);
}


/* overview */

.overview-section {
  margin-top: 28px;
}

.section-title {
  color: white;
  font-size: 1.3rem;
}

.description-text {
  color: #ddd;
  line-height: 1.6;
}
</style>
