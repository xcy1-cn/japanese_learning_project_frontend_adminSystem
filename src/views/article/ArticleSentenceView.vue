<template>
    <div class="sentence-page">
        <el-card>
            <template #header>
                <div class="page-header">
                    <div>
                        <div class="page-title">文章句子管理</div>
                        <div class="page-desc">
                            当前文章 ID：{{ articleId }}，管理该文章下的日语句子
                        </div>
                    </div>

                    <div class="header-actions">
                        <el-button @click="handleBack">返回文章管理</el-button>
                        <el-button type="primary" @click="handleOpenCreate">
                            新增句子
                        </el-button>
                    </div>
                </div>
            </template>

            <el-table v-loading="loading" :data="sortedSentenceList" border style="width: 100%">
                <el-table-column label="序号" width="80">
                    <template #default="{ $index }">
                        {{ $index + 1 }}
                    </template>
                </el-table-column>

                <el-table-column prop="id" label="SID" width="80" />

                <el-table-column prop="orderIndex" label="排序" width="90" />

                <el-table-column prop="japaneseText" label="日语原文" min-width="220" />

                <el-table-column prop="chineseText" label="中文释义" min-width="220" />

                <el-table-column prop="romaji" label="罗马音" min-width="180">
                    <template #default="{ row }">
                        {{ row.romaji || "-" }}
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="220" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="handleOpenEdit(row)">
                            编辑
                        </el-button>

                        <el-button type="danger" link @click="handleDelete(row)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-empty v-if="!loading && sentenceList.length === 0" description="当前文章还没有句子" />
        </el-card>

        <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增句子' : '编辑句子'" width="720px"
            destroy-on-close>
            <el-form ref="sentenceFormRef" :model="sentenceForm" :rules="sentenceRules" label-width="90px">
                <el-form-item label="排序" prop="orderIndex">
                    <el-input-number v-model="sentenceForm.orderIndex" :min="1" style="width: 100%" />
                </el-form-item>

                <el-form-item label="日语原文" prop="japaneseText">
                    <el-input v-model="sentenceForm.japaneseText" type="textarea" :rows="3"
                        placeholder="请输入日语原文，例如：私は学生です。" />
                </el-form-item>

                <el-form-item label="中文释义" prop="chineseText">
                    <el-input v-model="sentenceForm.chineseText" type="textarea" :rows="3"
                        placeholder="请输入中文释义，例如：我是学生。" />
                </el-form-item>

                <el-form-item label="罗马音" prop="romaji">
                    <el-input v-model="sentenceForm.romaji" placeholder="请输入罗马音，例如：watashi wa gakusei desu" />
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
                    保存
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
    ElMessage,
    ElMessageBox,
    type FormInstance,
    type FormRules,
} from "element-plus";
import {
    createSentenceApi,
    deleteSentenceApi,
    getArticleSentencesApi,
    getSentenceDetailApi,
    updateSentenceApi,
    type Sentence,
} from "@/api/sentence";

type DialogMode = "create" | "edit";

const route = useRoute();
const router = useRouter();

const articleId = Number(route.params.articleId);

const loading = ref(false);
const submitLoading = ref(false);
const sentenceList = ref<Sentence[]>([]);

const dialogVisible = ref(false);
const dialogMode = ref<DialogMode>("create");
const sentenceFormRef = ref<FormInstance>();

const sentenceForm = reactive({
    id: 0,
    articleId,
    japaneseText: "",
    chineseText: "",
    romaji: "",
    orderIndex: 1,
});

const sentenceRules: FormRules = {
    japaneseText: [
        { required: true, message: "请输入日语原文", trigger: "blur" },
    ],
    chineseText: [
        { required: true, message: "请输入中文释义", trigger: "blur" },
    ],
    orderIndex: [
        { required: true, message: "请输入排序值", trigger: "change" },
    ],
};

const sortedSentenceList = computed(() => {
    return [...sentenceList.value].sort((a, b) => {
        if (a.orderIndex !== b.orderIndex) {
            return a.orderIndex - b.orderIndex;
        }

        return a.id - b.id;
    });
});

const resetSentenceForm = () => {
    sentenceForm.id = 0;
    sentenceForm.articleId = articleId;
    sentenceForm.japaneseText = "";
    sentenceForm.chineseText = "";
    sentenceForm.romaji = "";
    sentenceForm.orderIndex = sentenceList.value.length + 1;
};

