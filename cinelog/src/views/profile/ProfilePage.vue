<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start" v-if="route.name === 'UserProfile'">
          <ion-button fill="clear" @click="goBack">
            ←
          </ion-button>
        </ion-buttons>


        <ion-title>Profile</ion-title>

        <!-- menu only on own profile -->
        <ion-buttons slot="end" v-if="isOwnProfile">
          <ion-button id="profile-menu-btn" fill="clear">
            <ion-icon :icon="ellipsisVertical" />
          </ion-button>
        </ion-buttons>

        <!-- popover menu (only own profile) -->
        <ion-popover v-if="isOwnProfile" trigger="profile-menu-btn" trigger-action="click" :dismiss-on-select="true"
          side="bottom" alignment="end">
          <ion-content class="ion-no-padding">
            <ion-list lines="none">
              <ion-item button @click="goManageAccount">
                <ion-label>Manage account</ion-label>
              </ion-item>

              <ion-item button @click="router.push('/profile/requests')">
                <ion-label>Friend requests</ion-label>
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

    <ion-content :fullscreen="true" class="page">
      <!-- loading -->
      <div v-if="loading" class="center">
        <ion-progress-bar type="indeterminate" color="danger" />
      </div>

      <!-- content -->
      <div v-else-if="profile" class="wrap">

        <!-- header card -->
        <div class="header-card">
          <div class="avatar">
            <img v-if="avatarSrc" :src="avatarSrc" alt="avatar" />
            <span v-else>{{ initials }}</span>
          </div>

          <div class="header-meta">
            <h2 class="name">{{ fullName }}</h2>
            <p class="username">@{{ profile.user.username }}</p>


            <!-- follow button -->
            <div v-if="!isOwnProfile && loggedUser" class="follow-floating">
              <button type="button" class="follow-pill" :class="relationType"
                :disabled="loadingFollow || relationType === 'requested'" @click.stop.prevent="handleFollowAction">
                {{ followLabel }}
              </button>

            </div>





            <div class="mini-stats">
              <div class="mini clickable" @click="goFollowers">
                <strong>{{ profile.stats.followers }}</strong>
                <span>Followers</span>
              </div>

              <div class="mini clickable" @click="goFollowing">
                <strong>{{ profile.stats.following }}</strong>
                <span>Following</span>
              </div>

              <div class="mini">
                <strong>{{ profile.stats.avg_rating }}</strong>
                <span>★ Avg</span>
              </div>
            </div>
          </div>
        </div>

        <!-- stats row -->
        <div class="stats-row">
          <button class="stat" :class="{ clickable: isOwnProfile }" @click="isOwnProfile && goToWatchlist()">
            <strong>{{ profile.stats.watchlist_count }}</strong>
            <span>Watchlist</span>
          </button>

          <div class="stat">
            <strong>{{ profile.stats.rated_count }}</strong>
            <span>Rated</span>
          </div>
        </div>

        <!-- tabs -->
        <div class="profile-tabs">
          <button v-for="t in tabs" :key="t" :class="{ active: activeTab === t }" @click="activeTab = t">
            {{ t }}
          </button>
        </div>

        <!-- profile tab -->
        <section v-if="activeTab === 'Profile'" class="section">
          <div class="section-head">
            <h3>Favorites</h3>
          </div>

          <div class="movie-row">
            <img v-for="m in profile.top_movies" :key="m.id" :src="m.poster_url" class="poster" @click="openMovie(m)" />
          </div>
        </section>

        <!-- diary tab -->
        <section v-if="activeTab === 'Diary'" class="section">
          <div class="section-head">
            <h3>Recent activity</h3>
          </div>

          <div class="activity">
            <div v-for="r in profile.last_ratings" :key="r.id" class="rating-row">
              <img :src="r.poster_url" class="poster-small" />
              <div class="rating-meta">
                <p class="title">{{ r.title }}</p>
                <p class="stars">★ {{ r.stars }}</p>
                <p class="date" v-if="r.created_at">{{ String(r.created_at).slice(0, 16) }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- watchlist tab -->
        <section v-if="activeTab === 'Watchlist'" class="section">
          <div class="watchlist-header">
            <h3>Watchlist</h3>
            <span class="see-all" v-if="isOwnProfile" @click="goToWatchlist">
              See all →
            </span>
          </div>

          <div class="watchlist-grid">
            <img v-for="m in profile.watchlist_preview" :key="m.id" :src="m.poster_url" class="poster"
              @click="openMovie(m)" />
          </div>
        </section>

      </div>

      <div v-else class="empty">
        Profile not found
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
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import { ref, computed, onMounted, watch } from "vue";
import { onIonViewWillEnter } from "@ionic/vue";

// router
const router = useRouter();
const route = useRoute();

// logged in user
const loggedUser = JSON.parse(localStorage.getItem("user") || "null");

// state
const loading = ref(true);
const profile = ref(null);
const tabs = ["Profile", "Diary", "Watchlist"];
const activeTab = ref("Profile");
const relation = ref([]);
const loadingFollow = ref(false);

// api
const PROFILE_API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/inc/profile/get_profile.php";

const API_BASE =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/";

const FRIENDS_API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/friends.php";

// profile user id
const profileUserId = computed(() => {
  if (route.name === "UserProfile") {
    const pid = route.params.id;
    return pid ? Number(pid) : null;
  }
  return loggedUser?.id ?? null;
});

// is own profile
const isOwnProfile = computed(() => {
  return profileUserId.value === (loggedUser?.id ?? null);
});

// is admin
const isAdmin = computed(() => loggedUser?.role === "admin");

// computed profile data
const initials = computed(() => {
  const u = profile.value?.user;
  if (!u?.firstname || !u?.lastname) return "?";
  return (u.firstname[0] + u.lastname[0]).toUpperCase();
});

const fullName = computed(() => {
  const u = profile.value?.user;
  return u ? `${u.firstname} ${u.lastname}` : "";
});

const avatarSrc = computed(() => {
  const a = profile.value?.user?.avatar_url;
  if (!a) return "";

  const url = String(a).startsWith("http")
    ? String(a)
    : API_BASE + String(a).replace(/^\/+/, "");

  return `${url}?t=${Date.now()}`;
});


// relation type
const relationType = computed(() => {
  if (!Array.isArray(relation.value) || relation.value.length === 0) {
    return "none";
  }

  const me = loggedUser.id;
  const other = profileUserId.value;

  const outgoingAccepted = relation.value.find(
    r => r.user1_id === me && r.user2_id === other && r.status === "accepted"
  );

  const incomingAccepted = relation.value.find(
    r => r.user1_id === other && r.user2_id === me && r.status === "accepted"
  );

  const outgoingPending = relation.value.find(
    r => r.user1_id === me && r.user2_id === other && r.status === "pending"
  );

  const incomingPending = relation.value.find(
    r => r.user1_id === other && r.user2_id === me && r.status === "pending"
  );

  if (outgoingAccepted && incomingAccepted) return "friends";

  if (outgoingPending) return "requested";

  if (incomingPending) return "incoming";

  if (outgoingAccepted) return "following";
  if (incomingAccepted) return "follow_back";

  return "none";
});

// follow button label
const followLabel = computed(() => {
  switch (relationType.value) {
    case "none":
    case "follow_back":
      return "Follow";
    case "requested":
      return "Requested";
    case "incoming":
      return "Accept";
    case "following":
      return "Following";
    case "friends":
      return "Friends";
    default:
      return "Follow";
  }
});

// handle follow button click
async function handleFollowAction() {
  console.log("CLICK", relationType.value);

  if (loadingFollow.value) return;

  switch (relationType.value) {
    case "none":
    case "follow_back":
      await sendFollow();
      break;
    case "incoming":
      await acceptFollow();
      break;
    case "following":
    case "friends":
      await removeFriend();
      break;
  }
}


// navigation
function goFollowers() {
  router.push("/profile/followers");
}

function goFollowing() {
  router.push("/profile/following");
}

function goToWatchlist() {
  router.push({ name: "ProfileWatchlist" });
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

function goBack() {
  router.back();
}

// load profile
async function loadProfile() {
  const id = profileUserId.value;

  if (!id) {
    profile.value = null;
    loading.value = false;
    return;
  }

  loading.value = true;

  try {
    const res = await axios.get(PROFILE_API, {
      params: { user_id: id }
    });
    profile.value = res.data?.data ?? null;
  } catch (e) {
    console.error("loadProfile failed", e);
    profile.value = null;
  } finally {
    loading.value = false;
  }

  await loadRelation();
}

// load relation
async function loadRelation() {
  if (!loggedUser || isOwnProfile.value || !profileUserId.value) return;

  const res = await axios.get(FRIENDS_API, {
    params: {
      user1: loggedUser.id,
      user2: profileUserId.value
    }
  });

  console.log("RELATION API", res.data.data);

  relation.value = res.data.data ?? [];
}

// send follow request
async function sendFollow() {
  console.log("SEND FOLLOW");

  loadingFollow.value = true;

  try {
    const res = await axios.post(FRIENDS_API, {
      user1_id: loggedUser.id,
      user2_id: profileUserId.value
    });

    console.log("POST OK", res.data);

    await loadRelation();
  } catch (err) {
    console.error("POST ERROR", err.response?.data || err);
  } finally {
    loadingFollow.value = false;
  }
}

// accept follow request
async function acceptFollow() {
  if (loadingFollow.value) return;

  loadingFollow.value = true;

  try {
    await axios.put(FRIENDS_API, {
      user1_id: profileUserId.value,
      user2_id: loggedUser.id
    });

    await loadRelation();
  } finally {
    loadingFollow.value = false;
  }
}

// remove friend / unfollow
async function removeFriend() {
  if (loadingFollow.value) return;

  loadingFollow.value = true;

  try {
    await axios.delete(FRIENDS_API, {
      data: {
        user1_id: loggedUser.id,
        user2_id: profileUserId.value
      }
    });

    await loadRelation();
  } finally {
    loadingFollow.value = false;
  }
}

// lifecycle to load profile
onMounted(() => {
  loadProfile();
});

onIonViewWillEnter(() => {
  if (route.name === "Profile") {
    activeTab.value = "Profile";
  }
  loadProfile();
});

watch(
  () => route.params.id,
  () => {
    if (route.name === "UserProfile") {
      activeTab.value = "Profile";
      loadProfile();
    }
  }
);

</script>


<style scoped>
.page {
  --background: #000;
  color: #fff;
}

.center {
  margin-top: 40px;
  padding: 0 14px;
}

.empty {
  text-align: center;
  margin-top: 60px;
  color: #888;
}

.wrap {
  padding: 14px;
}

/* header */
.header-card {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 14px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, .10), rgba(255, 255, 255, .04));
  border: 1px solid rgba(255, 255, 255, .08);
  box-shadow: 0 18px 40px rgba(0, 0, 0, .55);
}

.avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: rgba(255, 255, 255, .10);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-meta {
  flex: 1;
  min-width: 0;
}

.name {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
}

.username {
  margin: 2px 0 10px;
  color: rgba(255, 255, 255, .65);
  font-size: .9rem;
}

.mini-stats {
  display: flex;
  gap: 14px;
}

.mini strong {
  display: block;
  font-size: 1rem;
}

.mini span {
  font-size: .75rem;
  color: rgba(255, 255, 255, .60);
}

/* stats row */
.stats-row {
  margin-top: 12px;
  display: flex;
  gap: 12px;
}

.stat {
  flex: 1;
  background: rgba(255, 255, 255, .06);
  border: 1px solid rgba(255, 255, 255, .08);
  padding: 12px;
  border-radius: 16px;
  text-align: center;
}

.stat strong {
  display: block;
  font-size: 1.05rem;
}

.stat span {
  font-size: .75rem;
  color: rgba(255, 255, 255, .65);
}

.clickable {
  cursor: pointer;
}

/* tabs */
.profile-tabs {
  margin: 16px 0 10px;
  display: flex;
  gap: 10px;
  padding: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, .05);
  border: 1px solid rgba(255, 255, 255, .08);
}

.profile-tabs button {
  flex: 1;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, .7);
  padding: 10px 0;
  border-radius: 999px;
  font-weight: 700;
  font-size: .85rem;
}

