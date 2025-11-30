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

      <!-- LOADING -->
      <div v-if="!movie" class="ion-text-center ion-padding-top">
        <ion-progress-bar type="indeterminate" color="danger"></ion-progress-bar>
        <ion-text color="light"><p>Film laden...</p></ion-text>
      </div>

      <!-- MOVIE DETAIL -->
      <div v-else class="movie-detail-container">

        <!-- POSTER -->
        <img 
          :src="movie.poster_url" 
          :alt="movie.title" 
          class="detail-poster"
          loading="lazy"
        />

        <!-- TITEL -->
        <ion-text color="light" class="ion-text-center">
          <h1 class="movie-title ion-margin-bottom">{{ movie.title }}</h1>
        </ion-text>

        <!-- VERBETERDE METADATA: Gebruik van List zonder Card -->
        <ion-list lines="full" class="metadata-list ion-margin-top ion-margin-bottom">

          <!-- Uitgebracht -->
          <ion-item lines="none" class="meta-item">
            <ion-icon name="calendar-outline" slot="start" color="secondary"></ion-icon>
            <ion-label>
              <h2 class="meta-label">Uitgebracht</h2>
              <p class="meta-value">{{ movie.releaseDate || movie.year }}</p>
            </ion-label>
          </ion-item>

          <!-- Genres -->
          <ion-item
            v-if="movie.genres && movie.genres.length"
            lines="none"
            class="meta-item"
          >
            <ion-icon name="pricetag-outline" slot="start" color="secondary"></ion-icon>
            <ion-label>
              <h2 class="meta-label">Genres</h2>
              <p class="meta-value">{{ movie.genres.join(', ') }}</p>
            </ion-label>
          </ion-item>

          <!-- Optioneel: Bron -->
          <ion-item lines="none" class="meta-item">
            <ion-icon name="videocam-outline" slot="start" color="secondary"></ion-icon>
            <ion-label>
              <h2 class="meta-label">Bron</h2>
              <p class="meta-value">{{ movie.source }}</p>
            </ion-label>
          </ion-item>
          
        </ion-list>
        <!-- EINDE VERBETERDE METADATA -->

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

const movie = ref(null);

onMounted(() => {
  const stored = localStorage.getItem("selected_movie");
  if (stored) movie.value = JSON.parse(stored);
});
</script>

---

### 2. 🎨 CSS: Schoon & Donker

De CSS is aangepast om de metadata items **transparant** en **borderless** te maken.

```css
<style scoped>
/* BACKGROUND (Zwart) */
ion-content::part(background) {
  --background: #000 !important;
}
ion-toolbar {
  --background: #000 !important;
  --color: #fff !important;
}

/* POSTER */
.detail-poster {
  display: block;
  margin: 20px auto 25px auto;
  width: 70%;
  max-width: 350px;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.9);
}

/* TITEL */
.movie-title {
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
}

/* SYNOPSIS SECTIE */
.section-title {
  color: white;
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
}
.description-text {
  color: #eee;
  line-height: 1.6;
  font-size: 1rem;
}

/* VERBETERDE METADATA STIJL */
.metadata-list {
    /* Maak de achtergrond van de lijst zelf transparant */
    --ion-background-color: transparent;
    /* Voeg een lichte, subtiele scheiding toe aan de lijst */
    --border-width: 1px 0 0 0;
    --border-color: #333;
}

.meta-item {
    /* Zorg dat de item achtergrond transparant is */
    --background: transparent;
    /* Tekstkleur voor items is wit */
    --color: white;
}

/* LABELS & VALUES (Heldere teksten op zwarte achtergrond) */
.meta-label {
    font-weight: 700;
    color: #fff; /* Wit */
    font-size: 1rem;
}
.meta-value {
    color: #bbb; /* Lichtgrijs voor de waarden */
    font-size: 0.9rem;
}

/* ICON COLOR */
ion-icon[color="secondary"] {
  color: #00ffff !important; /* Cyaan accentkleur */
}
</style>