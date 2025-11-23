<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Film Catalogus</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">

      <ion-grid>
        <ion-row>
          <ion-col
            v-for="film in allMovies"
            :key="film.id"
            size="6"
            size-md="4"
            size-lg="3"
            class="film-col"
          >
            <div class="film-card">

              <img
                class="film-poster"
                :src="film.poster_url"
                alt="Poster"
              />

              <h3 class="film-title">{{ film.title }}</h3>
              <p class="film-sub">{{ film.year }}</p>

            </div>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-progress-bar type="indeterminate" v-if="allMovies.length === 0"></ion-progress-bar>

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
  IonGrid,
  IonRow,
  IonCol,
  IonProgressBar,
} from "@ionic/vue";

import axios from "axios";
import { ref } from "vue";

const allMovies = ref([]);

async function loadMovies() {
  try {
    const res = await axios.get(
      "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/inc/movies/get_all.php"
    );

    const parsed = JSON.parse(res.data.data);

    const internal = parsed.internal;
    const tmdb = parsed.tmdb_trending;

    const tmdbFormatted = tmdb.map(m => ({
      id: m.id,
      title: m.title,
      year: m.release_date?.slice(0, 4) || "",
      poster_url: "https://image.tmdb.org/t/p/w300" + m.poster_path,
    }));

    allMovies.value = [...internal, ...tmdbFormatted];
  } catch (err) {
    console.error(err);
  }
}

loadMovies();
</script>

<style scoped>
.film-col {
  padding: 10px;
  display: flex;
  justify-content: center;
}

.film-card {
  width: 100%;
  max-width: 170px;
  text-align: center;
  background: transparent;
}

.film-poster {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.35);
  transition: transform 0.25s ease;
}

.film-poster:hover {
  transform: scale(1.06);
}

.film-title {
  margin-top: 10px;
  font-size: 15px;
  font-weight: 600;
  color: white;
}

.film-sub {
  margin: 0;
  font-size: 13px;
  color: #d0d0d0;
}
</style>
