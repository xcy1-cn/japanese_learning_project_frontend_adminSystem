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
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.push('/login')
}
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