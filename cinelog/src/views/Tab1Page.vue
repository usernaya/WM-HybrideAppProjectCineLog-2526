<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Film Catalogus</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">

      <h2 class="category-title ion-padding-start ion-padding-top">
        Trending films
      </h2>

      <div class="horizontal-scroll-container">
        <div 
          v-for="film in trending" 
          :key="'trend-' + film.id" 
          class="film-item clickable-card" 
          @click="openDetail(film)"
        >
          <div class="film-card-content">
            <img class="film-poster" :src="film.poster_url" :alt="film.title" />
            <ion-text color="light">
              <p class="film-title ion-no-margin">{{ film.title }}</p>
              <p class="film-sub ion-no-margin">{{ film.year }}</p>
            </ion-text>
          </div>
        </div>
      </div>

      <ion-progress-bar v-if="loadingTop" type="indeterminate" color="danger"></ion-progress-bar>

      <div class="filter-row">

        <ion-select class="filter-select-outline"
          interface="popover"
          :value="selectedCategory"
          @ionChange="selectedCategory = $event.detail.value"
        >
          <ion-select-option value="all">Alle films</ion-select-option>
          <ion-select-option value="trending">Trending</ion-select-option>
          <ion-select-option value="popular">Popular</ion-select-option>
          <ion-select-option value="top_rated">Top Rated</ion-select-option>
        </ion-select>

        <ion-select class="filter-select-outline"
          interface="popover"
          :value="selectedGenre"
          @ionChange="selectedGenre = $event.detail.value"
        >
          <ion-select-option value="all">Alle genres</ion-select-option>
          <ion-select-option v-for="g in genres" :key="g" :value="g">{{ g }}</ion-select-option>
        </ion-select>

      </div>

      <ion-grid>
        <ion-row>
          <ion-col
            v-for="film in filteredMovies"
            :key="'grid-' + film.id"
            size="6"
            size-md="4"
            size-lg="3"
            class="grid-col"
          >
            <div class="grid-film-card clickable-card" @click="openDetail(film)">
              <img class="grid-film-poster" :src="film.poster_url" :alt="film.title" />
              <h3 class="grid-film-title">{{ film.title }}</h3>
              <p class="grid-film-sub">
                {{ film.year }}
                <span v-if="film.genres.length"> · {{ film.genres[0] }}</span>
              </p>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-progress-bar v-if="loadingGrid" type="indeterminate" color="danger"></ion-progress-bar>

    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonText, IonProgressBar, IonGrid, IonRow, IonCol,
  IonSelect, IonSelectOption
} from "@ionic/vue";
import { useRouter } from 'vue-router';
import axios from "axios";
import { ref, computed } from "vue";

const router = useRouter();

const BASE = "https://anaseddaouodisee.be/WM-RESTfulAPIProjectCineLog-2526/api/inc/movies/get_all.php";

// main data
const trending = ref([]);
const popular = ref([]);
const topRated = ref([]);
const internalMovies = ref([]);

const loadingTop = ref(true);
const loadingGrid = ref(true);

// filters
const selectedCategory = ref("all");
const selectedGenre = ref("all");

// tmdb api genre list
const genres = [
  "Action","Adventure","Animation","Comedy","Crime","Documentary","Drama",
  "Family","Fantasy","History","Horror","Music","Mystery","Romance",
  "Science Fiction","TV Movie","Thriller","War","Western"
];

const tmdbGenreMap = {
  28:"Action",12:"Adventure",16:"Animation",35:"Comedy",80:"Crime",99:"Documentary",
  18:"Drama",10751:"Family",14:"Fantasy",36:"History",27:"Horror",10402:"Music",
  9648:"Mystery",10749:"Romance",878:"Science Fiction",10770:"TV Movie",
  53:"Thriller",10752:"War",37:"Western"
};

// formatting movie data (met toevoeging van description/overview)
function mapInternalMovie(m) {
  return {
    id: m.id,
    title: m.title,
    year: String(m.year),
    poster_url: m.poster_url,
    source: "internal",
    categories: ["all"],
    genres: m.genre ? [m.genre] : [],
    releaseDate: null,
    description: m.description || "Geen beschrijving beschikbaar.", 
  };
}

function mapTmdbMovie(m, category) {
  return {
    id: m.id,
    title: m.title,
    year: m.release_date ? m.release_date.slice(0, 4) : "",
    poster_url: m.poster_path
      ? "https://image.tmdb.org/t/p/w300" + m.poster_path
      : "",
    source: "tmdb",
    categories: ["all", category],
    genres: (m.genre_ids || []).map(id => tmdbGenreMap[id]).filter(Boolean),
    releaseDate: m.release_date || null,
    description: m.overview || "Geen beschrijving beschikbaar.",
  };
}

// load trending + internal
async function loadTopSections() {
  try {
    console.log("TEST API CALL:", `${BASE}/get_all.php`);

    const res = await axios.get(`${BASE}/get_all.php`);
    console.log("API RESPONSE:", res);

    const parsed = JSON.parse(res.data.data);
    internalMovies.value = parsed.internal.map(mapInternalMovie);

    const trendingRaw = parsed.tmdb_trending || [];
    trending.value = trendingRaw.map(m => mapTmdbMovie(m, "trending"));

  } catch (err) {
    console.error("API ERROR:", err);
  } finally {
    loadingTop.value = false;
  }
}


// load popular + top rated
async function loadPopularTopRated() {
  try {
    const popRes = await axios.get(`${BASE}/TMDB_API/popular.php`);
    const popParsed = JSON.parse(popRes.data.data);
    popular.value = (popParsed.results || []).map(m =>
      mapTmdbMovie(m, "popular")
    );

    const topRes = await axios.get(`${BASE}/TMDB_API/top_rated.php`);
    const topParsed = JSON.parse(topRes.data.data);
    topRated.value = (topParsed.results || []).map(m =>
      mapTmdbMovie(m, "top_rated")
    );

  } finally {
    loadingGrid.value = false;
  }
}

loadTopSections();
loadPopularTopRated();

// computed voor alle films in de grid
const allMoviesForGrid = computed(() => {
  const allTmdb = [...trending.value, ...popular.value, ...topRated.value];
  const unique = [];
  const seen = new Set();

  for (const m of allTmdb) {
    if (!seen.has(m.id)) {
      seen.add(m.id);
      unique.push(m);
    }
  }

  return [...internalMovies.value, ...unique];
});

const filteredMovies = computed(() => {
  let list = allMoviesForGrid.value;

  if (selectedCategory.value !== "all") {
    list = list.filter(m => m.categories.includes(selectedCategory.value));
  }

  if (selectedGenre.value !== "all") {
    const g = selectedGenre.value.toLowerCase();
    list = list.filter(m =>
      m.genres.some(gg => gg.toLowerCase() === g)
    );
  }

  return list;
});


// Functie voor navigatie naar de detailpagina
function openDetail(film) {
  // Sla het volledige filmobject op in localStorage om op de detailpagina op te halen
  localStorage.setItem("selected_movie", JSON.stringify(film));

  router.push({
    name: "MovieDetails",
    params: { id: film.id }
  });
}

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

/* Klikbare items */
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

/* filters (option b: outline style) */
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
/* animatiess */

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