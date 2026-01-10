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

      <!-- loading -->
      <div v-if="loading" class="center">
        <ion-progress-bar type="indeterminate" color="danger" />
      </div>

      <!-- movie -->
      <div v-else-if="movie">

        <!-- hero -->
        <div class="hero">
          <img :src="posterSrc" class="poster" />

          <div class="hero-info">
            <h1>{{ movie.title }}</h1>
            <p class="meta">
              ★ {{ avgRating }} · {{ reviews.length }} reviews
            </p>

            <!-- watchlist -->
            <ion-button v-if="user" class="watchlist-btn" color="danger" fill="outline" size="small"
              :disabled="watchlistLoading" @click="toggleWatchlist">
              <ion-icon :icon="inWatchlist ? heart : heartOutline" slot="start" />
              {{ inWatchlist ? "Remove from watchlist" : "Add to watchlist" }}
            </ion-button>
          </div>
        </div>

        <!-- overview -->
        <div class="overview">
          <h3>Overview</h3>
          <p v-if="movie.description">
            {{ movie.description }}
          </p>
          <p v-else class="muted">
            No description available.
          </p>
        </div>

        <!-- rate -->
        <div v-if="user" class="rate-card">
          <h3>Rate this movie</h3>

          <div class="stars-input">
            <ion-icon v-for="n in 5" :key="n" :icon="n <= myStars ? star : starOutline" class="rate-star"
              @click="myStars = n" />
          </div>

          <ion-textarea v-model="myReview" placeholder="Write your review..." auto-grow />

          <ion-button expand="block" color="danger" :disabled="submitting" @click="submitReview">
            Submit review
          </ion-button>
        </div>

        <div v-else class="login-hint">
          Login to rate and add movies to your watchlist
        </div>

        <!-- reviews -->
        <div class="reviews">
          <div v-for="r in reviews" :key="r.id" class="review-card">
            <div class="review-head">
              <span class="user">@{{ r.username }}</span>
              <span class="stars">★ {{ r.stars }}</span>
            </div>

            <p class="text">
              {{ r.review || "No review text" }}
            </p>

            <div class="review-actions">
              <button class="like-btn" @click="toggleLike(r)">
                ❤️ {{ r.like_count }}
              </button>

              <!-- delete (only owner) -->
              <button v-if="user && r.user_id === user.id" class="delete-btn" @click="confirmDelete(r.id)">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- not found -->
      <div v-else class="center">
        Movie not found
      </div>

      <!-- delete confirm -->
      <ion-alert :is-open="showDelete" header="Delete review" message="Ben je zeker dat je je review wil verwijderen?"
        :buttons="deleteButtons" @didDismiss="showDelete = false" />

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
  IonProgressBar,
  IonButton,
  IonTextarea,
  IonIcon,
  IonAlert
} from "@ionic/vue";

import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { star, starOutline, heart, heartOutline } from "ionicons/icons";
import noPoster from "@/assets/posters/no-poster.png";

// user
const user = JSON.parse(localStorage.getItem("user") || "null");

// state
const movie = ref(null);
const reviews = ref([]);
const loading = ref(true);
const submitting = ref(false);

const myStars = ref(0);
const myReview = ref("");

const inWatchlist = ref(false);
const watchlistLoading = ref(false);

// delete review
const showDelete = ref(false);
const reviewToDelete = ref(null);

// api
const REVIEWS_API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/reviews.php";
const LIKES_API =
  "https://anaseddaouodisee.be/WM-RESTfulAPIProjectCineLog-2526/api/likes.php";
const WATCHLIST_API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/watchlist.php";

// computed
const posterSrc = computed(() =>
  movie.value?.poster || movie.value?.poster_url || noPoster
);

// average
const avgRating = computed(() => {
  if (!reviews.value.length) return "0.0";
  const sum = reviews.value.reduce((a, r) => a + Number(r.stars), 0);
  return (sum / reviews.value.length).toFixed(1);
});

// load
async function loadMovie() {
  const stored = localStorage.getItem("selected_movie");
  if (!stored) return (loading.value = false);

  const parsed = JSON.parse(stored);

  movie.value = {
    ...parsed,
    description:
      parsed.source === "tmdb" || parsed.source === "internal"
        ? parsed.description
        : null
  };

  await loadDescriptionIfMissing()
  await loadReviews();
  await checkWatchlist();
  loading.value = false;
}

