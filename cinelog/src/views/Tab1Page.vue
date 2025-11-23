<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Films</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-card v-for="film in allMovies" :key="film.id">
          
          <!-- Poster -->
          <img
            :src="film.poster_url"
            alt="poster"
            style="width: 120px; height: auto; border-radius: 6px; margin: 10px auto; display: block;"
          />

          <ion-card-header>
            <ion-card-title>{{ film.title }}</ion-card-title>
            <ion-card-subtitle>
              {{ film.year }} - {{ film.genre }}
            </ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            {{ film.description }}
          </ion-card-content>

        </ion-card>
      </ion-list>
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
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
} from "@ionic/vue";
import axios from "axios";
import { ref } from "vue";

const allMovies = ref([]);

async function loadMovies() {
  try {
    const res = await axios.get(
      "https://anaseddaouodisee.be/WM-RESTfulAPIProjectCineLog-2526/api/inc/movies/get_all.php"
       
    );

    // Combine internal + TMDB
    const internal = JSON.parse(res.data.data).internal;
    const tmdb = JSON.parse(res.data.data).tmdb_trending;

    // Maak posters mooi voor TMDB
    const tmdbFormatted = tmdb.map((m) => ({
      id: m.id,
      title: m.title,
      year: m.release_date?.slice(0, 4) || "",
      genre: "",
      description: m.overview,
      poster_url: "https://image.tmdb.org/t/p/w200" + m.poster_path,
    }));

    allMovies.value = [...internal, ...tmdbFormatted];
  } catch (err) {
    console.error(err);
  }
}

loadMovies();
</script>
