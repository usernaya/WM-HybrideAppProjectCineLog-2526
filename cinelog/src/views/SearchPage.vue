<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Search</ion-title>

                <ion-buttons slot="end">
                    <ion-button fill="clear" @click="openRequestModal">
                        <ion-icon :icon="addOutline" size="large" />
                    </ion-button>
                </ion-buttons>

            </ion-toolbar>
        </ion-header>


        <ion-content class="search-content">

            <!-- search bar -->
            <div class="search-bar-wrapper">
                <ion-searchbar v-model="query" placeholder="Search a movie..." @ionInput="onSearch" debounce="400" />
            </div>

            <!-- loading -->
            <ion-progress-bar v-if="loading" type="indeterminate" color="danger" />

            <!-- search results -->
            <div v-if="query.length >= 2 && movies.length" class="grid">
                <div v-for="m in movies" :key="m.id + m.source" class="card" @click="openMovie(m)">
                    <img :src="m.poster" />
                    <div class="overlay">
                        <p class="title">{{ m.title }}</p>
                        <p v-if="m.year" class="year">{{ m.year }}</p>
                    </div>
                </div>
            </div>

            <!-- empty -->
            <div v-if="query.length >= 2 && !loading && !movies.length" class="empty">
                <p>No results found</p>
            </div>


        </ion-content>
    </ion-page>

    <ion-modal :is-open="showRequestModal" @didDismiss="closeRequestModal">
        <ion-header>
            <ion-toolbar>
                <ion-title>Request a movie</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="closeRequestModal">Close</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <ion-item>
                <ion-input v-model="requestForm.title" label="Title" label-placement="stacked"
                    placeholder="Movie title" />
            </ion-item>

            <ion-item>
                <ion-input v-model="requestForm.year" label="Year" label-placement="stacked" type="number" />
            </ion-item>

            <ion-item>
                <ion-input v-model="requestForm.director" label="Director" label-placement="stacked" />
            </ion-item>

            <ion-button expand="block" class="ion-margin-top" :disabled="sendingRequest || !requestForm.title"
                @click="sendMovieRequest">
                Send request
            </ion-button>
        </ion-content>
    </ion-modal>

</template>

<script setup>
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonProgressBar,
    IonButtons,
    IonButton,
    IonIcon,
    IonModal,
    IonItem,
    IonInput,
    toastController,
    onIonViewWillEnter,
    onIonViewDidLeave
} from "@ionic/vue";

import { addOutline } from "ionicons/icons";
import { ref, computed } from "vue";
import axios from "axios";
import noPoster from "@/assets/posters/no-poster.png";
import { useRouter } from "vue-router";

const router = useRouter();

// api
const API =
    "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/inc/movies/search_all.php";

const REQUEST_API =
    "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/movie_requests.php";


// state
const query = ref("");
const loading = ref(false);
const user = JSON.parse(localStorage.getItem("user") || "null");

const results = ref({
    internal: [],
    tmdb: []
});

// modal
const showRequestModal = ref(false);
const sendingRequest = ref(false);

const requestForm = ref({
    title: "",
    year: "",
    director: ""
});

// computed movies
const movies = computed(() => [
    ...results.value.internal.map(m => ({ ...m, source: "internal" })),
    ...results.value.tmdb.map(m => ({ ...m, source: "tmdb" }))
]);

// search action
async function onSearch() {
    if (query.value.trim().length < 2) {
        results.value.internal = [];
        results.value.tmdb = [];
        return;
    }

    loading.value = true;

    try {
        const res = await axios.get(API, {
            params: { q: query.value }
        });

        const data = JSON.parse(res.data.data);

        results.value.internal = data.internal
            .map(m => normalizeMovie(m, "internal"))
            .filter(Boolean);

        results.value.tmdb = data.tmdb
            .map(m => normalizeMovie(m, "tmdb"))
            .filter(Boolean);

    } catch (e) {
        console.error("Search error", e);
    } finally {
        loading.value = false;
    }
}


function openMovie(movie) {
    localStorage.setItem("selected_movie", JSON.stringify({
        id: movie.id,           
        tmdb_id: movie.tmdb_id,
        title: movie.title,
        poster_url: movie.poster,
        description: movie.description,
        source: movie.source
    }));



    router.push({
        name: "MovieDetails",
        params: { id: movie.tmdb_id ?? movie.id }
    });

}

function normalizeMovie(movie, source) {
    return {
        ...movie,
        description:
            source === "tmdb"
                ? movie.overview || "No description available."
                : movie.description || "No description available.",

        year:
            source === "tmdb"
                ? movie.release_date?.split("-")[0]
                : movie.year,

        poster:
            source === "tmdb" && movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : movie.poster_url || noPoster,

        tmdb_id: source === "tmdb" ? movie.id : null,
        source
    };
}

// request modal
function openRequestModal() {
    if (!user) {
        router.push({ name: "Login" });
        return;
    }

    showRequestModal.value = true;
}


function closeRequestModal() {
    showRequestModal.value = false;
    requestForm.value = {
        title: "",
        year: "",
        director: ""
    };
}

async function sendMovieRequest() {
    if (!user || !requestForm.value.title) return;

    sendingRequest.value = true;

    try {
        await axios.post(REQUEST_API, {
            title: requestForm.value.title,
            year: requestForm.value.year || null,
            director: requestForm.value.director || null,
            user_id: user.id
        });



        showToast("Movie request sent successfully");
        closeRequestModal();

    } catch (e) {
        console.error(e);
        showToast("Failed to send request");
    } finally {
        sendingRequest.value = false;
    }
}

async function showToast(message) {
    const toast = await toastController.create({
        message,
        duration: 1600,
        position: "bottom"
    });
    await toast.present();
}

// reset state when entering the view
onIonViewWillEnter(() => {
    // reset state 
    loading.value = false;
    query.value = "";
    results.value.internal = [];
    results.value.tmdb = [];
});

// reset state when leaving the view
onIonViewDidLeave(() => {
    query.value = "";
    loading.value = false;
});

</script>

<style scoped>
/* layout */
.search-content {
    --background: #000;
}

/* search bar */
.search-bar-wrapper {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #000;
    padding: 8px 12px;
}

/* grid */
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 14px;
    padding: 12px;
}

/* card */
.card {
    position: relative;
    cursor: pointer;
}

.card img {
    width: 100%;
    height: 210px;
    object-fit: cover;
    border-radius: 14px;
    background: #111;
}

/* overlay */
.overlay {
    position: absolute;
    inset: auto 0 0 0;
    padding: 8px;
    border-radius: 0 0 14px 14px;
    background: linear-gradient(to top,
            rgba(0, 0, 0, 0.85),
            rgba(0, 0, 0, 0));
}

.title {
    color: #fff;
    font-size: 0.85rem;
    font-weight: 600;
    line-height: 1.2;
}

.year {
    font-size: 0.7rem;
    color: #bbb;
}

/* search bar */

ion-searchbar {
    --background: #111;
    --color: #fff;
    --placeholder-color: #777;
    --border-radius: 999px;
    --box-shadow: none;
    --icon-color: #777;
    --clear-button-color: #777;
    padding-inline-start: 0;
    padding-inline-end: 0;
}

/* input height */
ion-searchbar::part(input) {
    height: 42px;
    font-size: 0.9rem;
}

/* remove default border */
ion-searchbar::part(container) {
    border-radius: 999px;
    border: none;
}

/* focus state  */
ion-searchbar.searchbar-has-focus {
    --background: #151515;
}


/* empty */
.empty {
    text-align: center;
    margin-top: 40px;
    color: #777;
}
</style>
