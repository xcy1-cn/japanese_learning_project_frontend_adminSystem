<template>
    <el-container class="admin-layout">
        <el-aside width="220px" class="aside">
            <div class="logo">JP Admin</div>

            <el-menu router class="side-menu" :default-active="route.path" background-color="#1f2937"
                text-color="#d1d5db" active-text-color="#ffffff">
                <el-menu-item v-for="item in visibleMenus" :key="item.path" :index="item.path">
                    <span>{{ item.title }}</span>
                </el-menu-item>
            </el-menu>

            <div v-if="visibleMenus.length === 0" class="empty-menu">
                当前角色无菜单权限
            </div>
        </el-aside>

        <el-container>
            <el-header class="header">
                <div class="header-title">后台管理系统</div>

                <div class="header-right">
                    <span class="username">{{ adminUsername }}</span>
                    <el-tag size="small" type="success">{{ adminRole }}</el-tag>

                    <el-button type="danger" size="small" @click="handleLogout">
                        退出
                    </el-button>
                </div>
            </el-header>

            <el-main class="main">
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { menuList, hasRolePermission } from "@/config/permission";

const router = useRouter();
const route = useRoute();

const adminUsername = computed(() => {
    return localStorage.getItem("admin_username") || "admin";
});

const adminRole = computed(() => {
    return localStorage.getItem("admin_role")?.trim().toLowerCase() || "";
});

const visibleMenus = computed(() => {
    return menuList.filter((item) => {
        return hasRolePermission(adminRole.value, item.roles);
    });
});

const handleLogout = async () => {
    try {
        await ElMessageBox.confirm("确定要退出后台管理系统吗？", "退出确认", {
            confirmButtonText: "确定退出",
            cancelButtonText: "取消",
            type: "warning",
        });

        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_username");
        localStorage.removeItem("admin_role");

        ElMessage.success("已退出登录");
        router.replace("/login");
    } catch {
        // 用户取消退出
    }
};
</script>

<style scoped>
.admin-layout {
    min-height: 100vh;
}

.aside {
    min-height: 100vh;
    background: #1f2937;
}

.logo {
    height: 60px;
    line-height: 60px;
    text-align: center;
    color: #ffffff;
    font-weight: 700;
    font-size: 18px;
    background: #111827;
}

.side-menu {
    height: calc(100vh - 60px);
    border-right: none;
}

.side-menu :deep(.el-menu-item) {
    height: 48px;
    line-height: 48px;
    font-size: 14px;
}

.side-menu :deep(.el-menu-item:hover) {
    background-color: #374151 !important;
    color: #ffffff !important;
}

.side-menu :deep(.el-menu-item.is-active) {
    background-color: #2563eb !important;
    color: #ffffff !important;
    font-weight: 600;
}

.empty-menu {
    padding: 16px;
    color: #fca5a5;
    font-size: 13px;
}

.header {
    height: 60px;
    padding: 0 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e5e7eb;
    background: #ffffff;
}

.header-title {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 12px;
}

.username {
    font-size: 14px;
    color: #374151;
}

.main {
    min-height: calc(100vh - 60px);
    padding: 20px;
    background: #f3f4f6;
}
</style>