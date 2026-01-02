import { ref, computed } from "vue";

/* state (global) */
const user = ref(
  localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null
);

const role = ref(localStorage.getItem("role") || "guest");
const token = ref(localStorage.getItem("token") || null);

/* computed */
const isLoggedIn = computed(() => role.value !== "guest");
const isAdmin = computed(() => role.value === "admin");
const isUser = computed(() => role.value === "user");

/* actions */
function login(userData) {
  user.value = userData;
  role.value = userData.role;
  token.value = userData.token;

  localStorage.setItem("user", JSON.stringify(userData));
  localStorage.setItem("role", userData.role);
  localStorage.setItem("token", userData.token);
}

function logout() {
  user.value = null;
  role.value = "guest";
  token.value = null;

  localStorage.removeItem("user");
  localStorage.removeItem("role");
  localStorage.removeItem("token");
}

function loginAsGuest() {
  logout();
  role.value = "guest";
  localStorage.setItem("role", "guest");
}

/* export */
export function useAuth() {
  return {
    user,
    role,
    token,
    isLoggedIn,
    isAdmin,
    isUser,
    login,
    logout,
    loginAsGuest
  };
}
