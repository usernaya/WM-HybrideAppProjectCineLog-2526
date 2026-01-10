<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/reviews" />
        </ion-buttons>
        <ion-title>{{ movie?.title || "Movie" }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="movie-content">

      <!-- hero -->
      <div v-if="movie" class="hero">
        <img :src="movie.poster_url" class="hero-poster" />

        <div class="hero-info">
          <h1 class="title">{{ movie.title }}</h1>
          <div class="meta">
            <span>★ {{ avgRating }}</span>
            <span>{{ reviews.length }} reviews</span>
          </div>
        </div>
      </div>

      <!-- rate -->
      <div v-if="user" class="rate-card">
        <h3>Rate this movie</h3>

        <div class="stars-input">
          <ion-icon v-for="n in 5" :key="n" :icon="n <= myStars ? star : starOutline" class="rate-star"
            @click="myStars = n" />
        </div>

        <ion-textarea v-model="myReview" placeholder="Write your review..." auto-grow />

        <ion-button expand="block" color="danger" @click="submitReview">
          Submit review
        </ion-button>
      </div>

      <div v-else class="login-hint">
        Login to rate and write reviews
      </div>

      <!-- reviews -->
      <div class="reviews-list">
        <div v-for="r in reviews" :key="r.id" class="review-card">

          <!-- header -->
          <div class="review-header">
            <span class="user">@{{ r.username }}</span>

            <!-- delete (owner only) -->
            <button v-if="user && r.user_id === user.id" class="delete-text-btn" @click="openDeleteConfirm(r.id)">
              Delete
            </button>
          </div>

          <span class="stars">★ {{ r.stars }}</span>

          <p class="review-text">
            {{ r.review || "No review text" }}
          </p>

          <div class="review-actions">
            <button class="like-btn" @click="toggleLike(r)">
              ❤️ {{ r.like_count }}
            </button>
          </div>
        </div>
      </div>

      <!-- delete confirm -->
      <ion-alert :is-open="showDeleteAlert" header="Delete review"
        message="Ben je zeker dat je je review wil verwijderen?" :buttons="deleteButtons"
        @didDismiss="showDeleteAlert = false" />

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
  IonButton,
  IonTextarea,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonAlert
} from "@ionic/vue";

import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { star, starOutline } from "ionicons/icons";

// route
const route = useRoute();
const movieId = route.params.id;

// auth
const user = JSON.parse(localStorage.getItem("user") || "null");

// state
const movie = ref(null);
const reviews = ref([]);
const myStars = ref(0);
const myReview = ref("");
const stored = JSON.parse(localStorage.getItem("selected_movie") || "null");
if (!stored) {
  console.warn("No selected_movie in storage");
}


// delete alert
const showDeleteAlert = ref(false);
const reviewToDelete = ref(null);

// api
const REVIEWS_API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/reviews.php";

const LIKE_API =
  "https://anaseddaouodisee.be/WM-RESTfulAPIProjectCineLog-2526/api/likes.php";

// load data
async function loadData() {
  const params =
    stored && stored.tmdb_id
      ? { tmdb_id: stored.tmdb_id }
      : { movie_id: movieId };

  const res = await axios.get(REVIEWS_API, { params });

  reviews.value = res.data.data ?? [];

  if (reviews.value.length) {
    movie.value = {
      title: reviews.value[0].title,
      poster_url: reviews.value[0].poster_url
    };
  }
}


// average rating
const avgRating = computed(() => {
  if (!reviews.value.length) return "0.0";
  const sum = reviews.value.reduce((a, r) => a + Number(r.stars), 0);
  return (sum / reviews.value.length).toFixed(1);
});

// submit review
async function submitReview() {
  if (!user || !myStars.value) return;

  const payload = {
  user_id: user.id,
  stars: myStars.value,
  review: myReview.value,
  ...(stored?.tmdb_id
    ? { tmdb_id: stored.tmdb_id }
    : { movie_id: movieId })
};

await axios.post(REVIEWS_API, payload);


  myStars.value = 0;
  myReview.value = "";
  loadData();
}

// delete review
function openDeleteConfirm(id) {
  reviewToDelete.value = id;
  showDeleteAlert.value = true;
}

// delete buttons
const deleteButtons = [
  { text: "Cancel", role: "cancel" },
  {
    text: "Delete",
    role: "destructive",
    handler: async () => {
      await axios.delete(REVIEWS_API, {
        data: {
          review_id: reviewToDelete.value,
          user_id: user.id
        }
      });
      reviewToDelete.value = null;
      loadData();
    }
  }
];

// toggle like
async function toggleLike(r) {
  if (!user) return;

  await axios.post(LIKE_API, {
    user_id: user.id,
    review_id: r.id
  });

  loadData();
}

onMounted(loadData);
</script>

<style scoped>
.movie-content {
  --background: #000;
  color: white;
}

/* hero */
.hero {
  display: flex;
  gap: 18px;
  padding: 20px 16px;
}

.hero-poster {
  width: 130px;
  height: 195px;
  border-radius: 14px;
  object-fit: cover;
}

.meta {
  color: #f5c518;
}

/* rate */
.rate-card {
  margin: 0 16px 24px;
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.06);
}

.stars-input {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.rate-star {
  font-size: 26px;
  color: #f5c518;
  cursor: pointer;
}

/* reviews */
.reviews-list {
  padding: 0 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.review-card {
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user {
  color: #aaa;
}

.stars {
  color: #f5c518;
  font-size: 0.85rem;
}

.review-text {
  margin: 6px 0;
}

/* actions */
.review-actions {
  margin-top: 6px;
}

.like-btn {
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
}

/* delete text button */
.delete-text-btn {
  background: none;
  border: none;
  color: #ff6b6b;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  opacity: 0.7;
}

.delete-text-btn:hover {
  opacity: 1;
  text-decoration: underline;
}

.login-hint {
  text-align: center;
  color: #aaa;
  margin: 20px;
}
</style>
