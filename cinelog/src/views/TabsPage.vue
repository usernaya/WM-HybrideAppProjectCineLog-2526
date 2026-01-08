<template>
  <ion-page>
    <ion-tabs>

      <ion-router-outlet :key="$route.fullPath" />

      <ion-tab-bar slot="bottom" class="tabbar">

        <ion-tab-button tab="home" href="/tabs/tab1">
          <ion-icon :icon="homeOutline" />
        </ion-tab-button>

        <ion-tab-button tab="search" href="/tabs/search">
          <ion-icon :icon="searchOutline" />
        </ion-tab-button>

        <ion-tab-button tab="reviews" href="/tabs/reviews">
          <ion-icon :icon="chatbubblesOutline" />
        </ion-tab-button>

        <ion-tab-button tab="profile" href="/tabs/profile">
          <ion-icon :icon="personOutline" />
        </ion-tab-button>

      </ion-tab-bar>

    </ion-tabs>
  </ion-page>
</template>


<script setup>
import {
  IonPage,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonRouterOutlet,
  IonIcon
} from "@ionic/vue";

import { useRouter } from "vue-router";

import {
  home,
  homeOutline,
  search,
  searchOutline,
  chatbubbles,
  chatbubblesOutline,
  person,
  personOutline
} from "ionicons/icons";

const router = useRouter();

function go(path) {
  if (router.currentRoute.value.fullPath !== path) {
    router.push(path);
  }
}
</script>


<style scoped>
/* tab bar background */
.tabbar {
  --background: #000;
  --border: none;
  padding-top: 6px;
  padding-bottom: 6px;
}

/* icon size */
.tab-icon {
  font-size: 22px;
}

/* inactive color */
ion-tab-button {
  --color: #777;
}

/* active color */
ion-tab-button.tab-selected {
  --color: #fff;
}

/* remove default background */
ion-tab-button::part(native) {
  background: transparent;
}

/* mobile tweak */
@media (max-width: 600px) {
  .tab-icon {
    font-size: 24px;
  }
}
</style>
