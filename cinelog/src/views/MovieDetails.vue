<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="dark">
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/tab1"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ movie?.title }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">

      <div v-if="!movie" class="ion-text-center ion-padding-top">
        <ion-progress-bar type="indeterminate" color="danger"></ion-progress-bar>
        <ion-text color="light"><p>Film laden...</p></ion-text>
      </div>

      <div v-else>

        <img :src="movie.poster_url" :alt="movie.title" class="detail-poster" />

        <!-- WATCHLIST BUTTON -->
        <ion-button 
          expand="block" 
          color="danger"
          class="watchlist-btn"
          @click="toggleWatchlist"
        >
          {{ inWatchlist ? "Remove from Watchlist" : "Add to Watchlist" }}
        </ion-button>


        <ion-text color="light" class="ion-text-center">
          <h1 class="movie-title ion-margin-bottom">{{ movie.title }}</h1>
        </ion-text>

        <ion-list lines="full" class="metadata-list ion-margin-top ion-margin-bottom">
          <ion-item lines="none" class="meta-item">
            <ion-icon name="calendar-outline" slot="start" color="secondary"></ion-icon>
            <ion-label>
              <h2 class="meta-label">Uitgebracht</h2>
              <p class="meta-value">{{ movie.year }}</p>
            </ion-label>
          </ion-item>

          <ion-item v-if="movie.genres?.length" lines="none" class="meta-item">
            <ion-icon name="pricetag-outline" slot="start" color="secondary"></ion-icon>
            <ion-label>
              <h2 class="meta-label">Genres</h2>
              <p class="meta-value">{{ movie.genres.join(', ') }}</p>
            </ion-label>
          </ion-item>

          <ion-item lines="none" class="meta-item">
            <ion-icon name="videocam-outline" slot="start" color="secondary"></ion-icon>
            <ion-label>
              <h2 class="meta-label">Bron</h2>
              <p class="meta-value">{{ movie.source }}</p>
            </ion-label>
          </ion-item>
        </ion-list>

        <h2 class="section-title ion-padding-top ion-padding-bottom">Synopsis</h2>
        <ion-text color="light" class="ion-text-wrap">
          <p class="description-text">{{ movie.description }}</p>
        </ion-text>

      </div>

    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonText, IonIcon,
  IonLabel, IonItem, IonList, IonProgressBar
} from "@ionic/vue";

import { ref, onMounted } from "vue";
import axios from "axios";

const userId = 2;
const movie = ref(null);
const inWatchlist = ref(false);

// CHECK WATCHLIST
async function checkWatchlist() {
  if (!movie.value) return;

  const res = await axios.get(
    "https://anaseddaouodisee.be/WM-RESTfulAPIProjectCineLog-2526/api/watchlist.php",
    { params: { 
        user_id: userId, 
        movie_id: movie.value.id ?? null,
        tmdb_id: movie.value.tmdb_id ?? null
      } 
    }
  );

  inWatchlist.value = res.data.in_watchlist;
}

// ADD / REMOVE
async function toggleWatchlist() {
  if (!movie.value) return;

  if (!inWatchlist.value) {

    // ADD
    if (movie.value.source === "tmdb") {
      await axios.post(
        "https://anaseddaouodisee.be/WM-RESTfulAPIProjectCineLog-2526/api/watchlist.php",
        {
          user_id: userId,
          tmdb_id: movie.value.id,
          title: movie.value.title,
          poster_url: movie.value.poster_url,
          year: movie.value.year,
          genre: movie.value.genres?.[0] ?? null
        }
      );

    } else {
      await axios.post(
        "https://anaseddaouodisee.be/WM-RESTfulAPIProjectCineLog-2526/api/watchlist.php",
        {
          user_id: userId,
          movie_id: movie.value.id
        }
      );
    }

    inWatchlist.value = true;

  } else {
    // REMOVE
    await axios.delete(
      "https://anaseddaouodisee.be/WM-RESTfulAPIProjectCineLog-2526/api/watchlist.php",
      {
        data: {
          user_id: userId,
          movie_id: movie.value.id
        }
      }
    );

    inWatchlist.value = false;
  }
}

// LOAD MOVIE
onMounted(async () => {
  const stored = localStorage.getItem("selected_movie");
  if (!stored) return;

  movie.value = JSON.parse(stored);

  await checkWatchlist();
});
</script>

<style scoped>
ion-content::part(background) {
  --background: #000 !important;
}
ion-toolbar {
  --background: #000 !important;
  --color: #fff !important;
}

.detail-poster {
  display: block;
  margin: 20px auto 25px auto;
  width: 70%;
  max-width: 350px;
  border-radius: 12px;
}

.movie-title {
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
}

.section-title {
  color: white;
  font-size: 1.4rem;
  font-weight: 600;
}

.description-text {
  color: #eee;
  line-height: 1.6;
  font-size: 1rem;
}

.metadata-list {
  --ion-background-color: transparent;
  --border-color: #333;
}

.meta-item {
  --background: transparent;
  --color: white;
}

.watchlist-btn {
  margin-top: 20px;
  --border-radius: 10px;
  font-weight: bold;
}
</style>
