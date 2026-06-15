<template>
    <div class="login-page">
        <div class="login-mask"></div>

        <el-card class="login-card" shadow="always">
            <div class="login-header">
                <div class="login-title">Japanese Learning Admin</div>
                <div class="login-subtitle">日语学习后台管理系统</div>
            </div>

            <el-form class="login-form" label-position="top" @keyup.enter="handleLogin">
                <el-form-item label="用户名">
                    <el-input v-model="form.username" placeholder="请输入用户名" size="large" clearable />
                </el-form-item>

                <el-form-item label="密码">
                    <el-input v-model="form.password" type="password" placeholder="请输入密码" size="large" show-password />
                </el-form-item>

                <el-button type="primary" class="login-button" size="large" :loading="loading" @click="handleLogin">
                    登录
                </el-button>
            </el-form>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { loginApi } from "@/api/auth";

const router = useRouter();

const loading = ref(false);

const form = reactive({
    username: "admin",
    password: "123456",
});

const handleLogin = async () => {
    if (!form.username.trim()) {
        ElMessage.warning("请输入用户名");
        return;
    }

    if (!form.password.trim()) {
        ElMessage.warning("请输入密码");
        return;
    }

    try {
        loading.value = true;

        const res = await loginApi({
            username: form.username,
            password: form.password,
        });

        if (res.code !== 200 || !res.data?.token) {
            ElMessage.error(res.message || "登录失败");
            return;
        }

        localStorage.setItem("admin_token", res.data.token);
        localStorage.setItem("admin_username", res.data.username);
        localStorage.setItem(
            "admin_role",
            res.data.role?.trim().toLowerCase() || "author",
        );

        ElMessage.success("登录成功");
        router.push("/dashboard");
    } catch (error) {
        console.error("登录失败:", error);
        ElMessage.error("登录失败，请检查账号密码或后端服务");
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.login-page {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    overflow: hidden;
    background:
        linear-gradient(135deg, rgba(15, 23, 42, 0.82), rgba(30, 64, 175, 0.68)),
        url("https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=1920&q=80");
    background-size: cover;
    background-position: center;
}

.login-mask {
    position: absolute;
    inset: 0;
    background:
        radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.28), transparent 28%),
        radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.18), transparent 30%);
    pointer-events: none;
}

.login-card {
    position: relative;
    z-index: 1;
    width: 430px;
    padding: 12px 10px 8px;
    border: none;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.35);
    backdrop-filter: blur(12px);
}

.login-header {
    margin-bottom: 26px;
    text-align: center;
}

.login-title {
    font-size: 26px;
    font-weight: 800;
    color: #111827;
    letter-spacing: 0.2px;
}

.login-subtitle {
    margin-top: 8px;
    font-size: 14px;
    color: #6b7280;
}

.login-form {
    width: 100%;
}

.login-form :deep(.el-form-item) {
    margin-bottom: 20px;
}

.login-form :deep(.el-form-item__label) {
    padding-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.login-form :deep(.el-input),
.login-form :deep(.el-input__wrapper) {
    width: 100%;
}

.login-form :deep(.el-input__wrapper) {
    border-radius: 10px;
}

.login-button {
    width: 100%;
    margin-top: 4px;
    border-radius: 10px;
    font-weight: 700;
}

@media (max-width: 520px) {
    .login-card {
        width: 100%;
    }

    .login-title {
        font-size: 22px;
    }
}
</style>