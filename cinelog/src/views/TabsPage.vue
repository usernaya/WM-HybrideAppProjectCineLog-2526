<template>
  <ion-page>
    <ion-tabs>

      <!-- router outlet -->
      <ion-router-outlet />

      <!-- bottom tab bar -->
      <ion-tab-bar slot="bottom" class="tabbar">

        <!-- HOME -->
        <ion-tab-button tab="home" href="/tabs/tab1">
          <ion-icon
            :icon="$route.name === 'Home' ? home : homeOutline"
            class="tab-icon"
          />
        </ion-tab-button>

        <!-- SEARCH -->
        <ion-tab-button tab="search" href="/tabs/search">
          <ion-icon
            :icon="$route.name === 'Search' ? search : searchOutline"
            class="tab-icon"
          />
        </ion-tab-button>

        <!-- REVIEWS -->
        <ion-tab-button tab="reviews" href="/tabs/reviews">
          <ion-icon
            :icon="$route.name === 'Reviews' ? chatbubbles : chatbubblesOutline"
            class="tab-icon"
          />
        </ion-tab-button>

        <!-- PROFILE -->
        <ion-tab-button tab="profile" href="/tabs/profile">
          <ion-icon
            :icon="$route.name === 'Profile' ? person : personOutline"
            class="tab-icon"
          />
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
