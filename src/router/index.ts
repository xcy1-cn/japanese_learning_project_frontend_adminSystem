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
        {
          path: "articles",
          component: ArticleListView,
        },
        {
          path: "articles/:articleId/sentences",
          component: ArticleSentenceView,
        },
        {
          path: "sentences",
          component: SentenceListView,
        },
        {
          path: "vocabularies",
          component: VocabularyListView,
        },
        {
          path: "grammar-points",
          component: GrammarListView,
        },
        {
          path: "questions",
          component: QuestionListView,
        },
      ],
    },
  ],
});

export default router;


router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("admin_token");

  if (to.path !== "/login" && !token) {
    next("/login");
    return;
  }

  if (to.path === "/login" && token) {
    next("/dashboard");
    return;
  }

  next();
});