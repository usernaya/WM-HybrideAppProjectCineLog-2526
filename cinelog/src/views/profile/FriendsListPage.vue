<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/profile" />
        </ion-buttons>
        <ion-title>{{ title }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="page">

      <!-- loading -->
      <ion-progress-bar v-if="loading" type="indeterminate" color="danger" />

      <!-- empty -->
      <div v-else-if="users.length === 0" class="empty">
        No {{ title.toLowerCase() }}
      </div>

      <!-- list -->
      <div v-else class="list">
        <div v-for="u in users" :key="u.id" class="user-card" @click="openProfile(u.id)">
          <img v-if="u.avatar_url" :src="avatar(u.avatar_url)" class="avatar" />
          <span v-else class="avatar fallback">
            {{ u.username.slice(0, 2).toUpperCase() }}
          </span>

          <span class="username">@{{ u.username }}</span>
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

import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();

const user = JSON.parse(localStorage.getItem("user") || "null");

if (!user) {
  throw new Error("Not authenticated");
}

const FRIENDS_API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/friends.php";

const API_BASE =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/";

const loading = ref(true);
const users = ref([]);

/* followers | following */
const mode = computed(() => route.params.mode);

const title = computed(() =>
  mode.value === "followers" ? "Followers" : "Following"
);

function avatar(url) {
  return url.startsWith("http")
    ? url
    : API_BASE + url.replace(/^\/+/, "");
}

async function loadUsers() {
  loading.value = true;

  const params =
    mode.value === "followers"
      ? { followers_of: user.id }
      : { following_of: user.id };

  const res = await axios.get(FRIENDS_API, { params });

  const list = res.data.data ?? [];

  // enrich with relation data
  for (const u of list) {
    const rel = await axios.get(FRIENDS_API, {
      params: {
        user1: user.id,
        user2: u.id
      }
    });

    u.relation = rel.data.data ?? [];
  }

  users.value = list;
  loading.value = false;
}


function openProfile(id) {
  router.push(`/user/${id}`);
}

onMounted(loadUsers);
</script>

<style scoped>
.page {
  --background: #000;
  color: #fff;
}

.empty {
  text-align: center;
  margin-top: 60px;
  color: #777;
}

.list {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, .06);
  cursor: pointer;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar.fallback {
  background: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.username {
  font-size: .95rem;
}
</style>
