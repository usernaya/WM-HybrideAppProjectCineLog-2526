import { createRouter, createWebHistory } from "@ionic/vue-router";
import TabsPage from "@/views/TabsPage.vue";
import { useAuth } from "@/composables/useAuth";

/* routes */
const routes = [
  /* root */
  {
    path: "/",
    redirect: "/tabs/tab1"
  },

  /* tabs layout */
  {
    path: "/tabs",
    component: TabsPage,
    children: [

      /* home */
      {
        path: "tab1",
        name: "Home",
        component: () => import("@/views/HomePage.vue")
      },
      /* search */
      {
        path: "search",
        component: () => import("@/views/SearchPage.vue")
      },
      {
        path: "reviews",
        name: "Reviews",
        component: () => import("@/views/reviews/ReviewsPage.vue")
      },

      /* profile */
      {
        path: "profile",
        name: "Profile",
        component: () => import("@/views/profile/ProfilePage.vue"),
        meta: { requiresAuth: true }
      },
      // buiten tabs, onder MovieReviews bv.
      {
        path: "/user/:id",
        name: "UserProfile",
        component: () => import("@/views/profile/ProfilePage.vue"),
        meta: { requiresAuth: true }
      }
      ,

      {
        path: "profile/watchlist",
        name: "ProfileWatchlist",
        component: () => import("@/views/profile/ProfileWatchlistPage.vue"),
        meta: { requiresAuth: true }
      },


      {
        path: "profile/watchlist/all",
        name: "Watchlist",
        component: () => import("@/views/profile/WatchlistPage.vue"),
        meta: { requiresAuth: true }
      },

      /* admin */
      {
        path: "admin",
        name: "AdminPage",
        component: () => import("@/views/admin/AdminPage.vue"),
        meta: { requiresAuth: true, requiresAdmin: true }
      },

      {
        path: "admin/requests",
        name: "AdminRequests",
        component: () => import("@/views/admin/AdminRequestsPage.vue"),
        meta: { requiresAuth: true, requiresAdmin: true }
      },

      {
        path: "admin/movies/add",
        name: "AdminAddMovie",
        component: () => import("@/views/admin/AdminAddMoviePage.vue"),
        meta: { requiresAuth: true, requiresAdmin: true }
      },

      {
        path: "admin/movies/edit",
        name: "AdminEditMovieList",
        component: () => import("@/views/admin/AdminEditMovieListPage.vue"),
        meta: { requiresAuth: true, requiresAdmin: true }
      },

      {
        path: "admin/movies/edit/:id",
        name: "AdminEditMovie",
        component: () => import("@/views/admin/AdminEditMoviePage.vue"),
        meta: { requiresAuth: true, requiresAdmin: true }
      },

      {
        path: "admin/movies/delete",
        name: "AdminDeleteMovie",
        component: () => import("@/views/admin/AdminDeleteMoviePage.vue"),
        meta: { requiresAuth: true, requiresAdmin: true }
      }
      ,
      {
        path: "admin/requests/approve/:id",
        name: "AdminApproveRequest",
        component: () => import("@/views/admin/AdminEditMoviePage.vue"),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: "profile/manage",
        name: "ManageAccount",
        component: () => import("@/views/account/ManageAccountPage.vue"),
        meta: { requiresAuth: true }
      }


    ]
  },

  /* movie details (outside tabs) */
  {
    path: "/movie/:id",
    name: "MovieDetails",
    component: () => import("@/views/MovieDetails.vue")
  },
  {
    path: "/movie/:id/reviews",
    name: "MovieReviews",
    component: () => import("@/views/reviews/MovieReviewsPage.vue")
  },
  {
    path: "/profile/requests",
    name: "FriendRequests",
    component: () => import("@/views/profile/FriendRequestsPage.vue")
  },
  {
  path: "/profile/:mode(followers|following)",
  name: "FriendsList",
  component: () =>
    import("@/views/profile/FriendsListPage.vue")
}
,


  /* auth */
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/LoginPage.vue")
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/account/RegisterPage.vue")
  }


];

/* router instance */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

/* guards (global) */
router.beforeEach((to) => {
  const { role } = useAuth();

  if (to.meta.requiresAuth && role.value === "guest") {
    return "/login";
  }

  if (to.meta.requiresAdmin && role.value !== "admin") {
    return "/tabs/profile";
  }
});

export default router;
