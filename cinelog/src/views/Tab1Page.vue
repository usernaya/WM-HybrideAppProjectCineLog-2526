<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>🍿 Film Catalogus</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-grid class="ion-no-padding"> <ion-col size="12" v-for="film in allMovies" :key="film.id">
          <ion-card class="ion-margin-bottom ion-margin-horizontal">
            
            <div class="ion-text-center ion-padding-top">
              <img
                :src="film.poster_url"
                alt="Poster"
                style="width: 150px; height: auto; border-radius: 8px; max-width: 100%;"
                class="ion-margin-bottom"
              />
            </div>
            
            <ion-card-header class="ion-padding-vertical ion-text-center">
              <ion-card-title class="ion-text-wrap">{{ film.title }}</ion-card-title>
              <ion-card-subtitle class="ion-margin-top">
                {{ film.year }} 
                <span v-if="film.genre"> - {{ film.genre }}</span> 
              </ion-card-subtitle>
            </ion-card-header>

            <ion-card-content class="ion-padding-bottom ion-padding-horizontal">
              <ion-label class="ion-text-wrap">{{ film.description }}</ion-label>
            </ion-card-content>
          </ion-card>
        </ion-col>
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
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonLabel,
  IonProgressBar,
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