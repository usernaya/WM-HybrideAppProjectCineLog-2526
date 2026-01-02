<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />

      <ion-tab-bar slot="bottom" class="tabbar">

        <!-- home -->
        <ion-tab-button tab="tab1" href="/tabs/tab1">
          <ion-icon :icon="$route.name === 'Home' ? home : homeOutline" class="tab-icon" />
        </ion-tab-button>

        <!-- search -->
        <ion-tab-button tab="search" href="/tabs/search">
          <ion-icon :icon="$route.name === 'Search' ? search : searchOutline" class="tab-icon" />
        </ion-tab-button>

        <!-- profile -->
        <ion-tab-button tab="profile" href="/tabs/profile">
          <ion-icon :icon="$route.name === 'Profile' ? person : personOutline" class="tab-icon" />
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
  IonIcon,
} from "@ionic/vue";

import {
  home,
  homeOutline,
  search,
  searchOutline,
  person,
  personOutline
} from "ionicons/icons";
</script>

<style scoped>
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


/* inactive */
ion-tab-button {
  --color: #777;
}

/* active */
ion-tab-button.tab-selected {
  --color: #fff;
}

/* remove background */
ion-tab-button::part(native) {
  background: transparent;
}

/* mobile spacing */
@media (max-width: 600px) {
  .tab-icon {
    font-size: 24px;
  }
}
</style>
