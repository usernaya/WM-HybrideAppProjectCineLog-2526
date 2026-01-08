<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title class="app-title">CINELOG</ion-title>
      </ion-toolbar>
    </ion-header>


    <ion-content :fullscreen="true">

      <!-- refresher to automatically refresh -->
      <ion-refresher slot="fixed" @ionRefresh="refreshPage">
        <ion-refresher-content pulling-text="Pull to refresh" refreshing-spinner="circles" />
      </ion-refresher>

      <h2 class="category-title ion-padding-start ion-padding-top">
        Trending Movies
      </h2>

      <div class="horizontal-scroll-container">
        <div v-for="film in trending" :key="'trend-' + film.id" class="film-item clickable-card"
          @click="openDetail(film)">
          <img class="film-poster" :src="film.poster_url" :alt="film.title" />
          <ion-text color="light">
            <p class="film-title ion-no-margin">{{ film.title }}</p>
            <p class="film-sub ion-no-margin">{{ film.year }}</p>
          </ion-text>
        </div>
      </div>

      <ion-progress-bar v-if="loadingTop" type="indeterminate" color="danger" />

      <div class="filter-row">

        <ion-select class="filter-select-outline" interface="popover" :value="selectedCategory"
          @ionChange="selectedCategory = $event.detail.value">
          <ion-select-option value="all">All movies</ion-select-option>
          <ion-select-option value="trending">Trending</ion-select-option>
          <ion-select-option value="popular">Popular</ion-select-option>
          <ion-select-option value="top_rated">Top Rated</ion-select-option>
        </ion-select>

        <ion-select class="filter-select-outline" interface="popover" :value="selectedGenre"
          @ionChange="selectedGenre = $event.detail.value">
          <ion-select-option value="all">All genres</ion-select-option>
          <ion-select-option v-for="g in genres" :key="g" :value="g">
            {{ g }}
          </ion-select-option>
        </ion-select>

      </div>

      <ion-grid>
        <ion-row>
          <ion-col v-for="film in filteredMovies" :key="'grid-' + film.id" size="6" size-md="4" size-lg="3"
            class="grid-col">
            <div class="grid-film-card clickable-card" @click="openDetail(film)">
              <img class="grid-film-poster" :src="film.poster_url" :alt="film.title" />
              <h3 class="grid-film-title">{{ film.title }}</h3>
              <p class="grid-film-sub">
                {{ film.year }}
                <span v-if="film.genres.length">
                  · {{ film.genres[0] }}
                </span>
              </p>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>

      <div v-if="!loadingGrid && filteredMovies.length === 0" class="ion-text-center ion-padding">
        <ion-text color="medium">
          <p>No movies found</p>
        </ion-text>
      </div>


      <ion-progress-bar v-if="loadingGrid" type="indeterminate" color="danger" />

    </ion-content>
  </ion-page>
</template>


<script setup>
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonText, IonProgressBar, IonGrid, IonRow, IonCol,
  IonSelect, IonSelectOption, IonRefresher, IonRefresherContent
} from "@ionic/vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { ref, computed } from "vue";

const router = useRouter();

const BASE =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/inc/movies";

// state
const trending = ref([]);
const popular = ref([]);
const topRated = ref([]);
const internalMovies = ref([]);

const loadingTop = ref(true);
const loadingGrid = ref(true);

const selectedCategory = ref("all");
const selectedGenre = ref("all");

// genres list
const genres = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama",
  "Family", "Fantasy", "History", "Horror", "Music", "Mystery", "Romance",
  "Science Fiction", "TV Movie", "Thriller", "War", "Western"
];

const tmdbGenreMap = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime", 99: "Documentary",
  18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Science Fiction", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western"
};

// mapping functions
function mapInternalMovie(m) {
  return {
    id: m.id,
    tmdb_id: null,
    title: m.title,
    year: String(m.year),
    poster_url: m.poster_url,
    genres: m.genre ? [m.genre] : [],
    description: m.description || "No description available.",
    source: "internal",
    categories: ["all"]
  };
}

function mapTmdbMovie(m, category) {
  return {
    id: m.id,
    tmdb_id: m.id,
    title: m.title,
    year: m.release_date?.slice(0, 4) || "",
    poster_url: m.poster_path
      ? "https://image.tmdb.org/t/p/w300" + m.poster_path
      : "",
    genres: (m.genre_ids || []).map(id => tmdbGenreMap[id]).filter(Boolean),
    description: m.overview || "No description available.",
    source: "tmdb",
    categories: ["all", category]
  };
}

