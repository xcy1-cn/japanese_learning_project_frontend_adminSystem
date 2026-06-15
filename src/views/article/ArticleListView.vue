<template>
    <div class="article-page">
        <el-card>
            <template #header>
                <div class="page-header">
                    <div>
                        <div class="page-title">文章管理</div>
                        <div class="page-desc">
                            管理日语学习文章，支持搜索、筛选、分页、新增、编辑和删除
                        </div>
                    </div>

                    <el-button type="primary" @click="handleOpenCreate">
                        新增文章
                    </el-button>
                </div>
            </template>

            <el-form :model="queryForm" inline class="search-form">
                <el-form-item label="关键词">
                    <el-input v-model="queryForm.keyword" placeholder="搜索标题或正文" clearable style="width: 220px"
                        @keyup.enter="handleSearch" />
                </el-form-item>

                <el-form-item label="等级">
                    <el-select v-model="queryForm.level" placeholder="请选择等级" clearable style="width: 140px">
                        <el-option label="N5" value="N5" />
                        <el-option label="N4" value="N4" />
                        <el-option label="N3" value="N3" />
                        <el-option label="N2" value="N2" />
                        <el-option label="N1" value="N1" />
                    </el-select>
                </el-form-item>

                <el-form-item label="分类">
                    <el-select v-model="queryForm.category" placeholder="请选择分类" clearable style="width: 160px">
                        <el-option label="reading" value="reading" />
                        <el-option label="news" value="news" />
                        <el-option label="dialogue" value="dialogue" />
                    </el-select>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="handleSearch">搜索</el-button>
                    <el-button @click="handleReset">重置</el-button>
                </el-form-item>
            </el-form>

            <el-table v-loading="loading" :data="sortedArticleList" border style="width: 100%">
                <el-table-column label="序号" width="80">
                    <template #default="{ $index }">
                        {{ (queryForm.page - 1) * queryForm.pageSize + $index + 1 }}
                    </template>
                </el-table-column>

                <el-table-column prop="id" label="AID" width="80" />

                <el-table-column prop="title" label="标题" min-width="180" />

                <el-table-column prop="level" label="等级" width="100">
                    <template #default="{ row }">
                        <el-tag v-if="row.level" type="success">
                            {{ row.level }}
                        </el-tag>
                        <span v-else>-</span>
                    </template>
                </el-table-column>

                <el-table-column prop="category" label="分类" width="120">
                    <template #default="{ row }">
                        <el-tag v-if="row.category">
                            {{ row.category }}
                        </el-tag>
                        <span v-else>-</span>
                    </template>
                </el-table-column>

                <el-table-column prop="createdAt" label="创建时间" width="180">
                    <template #default="{ row }">
                        {{ formatDate(row.createdAt) }}
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="240" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="handleOpenEdit(row)">
                            编辑
                        </el-button>

                        <el-button type="success" link @click="handleGoSentences(row)">
                            句子
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

        <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增文章' : '编辑文章'" width="680px"
            destroy-on-close>
            <el-form ref="articleFormRef" :model="articleForm" :rules="articleRules" label-width="90px">
                <el-form-item label="文章标题" prop="title">
                    <el-input v-model="articleForm.title" placeholder="请输入文章标题" maxlength="100" show-word-limit />
                </el-form-item>

                <el-form-item label="文章等级" prop="level">
                    <el-select v-model="articleForm.level" placeholder="请选择文章等级" clearable style="width: 100%">
                        <el-option label="N5" value="N5" />
                        <el-option label="N4" value="N4" />
                        <el-option label="N3" value="N3" />
                        <el-option label="N2" value="N2" />
                        <el-option label="N1" value="N1" />
                    </el-select>
                </el-form-item>

                <el-form-item label="文章分类" prop="category">
                    <el-select v-model="articleForm.category" placeholder="请选择文章分类" clearable style="width: 100%">
                        <el-option label="reading" value="reading" />
                        <el-option label="news" value="news" />
                        <el-option label="dialogue" value="dialogue" />
                    </el-select>
                </el-form-item>

                <el-form-item label="文章正文" prop="content">
                    <el-input v-model="articleForm.content" type="textarea" :rows="8" placeholder="请输入文章正文" />
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
import { useRouter } from "vue-router";
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import {
    createArticleApi,
    deleteArticleApi,
    getArticleDetailApi,
    getArticleListApi,
    updateArticleApi,
    type Article,
} from "@/api/article";

type DialogMode = "create" | "edit";

const loading = ref(false);
const submitLoading = ref(false);
const articleList = ref<Article[]>([]);
const total = ref(0);
const sortedArticleList = computed(() => {
    return [...articleList.value].sort((a, b) => a.id - b.id);
});

const dialogVisible = ref(false);
const dialogMode = ref<DialogMode>("create");
const articleFormRef = ref<FormInstance>();

const router = useRouter();

const handleGoSentences = (row: Article) => {
    router.push(`/articles/${row.id}/sentences`);
};    

