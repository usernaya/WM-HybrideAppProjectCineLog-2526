<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Profile</ion-title>

        <!-- menu -->
        <ion-buttons slot="end">
          <ion-button id="profile-menu-btn" fill="clear">
            <ion-icon :icon="ellipsisVertical" />
          </ion-button>
        </ion-buttons>

        <!-- popover menu -->
        <ion-popover trigger="profile-menu-btn" trigger-action="click" :dismiss-on-select="true" side="bottom"
          alignment="end">
          <ion-content class="ion-no-padding">
            <ion-list lines="none">
              <ion-item button @click="goManageAccount">
                <ion-label>Manage account</ion-label>
              </ion-item>

              <ion-item v-if="isAdmin" button @click="goAdmin">
                <ion-label>Admin</ion-label>
              </ion-item>

              <ion-item-divider />

              <ion-item button @click="logout">
                <ion-label color="danger">Log out</ion-label>
              </ion-item>
            </ion-list>
          </ion-content>
        </ion-popover>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <!-- loading -->
      <div v-if="loading" class="center">
        <ion-progress-bar type="indeterminate" color="danger" />
      </div>

      <!-- content -->
      <div v-else>
        <!-- profile header -->
        <div class="profile-header">
          <div class="avatar">
            <img v-if="profile.user.avatar_url" :src="profile.user.avatar_url.startsWith('http')
              ? profile.user.avatar_url
              : API_BASE + profile.user.avatar_url" />

            <span v-else>{{ initials }}</span>
          </div>

          <h2>{{ fullName }}</h2>
          <p class="username">@{{ profile.user.username }}</p>
        </div>

        <!-- stats -->
        <div class="stats-row">
          <div class="stat clickable" @click="goToWatchlist">
            <strong>{{ profile.stats.watchlist_count }}</strong>
            <span> Watchlist</span>
          </div>

          <div class="stat">
            <strong>{{ profile.stats.followers }}</strong>
            <span> Followers</span>
          </div>

          <div class="stat">
            <strong>{{ profile.stats.following }}</strong>
            <span> Following</span>
          </div>

          <div class="stat">
            <strong>{{ profile.stats.avg_rating }}</strong>
            <span> ★ Avg</span>
          </div>
        </div>

        <!-- internal profile tabs -->
        <div class="profile-tabs">
          <button v-for="t in tabs" :key="t" :class="{ active: activeTab === t }" @click="activeTab = t">
            {{ t }}
          </button>
        </div>

        <!-- profile tab -->
        <section v-if="activeTab === 'Profile'">
          <h3>Favorites</h3>
          <div class="movie-row">
            <img v-for="m in profile.top_movies" :key="m.id" :src="m.poster_url" class="poster" @click="openMovie(m)" />
          </div>
        </section>

        <!-- diary tab -->
        <section v-if="activeTab === 'Diary'">
          <h3>Recent activity</h3>

          <div v-for="r in profile.last_ratings" :key="r.id" class="rating-row">
            <img :src="r.poster_url" class="poster-small" />
            <div>
              <p class="title">{{ r.title }}</p>
              <p class="stars">★ {{ r.stars }}</p>
            </div>
          </div>
        </section>

        <!-- watchlist tab -->
        <section v-if="activeTab === 'Watchlist'">
          <div class="watchlist-header">
            <h3>Watchlist</h3>
            <span class="see-all" @click="goToWatchlist">
              See all →
            </span>
          </div>

          <div class="watchlist-grid">
            <img v-for="m in profile.watchlist_preview" :key="m.id" :src="m.poster_url" class="poster"
              @click="openMovie(m)" />
          </div>
        </section>
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
  IonButtons,
  IonButton,
  IonIcon,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
  IonItemDivider
} from "@ionic/vue";

import { ellipsisVertical } from "ionicons/icons";
import { useRouter } from "vue-router";
import axios from "axios";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { onIonViewWillEnter } from "@ionic/vue";


/* router */
const router = useRouter();

/* state */
const user = JSON.parse(localStorage.getItem("user"));
const loading = ref(true);
const profile = ref(null);
const tabs = ["Profile", "Diary", "Watchlist"];
const activeTab = ref("Profile");

/* admin check */
const isAdmin = computed(() => user?.role === "admin");

/* api */
const PROFILE_API = "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/inc/profile/get_profile.php";

const API_BASE = "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/";


/* computed */
const initials = computed(() =>
  (
    profile.value.user.firstname[0] +
    profile.value.user.lastname[0]
  ).toUpperCase()
);

const fullName = computed(
  () => `${profile.value.user.firstname} ${profile.value.user.lastname}`
);

/* navigation */
function goToWatchlist() {
  router.push({ name: "ProfileWatchlist" });
}

function openMovie(movie) {
  localStorage.setItem(
    "selected_movie",
    JSON.stringify({
      ...movie,
      source: movie.is_default === 1 ? "tmdb" : "internal"
    })
  );

  router.push({
    name: "MovieDetails",
    params: {
      id: movie.tmdb_id ?? movie.movie_id ?? movie.id
    }
  });
}

function goManageAccount() {
  router.push({ name: "ManageAccount" });
}

function goAdmin() {
  router.push({ name: "AdminPage" });
}

function logout() {
  localStorage.clear();
  router.replace("/login");
}

/* load profile */
async function loadProfile() {
  loading.value = true;

  const res = await axios.get(PROFILE_API, {
    params: { user_id: user.id }
  });

  profile.value = res.data.data;
  loading.value = false;
}


onMounted(() => {
  loadProfile();

  window.addEventListener("profile-updated", loadProfile);
  window.addEventListener("watchlist-updated", loadProfile);
});


onIonViewWillEnter(() => {
  loadProfile();
});

onUnmounted(() => {
  window.removeEventListener("profile-updated", loadProfile);
  window.removeEventListener("watchlist-updated", loadProfile);
});


</script>

<style scoped>
.center {
  margin-top: 40px;
}

/* header */
.profile-header {
  text-align: center;
  margin-bottom: 20px;
}

.avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: #333;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: white;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.username {
  color: #aaa;
}

/* stats */
.stats-row {
  display: flex;
  justify-content: space-between;
  max-width: 360px;
  margin: 16px auto 24px;
}

.stat {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.stat span {
  font-size: 0.75rem;
  color: #aaa;
}

.clickable {
  cursor: pointer;
}

/* profile tabs */
.profile-tabs {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
}

.profile-tabs button {
  background: none;
  border: none;
  color: #aaa;
  font-size: 0.9rem;
  padding: 6px 10px;
}

.profile-tabs button.active {
  color: white;
  border-bottom: 2px solid white;
}

/* movies */
.movie-row {
  display: flex;
  gap: 10px;
  overflow-x: auto;
}

.poster {
  width: 90px;
  border-radius: 8px;
  cursor: pointer;
}

/* watchlist grid */
.watchlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.see-all {
  color: #aaa;
  font-size: 0.85rem;
  cursor: pointer;
}

.watchlist-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 12px;
}

/* activity */
.rating-row {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.poster-small {
  width: 55px;
  border-radius: 6px;
}

.title {
  font-weight: 600;
}

.stars {
  color: #f5c518;
}
</style>
