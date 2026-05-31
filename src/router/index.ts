import { createRouter, createWebHistory } from "vue-router";

import LoginView from "@/views/login/LoginView.vue";
import AdminLayout from "@/views/layout/AdminLayout.vue";
import DashboardView from "@/views/dashboard/DashboardView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/dashboard",
    },
    {
      path: "/login",
      component: LoginView,
    },
    {
      path: "/",
      component: AdminLayout,
      children: [
        {
          path: "dashboard",
          component: DashboardView,
        },
      ],
    },
  ],
});

export default router;


router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("admin_token");

//   if (to.path !== "/login" && !token) {
//     next("/login");
//     return;
//   }

  if (to.path === "/login" && token) {
    next("/dashboard");
    return;
  }

  next();
});