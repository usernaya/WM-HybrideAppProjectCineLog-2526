<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Reviews</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="page">

      <!-- sort -->
      <div class="sort-bar">
        <ion-segment v-model="activeSort" @ionChange="loadReviews">
          <ion-segment-button value="recent">
            <ion-label>Recent</ion-label>
          </ion-segment-button>
          <ion-segment-button value="likes_desc">
            <ion-label>Top</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>

      <!-- loading -->
      <ion-progress-bar v-if="loading" type="indeterminate" color="danger" />

      <!-- empty -->
      <div v-else-if="items.length === 0" class="empty">
        No reviews yet
      </div>

      <!-- feed -->
      <div v-else class="feed">
        <article v-for="r in items" :key="r.id" class="card" @click="openMovie(r)">
          <!-- poster -->
          <img class="poster" :src="r.poster" />

          <!-- content -->
          <div class="body">

            <!-- movie + stars -->
            <div class="top">
              <h3 class="movie">{{ r.movieTitle }}</h3>

              <div class="stars">
                <ion-icon v-for="i in 5" :key="i" :icon="i <= r.stars ? star : starOutline" />
              </div>
            </div>

            <!-- review -->
            <p class="text">
              {{ r.reviewText || "No review text" }}
            </p>

            <!-- footer -->
            <div class="footer">

              <!-- user -->
              <button class="user" @click.stop="openProfile(r.user_id)">
                <img v-if="r.avatar" :src="r.avatar" class="avatar" />
                <span v-else class="avatar fallback">
                  {{ r.initials }}
                </span>
                <span class="username">@{{ r.username }}</span>
              </button>

              <!-- like -->
              <button class="like" @click.stop="toggleLike(r)">
                <ion-icon :icon="heart" />
                <span>{{ r.likes }}</span>
              </button>

            </div>
          </div>
        </article>
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
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
  IonProgressBar,
  toastController,
  onIonViewWillEnter
} from "@ionic/vue";

import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { heart, star, starOutline } from "ionicons/icons";

// router
const router = useRouter();
const user = JSON.parse(localStorage.getItem("user") || "null");

// api
const REVIEWS_API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/reviews.php";
const LIKE_API =
  "https://anaseddaouodisee.be/WM-RESTfulAPIProjectCineLog-2526/api/likes.php";

// state
const loading = ref(true);
const activeSort = ref("recent");
const items = ref([]);

// helpers
const initials = (name) =>
  name ? name.slice(0, 2).toUpperCase() : "?";

const normalize = (r) => ({
  id: Number(r.id),

  movie_id: r.movie_id,
  tmdb_id: r.tmdb_id,
  is_tmdb: !!r.tmdb_id,

  user_id: Number(r.user_id),

  movieTitle: r.title,
  poster: r.poster_url?.trim() || "https://via.placeholder.com/300x450",

  username: r.username,
  avatar: r.avatar_url,
  initials: initials(r.username),

  stars: Number(r.stars),
  reviewText: r.review,
  likes: Number(r.like_count)
});


// load reviews
async function loadReviews() {
  loading.value = true;

  try {
    const res = await axios.get(REVIEWS_API, {
      params: { sort: activeSort.value }
    });

    items.value = (res.data.data ?? []).map(normalize);
  } finally {
    loading.value = false;
  }
}

onIonViewWillEnter(loadReviews);

// open movie details
const openMovie = (r) => {
  const movie = {
    id: r.movie_id,
    title: r.movieTitle,
    poster_url: r.poster,
    description: null,
    source: "internal"
  };

  localStorage.setItem("selected_movie", JSON.stringify(movie));

  router.push({
    name: "MovieDetails",
    params: { id: r.movie_id }
  });
};

const openProfile = async (id) => {
  if (!user?.id) {
    return router.push("/login");
  }

  router.push({
    name: "UserProfile",
    params: { id }
  });
};

// toggle like
async function toggleLike(r) {
  if (!user?.id) {
    const t = await toastController.create({
      message: "Login required",
      duration: 1500
    });
    return t.present();
  }

  await axios.post(LIKE_API, {
    user_id: user.id,
    review_id: r.id
  });

  loadReviews();
}
</script>

<style scoped>
.page {
  --background: #000;
  color: #fff;
}

/* sort */
.sort-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 12px;
  background: linear-gradient(180deg, #000 80%, transparent);
}

/* empty */
.empty {
  text-align: center;
  margin-top: 60px;
  color: #777;
}

/* feed */
.feed {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* card */
.card {
  display: flex;
  gap: 14px;
  background: linear-gradient(180deg,
      rgba(255, 255, 255, .08),
      rgba(255, 255, 255, .03));
  border-radius: 18px;
  padding: 14px;
  box-shadow: 0 18px 36px rgba(0, 0, 0, .45);
  cursor: pointer;
}

/* poster */
.poster {
  width: 78px;
  height: 116px;
  border-radius: 12px;
  object-fit: cover;
}

/* body */
.body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* top */
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.movie {
  font-size: 1rem;
  font-weight: 700;
}

.stars ion-icon {
  font-size: 14px;
  color: #f5c518;
}

/* text */
.text {
  margin: 6px 0;
  font-size: .9rem;
  line-height: 1.35;
  color: rgba(255, 255, 255, .9);

  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* footer */
.footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* user */
.user {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #aaa;
}

.avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar.fallback {
  background: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .7rem;
  color: #fff;
}

.username {
  font-size: .75rem;
}

/* like */
.like {
  background: none;
  border: none;
  color: #ff6b6b;
  display: flex;
  gap: 4px;
  align-items: center;
}
</style>