async function loadDescriptionIfMissing() {
  if (!movie.value || movie.value.description) return;

  try {
    // TMDB fallback uniquement
    if (movie.value.tmdb_id) {
      const res = await axios.get(
        `https://api.themoviedb.org/3/movie/${movie.value.tmdb_id}`,
        {
          params: {
            api_key: "6bc179f67d4901690b3b039f05b87254",
            language: "en-US"
          }
        }
      );

      movie.value.description = res.data.overview || null;
    }
  } catch (e) {
    console.warn("Description load failed", e);
  }
}

async function loadReviews() {
  if (!movie.value || !movie.value.id) {
    reviews.value = [];
    return;
  }

  try {
    const res = await axios.get(REVIEWS_API, {
      params: {
        movie_id: movie.value.id
      }
    });

    reviews.value = Array.isArray(res.data.data)
      ? res.data.data
      : [];

  } catch (e) {
    console.error("Failed to load reviews", e);
    reviews.value = [];
  }
}

// submit
async function submitReview() {
  if (!user || !myStars.value || submitting.value) return;

  submitting.value = true;

  try {
    const payload = {
      user_id: user.id,
      movie_id: movie.value.id,
      stars: myStars.value,
      review: myReview.value || ""
    };

    await axios.post(REVIEWS_API, payload);

    myStars.value = 0;
    myReview.value = "";
    await loadReviews();

  } catch (e) {
    console.error("Review submit failed", e.response?.data || e);
    alert(e.response?.data?.error || "Failed to submit review");
  } finally {
    submitting.value = false;
  }
}

// like
async function toggleLike(r) {
  if (!user) return;

  await axios.post(LIKES_API, {
    user_id: user.id,
    review_id: r.id
  });

  loadReviews();
}

// delete
function confirmDelete(id) {
  reviewToDelete.value = id;
  showDelete.value = true;
}

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
      loadReviews();
    }
  }
];

// watchlist
async function checkWatchlist() {
  if (!user || !movie.value) return;

  const res = await axios.get(WATCHLIST_API, {
    params: {
      user_id: user.id,
      movie_id: movie.value.id ?? null,
      tmdb_id: movie.value.tmdb_id ?? null
    }
  });

  inWatchlist.value = res.data.in_watchlist === true;
}

async function toggleWatchlist() {
  if (!user || watchlistLoading.value) return;

  watchlistLoading.value = true;

  if (!inWatchlist.value) {
    await axios.post(WATCHLIST_API, {
      user_id: user.id,
      movie_id: movie.value.id ?? null,
      tmdb_id: movie.value.tmdb_id ?? null,
      title: movie.value.title,
      poster_url: movie.value.poster_url
    });
    inWatchlist.value = true;
  } else {
    await axios.delete(WATCHLIST_API, {
      data: {
        user_id: user.id,
        movie_id: movie.value.id ?? null,
        tmdb_id: movie.value.tmdb_id ?? null
      }
    });
    inWatchlist.value = false;
  }

  watchlistLoading.value = false;
}

onMounted(loadMovie);
</script>

<style scoped>
.movie-content {
  --background: #000;
  color: white;
}

/* hero */
.hero {
  display: flex;
  gap: 16px;
  padding: 20px;
}

.poster {
  width: 130px;
  height: 195px;
  border-radius: 14px;
  object-fit: cover;
}

.meta {
  color: #f5c518;
}

.watchlist-btn {
  margin-top: 10px;
}

/* overview */
.overview {
  padding: 0 20px 20px;
}

.muted {
  color: #777;
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
.reviews {
  padding: 0 16px 30px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.review-card {
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
}

.review-head {
  display: flex;
  justify-content: space-between;
}

.user {
  color: #aaa;
  font-size: 0.85rem;
}

.review-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
}

.like-btn {
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
}

.delete-btn {
  background: none;
  border: none;
  color: #ff6b6b;
  font-size: 0.8rem;
  cursor: pointer;
  opacity: 0.7;
}

.delete-btn:hover {
  opacity: 1;
}

.login-hint {
  text-align: center;
  color: #aaa;
  margin: 20px;
}
</style>