const fetchSentenceList = async () => {
    if (!articleId) {
        ElMessage.error("文章 ID 无效");
        return;
    }

    try {
        loading.value = true;

        const res = await getArticleSentencesApi(articleId);

        sentenceList.value = Array.isArray(res) ? res : [];
    } catch (error) {
        console.error("获取文章句子失败:", error);
        ElMessage.error("获取文章句子失败，请检查后端服务");
    } finally {
        loading.value = false;
    }
};

const handleOpenCreate = async () => {
    dialogMode.value = "create";
    resetSentenceForm();
    dialogVisible.value = true;

    await nextTick();
    sentenceFormRef.value?.clearValidate();
};

const handleOpenEdit = async (row: Sentence) => {
    try {
        dialogMode.value = "edit";
        resetSentenceForm();
        dialogVisible.value = true;

        const res = await getSentenceDetailApi(row.id);

        if (res.code !== 200 || !res.data) {
            ElMessage.error(res.message || "获取句子详情失败");
            dialogVisible.value = false;
            return;
        }

        sentenceForm.id = res.data.id;
        sentenceForm.articleId = res.data.articleId;
        sentenceForm.japaneseText = res.data.japaneseText || "";
        sentenceForm.chineseText = res.data.chineseText || "";
        sentenceForm.romaji = res.data.romaji || "";
        sentenceForm.orderIndex = res.data.orderIndex || 1;

        await nextTick();
        sentenceFormRef.value?.clearValidate();
    } catch (error) {
        console.error("获取句子详情失败:", error);
        ElMessage.error("获取句子详情失败");
        dialogVisible.value = false;
    }
};

const handleSubmit = async () => {
    if (!sentenceFormRef.value) return;

    await sentenceFormRef.value.validate(async (valid) => {
        if (!valid) return;

        try {
            submitLoading.value = true;

            if (dialogMode.value === "create") {
                const res = await createSentenceApi({
                    articleId,
                    japaneseText: sentenceForm.japaneseText,
                    chineseText: sentenceForm.chineseText,
                    romaji: sentenceForm.romaji || undefined,
                    orderIndex: sentenceForm.orderIndex,
                });

                if (res.code !== 200) {
                    ElMessage.error(res.message || "新增句子失败");
                    return;
                }

                ElMessage.success("新增句子成功");
            } else {
                const res = await updateSentenceApi(sentenceForm.id, {
                    id: sentenceForm.id,
                    articleId,
                    japaneseText: sentenceForm.japaneseText,
                    chineseText: sentenceForm.chineseText,
                    romaji: sentenceForm.romaji || undefined,
                    orderIndex: sentenceForm.orderIndex,
                });

                if (res.code !== 200) {
                    ElMessage.error(res.message || "更新句子失败");
                    return;
                }

                ElMessage.success("更新句子成功");
            }

            dialogVisible.value = false;
            fetchSentenceList();
        } catch (error) {
            console.error("保存句子失败:", error);
            ElMessage.error("保存句子失败，请检查请求参数或后端服务");
        } finally {
            submitLoading.value = false;
        }
    });
};

const handleDelete = async (row: Sentence) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除句子「${row.japaneseText}」吗？`,
            "删除确认",
            {
                confirmButtonText: "确定删除",
                cancelButtonText: "取消",
                type: "warning",
            },
        );

        const res = await deleteSentenceApi(row.id);

        if (res.code !== 200) {
            ElMessage.error(res.message || "删除句子失败");
            return;
        }

        ElMessage.success("删除成功");
        fetchSentenceList();
    } catch (error) {
        if (error !== "cancel") {
            console.error("删除句子失败:", error);
            ElMessage.error("删除句子失败");
        }
    }
};

const handleBack = () => {
    router.push("/articles");
};

onMounted(() => {
    fetchSentenceList();
});
</script>

<style scoped lang="scss">
.sentence-page {
    padding: 20px;
}

.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.page-title {
    font-size: 20px;
    font-weight: 700;
    color: #1f2937;
}

.page-desc {
    margin-top: 6px;
    font-size: 13px;
    color: #6b7280;
}

.header-actions {
    display: flex;
    gap: 10px;
}
</style>