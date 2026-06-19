import { createRouter, createWebHistory } from "vue-router";

import LoginView from "@/views/login/LoginView.vue";
import AdminLayout from "@/views/layout/AdminLayout.vue";
import DashboardView from "@/views/dashboard/DashboardView.vue";
import ArticleListView from "@/views/article/ArticleListView.vue";
import ArticleSentenceView from "@/views/article/ArticleSentenceView.vue";
import SentenceListView from "@/views/sentence/SentenceListView.vue";
import VocabularyListView from "@/views/vocabulary/VocabularyListView.vue";
import GrammarListView from "@/views/grammar/GrammarListView.vue";
import QuestionListView from "@/views/question/QuestionListView.vue";
import ImportView from "@/views/import/ImportView.vue";

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
          meta: {
            roles: ["admin", "author"],
          },
        },
        {
          path: "articles",
          component: ArticleListView,
          meta: {
            roles: ["admin", "author"],
          },
        },
        {
          path: "articles/:articleId/sentences",
          component: ArticleSentenceView,
          meta: {
            roles: ["admin", "author"],
          },
        },
        {
          path: "sentences",
          component: SentenceListView,
          meta: {
            roles: ["admin", "author"],
          },
        },
        {
          path: "vocabularies",
          component: VocabularyListView,
          meta: {
            roles: ["admin", "author"],
          },
        },
        {
          path: "grammar-points",
          component: GrammarListView,
          meta: {
            roles: ["admin", "author"],
          },
        },
        {
          path: "questions",
          component: QuestionListView,
          meta: {
            roles: ["admin"],
          },
        },
        {
          path: "import",
          component: ImportView,
          meta: {
            roles: ["admin"],
          },
        },
      ],
    },
  ],
});

router.beforeEach((to) => {
  const token = localStorage.getItem("admin_token");
  const role = localStorage.getItem("admin_role")?.trim().toLowerCase();

  // 未登录访问非登录页
  if (to.path !== "/login" && !token) {
    return "/login";
  }

  // 已登录访问登录页
  if (to.path === "/login" && token) {
    return "/dashboard";
  }

  // 登录后如果没有 role，说明登录状态异常，清空后重新登录
  if (token && !role) {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_username");
    localStorage.removeItem("admin_role");

    return "/login";
  }

  const roles = to.meta.roles as string[] | undefined;

  // 当前路由需要角色权限
  if (roles && roles.length > 0) {
    const normalizedRoles = roles.map((item) => item.toLowerCase());

    const hasPermission = role && normalizedRoles.includes(role);

    if (!hasPermission) {
      // 避免正在 /dashboard 时继续重定向到 /dashboard
      if (to.path !== "/dashboard") {
        return "/dashboard";
      }

      return false;
    }
  }

  return true;
});

export default router;
