<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/profile" />
        </ion-buttons>

        <ion-title>Manage account</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="card">
        <!-- AVATAR -->
        <div class="avatar-section">
          <div class="avatar" @click="triggerFile">
            <img v-if="preview || form.avatar_url" :src="preview || form.avatar_url" />
            <span v-else>{{ initials }}</span>
          </div>

          <p class="avatar-hint">Tap to change photo</p>
        </div>

        <!-- hidden file input -->
        <input ref="fileInput" type="file" accept="image/*" hidden @change="onFileChange" />

        <!-- FORM -->
        <ion-item class="field">
          <ion-input label="First name" label-placement="stacked" v-model="form.firstname" />
        </ion-item>

        <ion-item class="field">
          <ion-input label="Last name" label-placement="stacked" v-model="form.lastname" />
        </ion-item>

        <ion-item class="field">
          <ion-input label="Username" label-placement="stacked" v-model="form.username" />
        </ion-item>

        <ion-item class="field">
          <ion-input label="Email" label-placement="stacked" type="email" v-model="form.email" />
        </ion-item>

        <ion-text color="danger" v-if="error">
          <p class="error">{{ error }}</p>
        </ion-text>

        <ion-button expand="block" color="danger" :disabled="saving" @click="save">
          <ion-spinner v-if="saving" slot="start" />
          Save changes
        </ion-button>
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
  IonItem,
  IonInput,
  IonButton,
  IonSpinner,
  IonButtons,
  IonBackButton,
  IonText
} from "@ionic/vue";

import { reactive, ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

/* auth */
const user = JSON.parse(localStorage.getItem("user"));
if (!user?.id) window.location.href = "/login";

/* refs */
const fileInput = ref(null);
const selectedFile = ref(null);
const preview = ref(null);

/* router */
const router = useRouter();


/* form */
const form = reactive({
  firstname: "",
  lastname: "",
  username: "",
  email: "",
  avatar_url: ""
});

const saving = ref(false);
const error = ref("");

/* computed */
const initials = computed(() => {
  if (!form.firstname || !form.lastname) return "?";
  return (form.firstname[0] + form.lastname[0]).toUpperCase();
});

/* api */
const PROFILE_API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/inc/profile/get_profile.php";

const UPDATE_API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/inc/profile/update_profile.php";


/* load profile */
onMounted(async () => {
  try {
    const res = await axios.get(PROFILE_API, {
      params: { user_id: user.id }
    });

    Object.assign(form, res.data.data.user);
  } catch {
    error.value = "Failed to load profile";
  }
});

/* avatar upload */
function triggerFile() {
  fileInput.value.click();
}

function onFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  selectedFile.value = file;
  preview.value = URL.createObjectURL(file);
}

/* save */
async function save() {
  error.value = "";
  saving.value = true;

  try {
    const data = new FormData();
    data.append("user_id", user.id);
    data.append("firstname", form.firstname);
    data.append("lastname", form.lastname);
    data.append("username", form.username);
    data.append("email", form.email);

    if (selectedFile.value) {
      data.append("avatar", selectedFile.value);
    }

    const res = await axios.post(UPDATE_API, data, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    if (res.data.status !== 200) {
      throw new Error(res.data.message);
    }

    localStorage.setItem(
      "user",
      JSON.stringify({
        ...user,
        ...form,
        avatar_url: res.data.avatar_url ?? form.avatar_url
      })
    );
    router.back();
  } catch (e) {
    error.value = e?.response?.data?.message || "Update failed";
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
ion-content::part(background) {
  --background: #000;
}

.card {
  max-width: 420px;
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
}

.avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
  cursor: pointer;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-hint {
  font-size: 0.75rem;
  color: #aaa;
  margin-top: 6px;
}

.field {
  --background: rgba(255, 255, 255, 0.04);
  --border-radius: 14px;
}

.error {
  text-align: center;
}
</style>