// load top sections
async function loadTopSections() {
  try {
    const res = await axios.get(`${BASE}/get_all.php`);
    const parsed = JSON.parse(res.data.data);

    internalMovies.value = parsed.internal.map(mapInternalMovie);
    trending.value = (parsed.tmdb_trending || []).map(m =>
      mapTmdbMovie(m, "trending")
    );
  } finally {
    loadingTop.value = false;
  }
}

async function loadPopularTopRated() {
  try {
    const popRes = await axios.get(`${BASE}/TMDB_API/popular.php`);
    const topRes = await axios.get(`${BASE}/TMDB_API/top_rated.php`);

    popular.value = JSON.parse(popRes.data.data).results.map(m =>
      mapTmdbMovie(m, "popular")
    );

    topRated.value = JSON.parse(topRes.data.data).results.map(m =>
      mapTmdbMovie(m, "top_rated")
    );
  } finally {
    loadingGrid.value = false;
  }
}

// refresh page
async function refreshPage(event) {
  loadingTop.value = true;
  loadingGrid.value = true;

  trending.value = [];
  popular.value = [];
  topRated.value = [];
  internalMovies.value = [];

  await Promise.all([
    loadTopSections(),
    loadPopularTopRated()
  ]);

  event.target.complete();
}

// combined for grid
const allMoviesForGrid = computed(() => {
  const seen = new Set();
  const list = [];

  [...trending.value, ...popular.value, ...topRated.value].forEach(m => {
    if (!seen.has(m.id)) {
      seen.add(m.id);
      list.push(m);
    }
  });

  return [...internalMovies.value, ...list];
});

const filteredMovies = computed(() => {
  let list = allMoviesForGrid.value;

  if (selectedCategory.value !== "all") {
    list = list.filter(m =>
      m.categories.includes(selectedCategory.value)
    );
  }

  if (selectedGenre.value !== "all") {
    list = list.filter(m =>
      m.genres.some(g => g.toLowerCase() === selectedGenre.value.toLowerCase())
    );
  }

  return list;
});

// open movie details
function openDetail(movie) {
  localStorage.setItem("selected_movie", JSON.stringify(movie));

  router.push({
    name: "MovieDetails",
    params: { id: movie.tmdb_id ?? movie.id }
  });
}

// initial load
loadTopSections();
loadPopularTopRated();
</script>


<style scoped>
/* black theme */
ion-content::part(background) {
  --background: #000 !important;
}

ion-toolbar {
  --background: #000 !important;
  --color: white !important;
}

/* title app */
.app-title {
  text-align: center;
  font-weight: 800;
  letter-spacing: 10px;
}


/* clickable items */
.clickable-card {
  cursor: pointer;
}

/* section titles */
.category-title {
  color: white;
  font-size: 1.3rem;
  font-weight: 700;
}

/* horizontal lists */
.horizontal-scroll-container {
  display: flex;
  overflow-x: auto;
  padding: 0 10px 12px 10px;
  scrollbar-width: none;
}

.horizontal-scroll-container::-webkit-scrollbar {
  display: none;
}

.film-item {
  width: 120px;
  flex-shrink: 0;
  margin-right: 10px;
}

.film-poster {
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  border-radius: 6px;
}

.film-title {
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.film-sub {
  color: #999;
  font-size: 0.8rem;
}

/* filters */
.filter-row {
  display: flex;
  gap: 10px;
  padding: 10px;
}

.filter-select-outline {
  --placeholder-color: white;
  --color: white;
  --background: transparent;
  --padding-start: 12px;
  --padding-end: 12px;
  border: 1px solid #444;
  border-radius: 10px;
  min-width: 120px;
}

/* grid */
.grid-col {
  padding: 10px;
}

.grid-film-card {
  text-align: center;
}

.grid-film-poster {
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  border-radius: 10px;
}

.grid-film-title {
  color: white;
  margin-top: 8px;
  font-size: 15px;
  font-weight: 600;
}

.grid-film-sub {
  color: #bbb;
  font-size: 13px;
}

/* animations */

.film-poster {
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  border-radius: 6px;

  transition: transform 0.2s ease, box-shadow 0.2s ease;
  z-index: 1;
  position: relative;
}

.film-item:hover .film-poster {
  transform: scale(1.1) translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.6);
  z-index: 10;
}

.film-item:active .film-poster {
  transform: scale(1.05) translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.5);
  z-index: 10;
}


.grid-film-card {
  text-align: center;
}

.grid-film-poster {
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  border-radius: 10px;

  transition: transform 0.2s ease, box-shadow 0.2s ease;
  z-index: 1;
  position: relative;
}

.grid-film-card:hover .grid-film-poster {
  transform: scale(1.1) translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.6);
  z-index: 10;
}

.grid-film-card:active .grid-film-poster {
  transform: scale(1.05) translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.5);
  z-index: 10;
}
</style>