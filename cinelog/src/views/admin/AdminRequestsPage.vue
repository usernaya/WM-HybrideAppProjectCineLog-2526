<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/admin" />
        </ion-buttons>
        <ion-title>Movie Requests</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- loading -->
      <div v-if="loading" class="center">
        <ion-progress-bar type="indeterminate" />
      </div>

      <template v-else>
        <!-- tabs -->
        <div class="tabs">
          <button :class="{ active: activeTab === 'pending' }" @click="activeTab = 'pending'">
            Pending ({{ pendingRequests.length }})
          </button>

          <button :class="{ active: activeTab === 'handled' }" @click="activeTab = 'handled'">
            Handled ({{ handledRequests.length }})
          </button>
        </div>

        <!-- empty -->
        <div v-if="activeList.length === 0" class="empty">
          <p v-if="activeTab === 'pending'">No pending requests</p>
          <p v-else>No handled requests yet</p>
        </div>

        <!-- list -->
        <div v-else class="list">
          <div v-for="req in activeList" :key="req.id" class="request-card">
            <div class="top">
              <h3>{{ req.title }}</h3>
              <span class="badge" :class="req.status">
                {{ req.status }}
              </span>
            </div>

            <p class="meta">
              {{ req.year || "—" }} · {{ req.director || "Unknown director" }}
            </p>

            <p class="by">
              Requested by <strong>{{ req.username || "Unknown" }}</strong>
            </p>

            <p v-if="req.status !== 'pending'" class="handled">
              Handled by
              <strong>{{ req.handled_by_username || "Admin" }}</strong>
              · {{ formatDate(req.handled_at) }}
            </p>

            <div class="actions" v-if="req.status === 'pending'">
              <ion-button size="small" fill="outline" color="medium" :disabled="processing"
                @click="confirmReject(req.id)">
                Reject
              </ion-button>

              <ion-button size="small" class="approve" :disabled="processing" @click="approve(req)">
                Approve
              </ion-button>

            </div>
          </div>
        </div>
      </template>
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
  IonButton,
  IonProgressBar,
  toastController,
  alertController
} from "@ionic/vue";

import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

// router
const router = useRouter();

// state
const loading = ref(true);
const processing = ref(false);
const requests = ref([]);
const activeTab = ref("pending");

const user = JSON.parse(localStorage.getItem("user") || "null");

// api
const API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/movie_requests.php";

// computed lists
const pendingRequests = computed(() =>
  requests.value.filter(r => r.status === "pending")
);

const handledRequests = computed(() =>
  requests.value.filter(r => r.status !== "pending")
);

const activeList = computed(() =>
  activeTab.value === "pending"
    ? pendingRequests.value
    : handledRequests.value
);

// load requests
async function loadRequests() {
  loading.value = true;
  try {
    const res = await axios.get(API);
    requests.value = res.data.data ?? [];
  } catch (e) {
    console.error(e);
    showToast("Failed to load requests");
  } finally {
    loading.value = false;
  }
}
onMounted(loadRequests);

// actions
function approve(req) {
  router.push({
    name: "AdminApproveRequest",
    params: { id: req.id }
  });
}

// reject
async function reject(id) {
  if (!user?.id) {
    showToast("Not logged in");
    return;
  }

  processing.value = true;

  try {
    await axios.put(API, {
      id,
      admin_id: user.id,
      status: "rejected"
    });

    showToast("Request rejected");
    await loadRequests();
    activeTab.value = "pending";
  } catch (e) {
    console.error(e);
    showToast("Failed to reject request");
  } finally {
    processing.value = false;
  }
}

async function confirmReject(id) {
  const alert = await alertController.create({
    header: "Reject request",
    message: "Are you sure you want to reject this request?",
    buttons: [
      { text: "Cancel", role: "cancel" },
      {
        text: "Reject",
        role: "destructive",
        handler: () => reject(id)
      }
    ]
  });

  await alert.present();
}


/* helpers */
function formatDate(value) {
  if (!value) return "—";
  return String(value).replace("T", " ").slice(0, 16);
}

async function showToast(message) {
  const toast = await toastController.create({
    message,
    duration: 1600,
    position: "bottom"
  });
  await toast.present();
}
</script>

<style scoped>
ion-content::part(background) {
  --background: #000;
  color: white;
}

.center {
  margin-top: 40px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.tabs button {
  flex: 1;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.85);
  font-weight: 600;
  cursor: pointer;
}

.tabs button.active {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.25);
  color: white;
}

.empty {
  text-align: center;
  color: #aaa;
  margin-top: 30px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.request-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 18px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta {
  font-size: 0.85rem;
  color: #aaa;
}

.by,
.handled {
  font-size: 0.78rem;
  color: #888;
}

.badge {
  font-size: 0.7rem;
  padding: 4px 10px;
  border-radius: 999px;
  text-transform: uppercase;
}

.badge.pending {
  background: rgba(255, 204, 0, 0.12);
  color: #ffcc00;
}

.badge.approved {
  background: rgba(45, 211, 111, 0.12);
  color: #2dd36f;
}

.badge.rejected {
  background: rgba(255, 107, 107, 0.12);
  color: #ff6b6b;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.approve {
  --background: white;
  --color: black;
}
</style>
