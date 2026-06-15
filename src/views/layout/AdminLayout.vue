<template>
    <el-container class="admin-layout">
        <el-aside width="220px" class="aside">
            <div class="logo">JP Admin</div>

            <el-menu router default-active="/dashboard" background-color="#1f2937" text-color="#d1d5db"
                active-text-color="#ffffff">
                <el-menu-item index="/dashboard">首页</el-menu-item>
                <el-menu-item index="/articles">文章管理</el-menu-item>
                <el-menu-item index="/sentences">句子管理</el-menu-item>
                <el-menu-item index="/vocabularies">词汇管理</el-menu-item>
                <el-menu-item index="/grammar-points">语法管理</el-menu-item>
                <el-menu-item index="/questions">题目管理</el-menu-item>
            </el-menu>
        </el-aside>

        <el-container>
            <el-header class="header">
                <span>后台管理系统</span>
                <el-button type="danger" size="small" @click="handleLogout">
                    退出
                </el-button>
            </el-header>

            <el-main class="main">
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";

const router = useRouter();

const handleLogout = async () => {
    try {
        await ElMessageBox.confirm(
            "确定要退出后台管理系统吗？",
            "退出确认",
            {
                confirmButtonText: "确定退出",
                cancelButtonText: "取消",
                type: "warning",
            },
        );

        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_username");
        localStorage.removeItem("admin_role");

        ElMessage.success("已退出登录");

        router.replace("/login");
    } catch {
        // 用户点击取消，不做处理
    }
};
</script>

<style scoped>
.admin-layout {
    min-height: 100vh;
}

.aside {
    background: #1f2937;
}

.logo {
    height: 60px;
    line-height: 60px;
    text-align: center;
    color: #ffffff;
    font-weight: bold;
    font-size: 18px;
}

.header {
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e5e7eb;
    background: #ffffff;
}

.main {
    background: #f3f4f6;
}
</style>