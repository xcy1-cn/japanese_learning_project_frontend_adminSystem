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

                <el-button type="primary" class="login-button" :loading="loading" @click="handleLogin">
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
        localStorage.setItem("admin_role", res.data.role);

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