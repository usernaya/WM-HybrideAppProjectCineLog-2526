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
        <!-- avatar -->
        <div class="avatar-section">
          <div class="avatar" @click="chooseAvatarSource">
            <img v-if="avatarSrc" :src="avatarSrc" />
            <span v-else>{{ initials }}</span>
          </div>

          <p class="avatar-hint">Tap to change photo</p>
        </div>

        <!-- form -->
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

        <!-- change password modal -->
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
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonInput, IonButton, IonSpinner,
  IonButtons, IonBackButton, IonText, IonModal,
  actionSheetController
} from "@ionic/vue";

import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { reactive, ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

// auth
const user = JSON.parse(localStorage.getItem("user"));
if (!user?.id) window.location.href = "/login";

// state
const router = useRouter();
const selectedFile = ref(null);
const preview = ref(null);
const saving = ref(false);
const error = ref("");

// form data
const form = reactive({
  firstname: "",
  lastname: "",
  username: "",
  email: "",
  avatar_url: ""
});

// password modal
const showPasswordModal = ref(false);
const changingPassword = ref(false);
const passwordError = ref("");
const passwordForm = reactive({
  current: "",
  new: "",
  confirm: ""
});

// email validation
const emailTouched = ref(false);
const isEmailValid = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || "")
);

watch(() => form.email, () => (emailTouched.value = true));

// computed

const avatarSrc = computed(() =>
  preview.value
    ? preview.value
    : form.avatar_url
      ? `${form.avatar_url}?t=${Date.now()}`
      : ""
);


const initials = computed(() =>
  form.firstname && form.lastname
    ? (form.firstname[0] + form.lastname[0]).toUpperCase()
    : "?"
);

// api
const PROFILE_API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/inc/profile/get_profile.php";

const UPDATE_API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/inc/profile/update_profile.php";

const CHANGE_PASSWORD_API =
  "https://ayaboutaarourte-odisee.be/wm/WM-RESTfulAPIProjectCineLog-2526/api/inc/profile/change_password.php";

// load profile
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

// avatar upload
async function chooseAvatarSource() {
  const sheet = await actionSheetController.create({
    header: "Change profile photo",
    buttons: [
      { text: "Take photo", icon: "camera", handler: () => getPhoto(CameraSource.Camera) },
      { text: "Choose from gallery", icon: "image", handler: () => getPhoto(CameraSource.Photos) },
      { text: "Cancel", role: "cancel" }
    ]
  });
  await sheet.present();
}

async function getPhoto(source) {
  try {
    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source
    });

    if (!photo.base64String) return;

    preview.value = `data:image/jpeg;base64,${photo.base64String}`;

    const blob = base64ToBlob(photo.base64String, "image/jpeg");
    selectedFile.value = new File([blob], `avatar_${user.id}.jpg`, {
      type: "image/jpeg"
    });

    await uploadAvatar();
  } catch {
    console.warn("Camera cancelled");
  }
}

async function uploadAvatar() {
  if (!selectedFile.value) return;

  try {
    const data = new FormData();
    data.append("user_id", user.id);
    data.append("avatar", selectedFile.value);

    const res = await axios.post(UPDATE_API, data);
    if (res.data.status !== 200) throw new Error();

    form.avatar_url = res.data.avatar_url;

    localStorage.setItem(
      "user",
      JSON.stringify({ ...user, avatar_url: res.data.avatar_url })
    );
  } catch {
    error.value = "Avatar upload failed";
  }
}

// helper: base64 to blob
function base64ToBlob(base64, type) {
  const bytes = atob(base64);
  const arr = [];
  for (let i = 0; i < bytes.length; i++) arr.push(bytes.charCodeAt(i));
  return new Blob([new Uint8Array(arr)], { type });
}

// save profile
async function save() {
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

    const res = await axios.post(UPDATE_API, data);
    if (res.data.status !== 200) throw new Error();

    localStorage.setItem("user", JSON.stringify({ ...user, ...form }));
    router.back();
  } catch {
    error.value = "Update failed";
  } finally {
    saving.value = false;
  }
}

// password modal functions
function openPasswordModal() {
  passwordError.value = "";
  Object.assign(passwordForm, { current: "", new: "", confirm: "" });
  showPasswordModal.value = true;
}

function closePasswordModal() {
  showPasswordModal.value = false;
}

async function changePassword() {
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

    if (res.data.status !== 200) throw new Error();
    closePasswordModal();
  } catch {
    passwordError.value = "Password update failed";
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
