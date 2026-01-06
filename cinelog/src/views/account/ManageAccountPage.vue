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

        <!-- email validation message -->
        <ion-text color="danger" v-if="emailTouched && !isEmailValid">
          <p class="error">Please enter a valid email address</p>
        </ion-text>


        <ion-text color="danger" v-if="error">
          <p class="error">{{ error }}</p>
        </ion-text>

        <ion-button expand="block" color="danger" :disabled="saving || !isEmailValid" @click="save">
          <ion-spinner v-if="saving" slot="start" />
          Save changes
        </ion-button>

        <ion-button expand="block" fill="outline" class="change-password" @click="openPasswordModal">
          Change password
        </ion-button>

        <!-- CHANGE PASSWORD MODAL -->
        <ion-modal :is-open="showPasswordModal" @didDismiss="closePasswordModal">
          <ion-header>
            <ion-toolbar>
              <ion-title>Change password</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="closePasswordModal">Close</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>

          <ion-content class="ion-padding">
            <ion-item class="field">
              <ion-input type="password" label="Current password" label-placement="stacked"
                v-model="passwordForm.current" />
            </ion-item>

            <ion-item class="field">
              <ion-input type="password" label="New password" label-placement="stacked" v-model="passwordForm.new" />
            </ion-item>

            <ion-item class="field">
              <ion-input type="password" label="Confirm new password" label-placement="stacked"
                v-model="passwordForm.confirm" />
            </ion-item>

            <ion-text color="danger" v-if="passwordError">
              <p class="error">{{ passwordError }}</p>
            </ion-text>

            <ion-button expand="block" color="danger" :disabled="changingPassword" @click="changePassword">
              <ion-spinner v-if="changingPassword" slot="start" />
              Update password
            </ion-button>
          </ion-content>
        </ion-modal>

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
  IonText,
  IonModal
} from "@ionic/vue";

import { reactive, ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { watch } from "vue";

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

/* password modal */
const showPasswordModal = ref(false);
const changingPassword = ref(false);
const passwordError = ref("");

const passwordForm = reactive({
  current: "",
  new: "",
  confirm: ""
});

/* email validation */
const emailTouched = ref(false);

const isEmailValid = computed(() => {
  if (!form.email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
});

/* detect when user edits email */
watch(
  () => form.email,
  () => {
    emailTouched.value = true;
  }
);

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

const CHANGE_PASSWORD_API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/inc/profile/change_password.php";
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
  if (!isEmailValid.value) {
    error.value = "Invalid email address";
    return;
  }

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

/* modal actions */
function openPasswordModal() {
  passwordError.value = "";
  passwordForm.current = "";
  passwordForm.new = "";
  passwordForm.confirm = "";
  showPasswordModal.value = true;
}

function closePasswordModal() {
  showPasswordModal.value = false;
}

/* change password */
async function changePassword() {
  passwordError.value = "";

  if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
    passwordError.value = "All fields are required";
    return;
  }

  if (passwordForm.new !== passwordForm.confirm) {
    passwordError.value = "Passwords do not match";
    return;
  }

  changingPassword.value = true;

  try {
    const res = await axios.post(CHANGE_PASSWORD_API, {
      user_id: user.id,
      current_password: passwordForm.current,
      new_password: passwordForm.new
    });


    if (res.data.status !== 200) {
      throw new Error(res.data.message);
    }

    closePasswordModal();
  } catch (e) {
    passwordError.value =
      e?.response?.data?.message || "Password update failed";
  } finally {
    changingPassword.value = false;
  }
}
</script>

<style scoped>
/* global */
ion-content::part(background) {
  --background: radial-gradient(circle at top,
      #111 0%,
      #000 60%);
  color: white;
}

/* card */
.card {
  max-width: 420px;
  margin: auto;
  padding: 18px;
  border-radius: 22px;

  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(14px);

  display: flex;
  flex-direction: column;
  gap: 16px;

  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* avatar */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 6px;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;

  background: linear-gradient(145deg, #2a2a2a, #111);
  border: 2px solid rgba(255, 255, 255, 0.12);

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 34px;
  font-weight: 600;
  color: white;

  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.avatar:hover {
  transform: scale(1.04);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.08);
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
  margin-top: 8px;
  opacity: 0.85;
}

/* input fields */
.field {
  --background: rgba(255, 255, 255, 0.04);
  --border-radius: 16px;
  --padding-start: 12px;
  --padding-end: 12px;

  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}

/* buttons */
ion-button {
  --border-radius: 16px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

/* save */
ion-button[color="danger"] {
  --background: linear-gradient(135deg, #ff4d4d, #ff1f1f);
  --color: #fff;
  box-shadow: 0 6px 20px rgba(255, 77, 77, 0.35);
}

/* change password */
.change-password {
  --background: transparent;
  --color: #fff;
  --border-radius: 16px;
  --border-color: rgba(255, 255, 255, 0.3);

  margin-top: 6px;
}

/* errors */
.error {
  text-align: center;
  font-size: 0.85rem;
  color: #ff6b6b;
  margin-top: 6px;
}

/* modal (change password) */
ion-modal {
  --background: rgba(0, 0, 0, 0.95);
}

ion-modal ion-content {
  --background: transparent;
}

ion-modal .card {
  background: rgba(255, 255, 255, 0.07);
}
</style>