.profile-tabs button.active {
  background: rgba(255, 255, 255, .12);
  color: #fff;
}

/* sections */
.section {
  margin-top: 10px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.movie-row {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 6px;
}

.poster {
  width: 92px;
  border-radius: 12px;
  cursor: pointer;
  object-fit: cover;
}

.watchlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.see-all {
  color: rgba(255, 255, 255, .65);
  font-size: .85rem;
  cursor: pointer;
}

.watchlist-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

/* activity */
.activity {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rating-row {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, .06);
  border: 1px solid rgba(255, 255, 255, .08);
}

.poster-small {
  width: 58px;
  border-radius: 10px;
  object-fit: cover;
}

.rating-meta .title {
  margin: 0;
  font-weight: 700;
}

.stars {
  margin: 4px 0 0;
  color: #f5c518;
}

.date {
  margin: 4px 0 0;
  font-size: .75rem;
  color: rgba(255, 255, 255, .55);
}

.follow-container {
  margin-top: 10px;
}

.follow-btn {
  --border-radius: 999px;
  height: 34px;
  min-width: 130px;
  font-weight: 700;
  letter-spacing: .2px;
  transition: all .25s ease;
}

/* default / follow */
.follow-btn.none,
.follow-btn.follow_back {
  --background: #e50914;
  --color: #fff;
}

/* requested */
.follow-btn.requested {
  --background: transparent;
  --color: rgba(255, 255, 255, .7);
  --border-color: rgba(255, 255, 255, .3);
  border: 1px solid rgba(255, 255, 255, .25);
}

/* incoming (accept) */
.follow-btn.incoming {
  --background: #1db954;
  --color: #fff;
}

/* following / friends */
.follow-btn.following,
.follow-btn.friends {
  --background: rgba(255, 255, 255, .08);
  --color: #fff;
  border: 1px solid rgba(255, 255, 255, .2);
}

/* hover subtle */
.follow-btn:hover {
  transform: translateY(-1px);
  opacity: .95;
}

.header-card {
  position: relative;
}

/* container */
.follow-floating {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
}

/* base pill */
.follow-pill {
  height: 30px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: .75rem;
  font-weight: 700;
  letter-spacing: .3px;
  border: none;
  cursor: pointer;
  transition: all .2s ease;
  box-shadow: 0 6px 18px rgba(0, 0, 0, .45);
}

/* follow / follow back */
.follow-pill.none,
.follow-pill.follow_back {
  background: #e50914;
  color: #fff;
}

/* requested */
.follow-pill.requested {
  background: transparent;
  color: rgba(255, 255, 255, .6);
  border: 1px solid rgba(255, 255, 255, .25);
  cursor: default;
}

/* incoming (accept) */
.follow-pill.incoming {
  background: #1db954;
  color: #fff;
}

/* following / friends */
.follow-pill.following,
.follow-pill.friends {
  background: rgba(255, 255, 255, .08);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, .2);
}

/* hover */
.follow-pill:not(.requested):hover {
  transform: translateY(-1px);
  opacity: .95;
}

.follow-pill:disabled {
  opacity: .6;
  cursor: not-allowed;
}
</style>
