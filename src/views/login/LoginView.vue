<template>
    <div class="login-page">
        <el-card class="login-card">
            <h2 class="title">Japanese Learning Admin</h2>

            <el-form>
                <el-form-item label="用户名">
                    <el-input v-model="form.username" placeholder="请输入用户名" />
                </el-form-item>

                <el-form-item label="密码">
                    <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
                </el-form-item>

                <el-button type="primary" class="login-button" @click="handleLogin">
                    登录
                </el-button>
            </el-form>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
    username: '',
    password: ''
})

const handleLogin = () => {
    console.log('login form:', form)

    // 临时模拟登录成功
    localStorage.setItem('admin_token', 'mock-token')
    router.push('/dashboard')
}
</script>

<style scoped>
.login-page {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
}

.login-card {
    width: 420px;
}

.title {
    text-align: center;
    margin-bottom: 24px;
}

.login-button {
    width: 100%;
}
</style>