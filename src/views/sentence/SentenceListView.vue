<template>
    <div class="sentence-page">
        <el-card>
            <template #header>
                <div class="page-header">
                    <div>
                        <div class="page-title">句子管理</div>
                        <div class="page-desc">
                            管理全部文章下的句子，支持关键词、文章 ID、分页筛选、SID(sentenceID)/AID(articleId)
                        </div>
                    </div>

                    <el-button type="primary" @click="handleOpenCreate">
                        新增句子
                    </el-button>
                </div>
            </template>

            <el-form :model="queryForm" inline class="search-form">
                <el-form-item label="关键词">
                    <el-input v-model="queryForm.keyword" placeholder="搜索日文、中文或罗马音" clearable style="width: 240px"
                        @keyup.enter="handleSearch" />
                </el-form-item>

                <el-form-item label="文章ID">
                    <el-input-number v-model="queryForm.articleId" :min="1" clearable style="width: 160px" />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="handleSearch">搜索</el-button>
                    <el-button @click="handleReset">重置</el-button>
                </el-form-item>
            </el-form>

            <el-table v-loading="loading" :data="sentenceList" border style="width: 100%">
                <el-table-column label="序号" width="80">
                    <template #default="{ $index }">
                        {{ (queryForm.page - 1) * queryForm.pageSize + $index + 1 }}
                    </template>
                </el-table-column>

                <el-table-column prop="id" label="SID" width="80" />

                <el-table-column prop="articleId" label="AID" width="100" />

                <el-table-column prop="orderIndex" label="句子顺序" width="110" />

                <el-table-column prop="japaneseText" label="日语原文" min-width="220" />

                <el-table-column prop="chineseText" label="中文释义" min-width="220" />

                <el-table-column prop="romaji" label="罗马音" min-width="180">
                    <template #default="{ row }">
                        {{ row.romaji || "-" }}
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="160" fixed="right">
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

            <div class="pagination-wrapper">
                <el-pagination v-model:current-page="queryForm.page" v-model:page-size="queryForm.pageSize"
                    :total="total" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handlePageSizeChange" @current-change="handlePageChange" />
            </div>
        </el-card>

        <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增句子' : '编辑句子'" width="720px"
            destroy-on-close>
            <el-form ref="sentenceFormRef" :model="sentenceForm" :rules="sentenceRules" label-width="90px">
                <el-form-item label="文章ID" prop="articleId">
                    <el-input-number v-model="sentenceForm.articleId" :min="1" style="width: 100%" />
                </el-form-item>

                <el-form-item label="句子顺序" prop="orderIndex">
                    <el-input-number v-model="sentenceForm.orderIndex" :min="1" style="width: 100%" />
                </el-form-item>

                <el-form-item label="日语原文" prop="japaneseText">
                    <el-input v-model="sentenceForm.japaneseText" type="textarea" :rows="3" placeholder="请输入日语原文" />
                </el-form-item>

                <el-form-item label="中文释义" prop="chineseText">
                    <el-input v-model="sentenceForm.chineseText" type="textarea" :rows="3" placeholder="请输入中文释义" />
                </el-form-item>

                <el-form-item label="罗马音" prop="romaji">
                    <el-input v-model="sentenceForm.romaji" placeholder="请输入罗马音" />
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
import { nextTick, onMounted, reactive, ref } from "vue";
import {
    ElMessage,
    ElMessageBox,
    type FormInstance,
    type FormRules,
} from "element-plus";
import {
    createSentenceApi,
    deleteSentenceApi,
    getSentenceDetailApi,
    getSentenceListApi,
    updateSentenceApi,
    type Sentence,
} from "@/api/sentence";

type DialogMode = "create" | "edit";

const loading = ref(false);
const submitLoading = ref(false);
const sentenceList = ref<Sentence[]>([]);
const total = ref(0);

const dialogVisible = ref(false);
const dialogMode = ref<DialogMode>("create");
const sentenceFormRef = ref<FormInstance>();

const queryForm = reactive<{
    keyword: string;
    articleId: number | undefined;
    page: number;
    pageSize: number;
}>({
    keyword: "",
    articleId: undefined,
    page: 1,
    pageSize: 10,
});

const sentenceForm = reactive({
    id: 0,
    articleId: 1,
    japaneseText: "",
    chineseText: "",
    romaji: "",
    orderIndex: 1,
});

const sentenceRules: FormRules = {
    articleId: [
        { required: true, message: "请输入文章 ID", trigger: "change" },
    ],
    japaneseText: [
        { required: true, message: "请输入日语原文", trigger: "blur" },
    ],
    chineseText: [
        { required: true, message: "请输入中文释义", trigger: "blur" },
    ],
    orderIndex: [
        { required: true, message: "请输入句子顺序", trigger: "change" },
    ],
};

const resetSentenceForm = () => {
    sentenceForm.id = 0;
    sentenceForm.articleId = queryForm.articleId || 1;
    sentenceForm.japaneseText = "";
    sentenceForm.chineseText = "";
    sentenceForm.romaji = "";
    sentenceForm.orderIndex = 1;
};

const fetchSentenceList = async () => {
    try {
        loading.value = true;

        const res = await getSentenceListApi({
            keyword: queryForm.keyword || undefined,
            articleId: queryForm.articleId || undefined,
            page: queryForm.page,
            pageSize: queryForm.pageSize,
        });

        if (res.code !== 200) {
            ElMessage.error(res.message || "获取句子列表失败");
            return;
        }

        sentenceList.value = res.data.items || [];
        total.value = res.data.total || 0;
    } catch (error) {
        console.error("获取句子列表失败:", error);
        ElMessage.error("获取句子列表失败，请检查后端服务");
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => {
    queryForm.page = 1;
    fetchSentenceList();
};

const handleReset = () => {
    queryForm.keyword = "";
    queryForm.articleId = undefined;
    queryForm.page = 1;
    queryForm.pageSize = 10;
    fetchSentenceList();
};

const handlePageChange = (page: number) => {
    queryForm.page = page;
    fetchSentenceList();
};

const handlePageSizeChange = (pageSize: number) => {
    queryForm.pageSize = pageSize;
    queryForm.page = 1;
    fetchSentenceList();
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
                    articleId: sentenceForm.articleId,
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
                    articleId: sentenceForm.articleId,
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
            ElMessage.error("保存句子失败，请检查 articleId 是否存在");
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

        if (sentenceList.value.length === 1 && queryForm.page > 1) {
            queryForm.page -= 1;
        }

        fetchSentenceList();
    } catch (error) {
        if (error !== "cancel") {
            console.error("删除句子失败:", error);
            ElMessage.error("删除句子失败");
        }
    }
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

.search-form {
    margin-bottom: 16px;
}

.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 18px;
}
</style>