const queryForm = reactive({
    keyword: "",
    level: "",
    category: "",
    page: 1,
    pageSize: 10,
});

const articleForm = reactive({
    id: 0,
    title: "",
    content: "",
    level: "",
    category: "",
});

const articleRules: FormRules = {
    title: [
        { required: true, message: "请输入文章标题", trigger: "blur" },
        { min: 1, max: 100, message: "文章标题长度应在 1 到 100 个字符", trigger: "blur" },
    ],
    content: [
        { required: true, message: "请输入文章正文", trigger: "blur" },
    ],
};

const resetArticleForm = () => {
    articleForm.id = 0;
    articleForm.title = "";
    articleForm.content = "";
    articleForm.level = "";
    articleForm.category = "";
};

const fetchArticleList = async () => {
    try {
        loading.value = true;

        const res = await getArticleListApi({
            keyword: queryForm.keyword || undefined,
            level: queryForm.level || undefined,
            category: queryForm.category || undefined,
            page: queryForm.page,
            pageSize: queryForm.pageSize,
        });

        if (res.code !== 200) {
            ElMessage.error(res.message || "获取文章列表失败");
            return;
        }

        articleList.value = res.data.items || [];
        total.value = res.data.total || 0;
    } catch (error) {
        console.error("获取文章列表失败:", error);
        ElMessage.error("获取文章列表失败，请检查后端服务或 token");
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => {
    queryForm.page = 1;
    fetchArticleList();
};

const handleReset = () => {
    queryForm.keyword = "";
    queryForm.level = "";
    queryForm.category = "";
    queryForm.page = 1;
    queryForm.pageSize = 10;
    fetchArticleList();
};

const handlePageChange = (page: number) => {
    queryForm.page = page;
    fetchArticleList();
};

const handlePageSizeChange = (pageSize: number) => {
    queryForm.pageSize = pageSize;
    queryForm.page = 1;
    fetchArticleList();
};

const handleOpenCreate = async () => {
    dialogMode.value = "create";
    resetArticleForm();
    dialogVisible.value = true;

    await nextTick();
    articleFormRef.value?.clearValidate();
};

const handleOpenEdit = async (row: Article) => {
    try {
        dialogMode.value = "edit";
        resetArticleForm();
        dialogVisible.value = true;

        const res = await getArticleDetailApi(row.id);

        if (res.code !== 200 || !res.data) {
            ElMessage.error(res.message || "获取文章详情失败");
            dialogVisible.value = false;
            return;
        }

        articleForm.id = res.data.id;
        articleForm.title = res.data.title || "";
        articleForm.content = res.data.content || "";
        articleForm.level = res.data.level || "";
        articleForm.category = res.data.category || "";

        await nextTick();
        articleFormRef.value?.clearValidate();
    } catch (error) {
        console.error("获取文章详情失败:", error);
        ElMessage.error("获取文章详情失败");
        dialogVisible.value = false;
    }
};

const handleSubmit = async () => {
    if (!articleFormRef.value) return;

    await articleFormRef.value.validate(async (valid) => {
        if (!valid) return;

        try {
            submitLoading.value = true;

            if (dialogMode.value === "create") {
                const res = await createArticleApi({
                    title: articleForm.title,
                    content: articleForm.content,
                    level: articleForm.level || undefined,
                    category: articleForm.category || undefined,
                });

                if (res.code !== 200) {
                    ElMessage.error(res.message || "新增文章失败");
                    return;
                }

                ElMessage.success("新增文章成功");
            } else {
                const res = await updateArticleApi(articleForm.id, {
                    id: articleForm.id,
                    title: articleForm.title,
                    content: articleForm.content,
                    level: articleForm.level || undefined,
                    category: articleForm.category || undefined,
                });

                if (res.code !== 200) {
                    ElMessage.error(res.message || "更新文章失败");
                    return;
                }

                ElMessage.success("更新文章成功");
            }

            dialogVisible.value = false;
            fetchArticleList();
        } catch (error) {
            console.error("保存文章失败:", error);
            ElMessage.error("保存文章失败，请检查后端服务或请求参数");
        } finally {
            submitLoading.value = false;
        }
    });
};

const handleDelete = async (row: Article) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除文章「${row.title}」吗？`,
            "删除确认",
            {
                confirmButtonText: "确定删除",
                cancelButtonText: "取消",
                type: "warning",
            },
        );

        const res = await deleteArticleApi(row.id);

        if (res.code !== 200) {
            ElMessage.error(res.message || "删除文章失败");
            return;
        }

        ElMessage.success("删除成功");

        if (articleList.value.length === 1 && queryForm.page > 1) {
            queryForm.page -= 1;
        }

        fetchArticleList();
    } catch (error) {
        if (error !== "cancel") {
            console.error("删除文章失败:", error);
            ElMessage.error("删除文章失败");
        }
    }
};

const formatDate = (value?: string) => {
    if (!value) return "-";
    return value.replace("T", " ").slice(0, 19);
};

onMounted(() => {
    fetchArticleList();
});
</script>

<style scoped lang="scss">
.article-page {
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