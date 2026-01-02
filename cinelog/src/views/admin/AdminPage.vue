<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/profile" />
        </ion-buttons>
        <ion-title>Admin Panel</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">

      <!-- movie management -->
      <section class="admin-section">
        <h2 class="section-title">Movie Management</h2>

        <div class="card">

          <!-- add movie -->
          <ion-item button detail @click="goAddMovie">
            <ion-icon slot="start" :icon="addCircleOutline" />
            <ion-label>
              <h3>Add Movie</h3>
              <p>Add a new movie to the database</p>
            </ion-label>
          </ion-item>

          <!-- edit movie -->
          <ion-item button detail @click="goEditMovie">
            <ion-icon slot="start" :icon="createOutline" />
            <ion-label>
              <h3>Edit Movie</h3>
              <p>Update existing movie information</p>
            </ion-label>
          </ion-item>

          <!-- delete movie -->
          <ion-item button detail @click="goDeleteMovie">
            <ion-icon slot="start" :icon="trashOutline" />
            <ion-label>
              <h3>Delete Movie</h3>
              <p>Permanently remove a movie</p>
            </ion-label>
          </ion-item>

        </div>
      </section>

      <!-- movie requests -->
      <section class="admin-section">
        <h2 class="section-title">Movie Requests</h2>

        <div class="card">
          <ion-item button detail @click="goRequests">
            <ion-icon slot="start" :icon="checkmarkCircleOutline" />
            <ion-label>
              <h3>Review Requests</h3>
              <p>Approve or reject movie requests</p>
            </ion-label>
          </ion-item>
        </div>
      </section>

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
  IonIcon
} from "@ionic/vue";

import {
  addCircleOutline,
  createOutline,
  trashOutline,
  checkmarkCircleOutline
} from "ionicons/icons";

import { useRouter } from "vue-router";

/* router */
const router = useRouter();

/* navigation */
function goAddMovie() {
  router.push({ name: "AdminAddMovie" });
}

function goEditMovie() {
  router.push({ name: "AdminEditMovieList" });
}

function goDeleteMovie() {
  router.push({ name: "AdminDeleteMovie" });
}

function goRequests() {
  router.push({ name: "AdminRequests" });
}
</script>

<style scoped>
/* background */
ion-content::part(background) {
  --background: #000;
  color: white;
}

/* section */
.admin-section {
  margin-bottom: 36px;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 14px;
}

/* card */
.card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  overflow: hidden;
}

/* item */
ion-item {
  --background: transparent;
  --color: white;
  --border-color: rgba(255, 255, 255, 0.08);
}

ion-item h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

ion-item p {
  font-size: 0.85rem;
  color: #aaa;
  margin: 2px 0 0;
}
</style>
