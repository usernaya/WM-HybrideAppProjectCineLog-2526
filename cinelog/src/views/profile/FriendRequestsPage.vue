<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/profile" />
        </ion-buttons>
        <ion-title>Friend requests</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="page">

      <!-- loading -->
      <ion-progress-bar v-if="loading" type="indeterminate" color="danger" />

      <!-- empty -->
      <div v-else-if="items.length === 0" class="empty">
        No pending requests
      </div>

      <!-- list -->
      <div v-else class="list">
        <div v-for="r in items" :key="r.id" class="request-card">

          <div class="user">
            <img v-if="r.avatar_url" :src="r.avatar_url.startsWith('http')
              ? r.avatar_url
              : API_BASE + r.avatar_url.replace(/^\/+/, '')" class="avatar" />

            <span v-else class="avatar fallback">
              {{ r.username.slice(0, 2).toUpperCase() }}
            </span>

            <span class="username">@{{ r.username }}</span>
          </div>

          <div class="actions">
            <button class="action-pill accept" @click="accept(r.user1_id)">
              Accept
            </button>

            <button class="action-pill decline" @click="remove(r.user1_id)">
              Decline
            </button>
          </div>

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
import axios from "axios";

const user = JSON.parse(localStorage.getItem("user") || "null");
if (!user) {
  throw new Error("User not logged in");
}

const FRIENDS_API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/friends.php";

const API_BASE =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/";



const loading = ref(true);
const items = ref([]);

async function loadRequests() {
  loading.value = true;

  const res = await axios.get(FRIENDS_API, {
    params: { incoming_for: user.id }
  });

  items.value = res.data.data ?? [];
  loading.value = false;
}

async function accept(fromUserId) {
  await axios.put(FRIENDS_API, {
    user1_id: fromUserId,
    user2_id: user.id
  });

  loadRequests();
}

async function remove(fromUserId) {
  await axios.delete(FRIENDS_API, {
    data: {
      user1_id: fromUserId,
      user2_id: user.id
    }
  });

  loadRequests();
}

onMounted(loadRequests);
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

.request-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, .06);
}

.user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 36px;
  height: 36px;
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
  font-size: .9rem;
}

.request-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  border-radius: 18px;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,.08),
    rgba(255,255,255,.03)
  );
  border: 1px solid rgba(255,255,255,.08);
  box-shadow: 0 12px 30px rgba(0,0,0,.5);
}

/* user */
.user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar.fallback {
  background: rgba(255,255,255,.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.username {
  font-size: .95rem;
  font-weight: 600;
}

/* actions */
.actions {
  display: flex;
  gap: 8px;
}

/* base pill */
.action-pill {
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: .3px;
  border: none;
  cursor: pointer;
  transition: all .2s ease;
  box-shadow: 0 6px 14px rgba(0,0,0,.4);
}

/* accept */
.action-pill.accept {
  background: #1db954;
  color: #fff;
}

/* decline */
.action-pill.decline {
  background: transparent;
  color: rgba(255,255,255,.6);
  border: 1px solid rgba(255,255,255,.25);
}

/* hover */
.action-pill:hover {
  transform: translateY(-1px);
  opacity: .95;
}

</style>
