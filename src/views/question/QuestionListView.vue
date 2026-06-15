<template>
    <div class="question-page">
        <el-card>
            <template #header>
                <div class="page-header">
                    <div>
                        <div class="page-title">题目管理</div>
                        <div class="page-desc">
                            管理单选题，支持题型筛选、关键词搜索和基础 CRUD
                        </div>
                    </div>

                    <el-button type="primary" @click="handleOpenCreate">
                        新增题目
                    </el-button>
                </div>
            </template>

            <el-form :model="queryForm" inline class="search-form">
                <el-form-item label="关键词">
                    <el-input v-model="queryForm.keyword" placeholder="搜索题干 / 选项 / 解析" clearable style="width: 260px"
                        @keyup.enter="handleSearch" />
                </el-form-item>

                <el-form-item label="题型">
                    <el-select v-model="queryForm.type" placeholder="请选择题型" clearable style="width: 190px">
                        <el-option label="词汇选择" value="vocabulary_choice" />
                        <el-option label="语法选择" value="grammar_choice" />
                        <el-option label="阅读理解" value="reading_choice" />
                    </el-select>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="handleSearch">搜索</el-button>
                    <el-button @click="handleReset">重置</el-button>
                </el-form-item>
            </el-form>

            <el-table v-loading="loading" :data="sortedQuestionList" border style="width: 100%">
                <el-table-column label="序号" width="80">
                    <template #default="{ $index }">
                        {{ (queryForm.page - 1) * queryForm.pageSize + $index + 1 }}
                    </template>
                </el-table-column>

                <el-table-column prop="id" label="QID" width="80" />

                <el-table-column prop="articleId" label="AID" width="90">
                    <template #default="{ row }">
                        {{ row.articleId || "-" }}
                    </template>
                </el-table-column>

                <el-table-column prop="sentenceId" label="SID" width="90">
                    <template #default="{ row }">
                        {{ row.sentenceId || "-" }}
                    </template>
                </el-table-column>

                <el-table-column prop="type" label="题型" width="150">
                    <template #default="{ row }">
                        <el-tag>{{ getTypeLabel(row.type) }}</el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="stem" label="题干" min-width="220" show-overflow-tooltip />

                <el-table-column prop="answer" label="答案" width="80">
                    <template #default="{ row }">
                        <el-tag type="success">{{ row.answer }}</el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="level" label="等级" width="100">
                    <template #default="{ row }">
                        <el-tag v-if="row.level" type="success">
                            {{ row.level }}
                        </el-tag>
                        <span v-else>-</span>
                    </template>
                </el-table-column>

                <el-table-column prop="createdAt" label="创建时间" width="180">
                    <template #default="{ row }">
                        {{ formatDate(row.createdAt) }}
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

        <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增题目' : '编辑题目'" width="760px"
            destroy-on-close>
            <el-form ref="questionFormRef" :model="questionForm" :rules="questionRules" label-width="90px">
                <el-form-item label="题型" prop="type">
                    <el-select v-model="questionForm.type" placeholder="请选择题型" style="width: 100%">
                        <el-option label="词汇选择" value="vocabulary_choice" />
                        <el-option label="语法选择" value="grammar_choice" />
                        <el-option label="阅读理解" value="reading_choice" />
                    </el-select>
                </el-form-item>

                <el-form-item label="AID" prop="articleId">
                    <el-input-number v-model="questionForm.articleId" :min="1" style="width: 100%"
                        placeholder="关联文章 ID，可选" />
                </el-form-item>

                <el-form-item label="SID" prop="sentenceId">
                    <el-input-number v-model="questionForm.sentenceId" :min="1" style="width: 100%"
                        placeholder="关联句子 ID，可选" />
                </el-form-item>

                <el-form-item label="等级" prop="level">
                    <el-select v-model="questionForm.level" placeholder="请选择等级" clearable style="width: 100%">
                        <el-option label="N5" value="N5" />
                        <el-option label="N4" value="N4" />
                        <el-option label="N3" value="N3" />
                        <el-option label="N2" value="N2" />
                        <el-option label="N1" value="N1" />
                    </el-select>
                </el-form-item>

                <el-form-item label="题干" prop="stem">
                    <el-input v-model="questionForm.stem" type="textarea" :rows="3" placeholder="请输入题干，例如：学生 的意思是？" />
                </el-form-item>

                <el-form-item label="选项A" prop="optionA">
                    <el-input v-model="questionForm.optionA" placeholder="请输入选项 A" />
                </el-form-item>

                <el-form-item label="选项B" prop="optionB">
                    <el-input v-model="questionForm.optionB" placeholder="请输入选项 B" />
                </el-form-item>

                <el-form-item label="选项C" prop="optionC">
                    <el-input v-model="questionForm.optionC" placeholder="请输入选项 C" />
                </el-form-item>

                <el-form-item label="选项D" prop="optionD">
                    <el-input v-model="questionForm.optionD" placeholder="请输入选项 D" />
                </el-form-item>

                <el-form-item label="正确答案" prop="answer">
                    <el-radio-group v-model="questionForm.answer">
                        <el-radio-button label="A" />
                        <el-radio-button label="B" />
                        <el-radio-button label="C" />
                        <el-radio-button label="D" />
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="解析" prop="explanation">
                    <el-input v-model="questionForm.explanation" type="textarea" :rows="3" placeholder="请输入答案解析" />
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
import {
    ElMessage,
    ElMessageBox,
    type FormInstance,
    type FormRules,
} from "element-plus";
import {
    createQuestionApi,
    deleteQuestionApi,
    getQuestionDetailApi,
    getQuestionListApi,
    updateQuestionApi,
    type Question,
} from "@/api/question";

type DialogMode = "create" | "edit";

const loading = ref(false);
const submitLoading = ref(false);
const questionList = ref<Question[]>([]);
const total = ref(0);

const dialogVisible = ref(false);
const dialogMode = ref<DialogMode>("create");
const questionFormRef = ref<FormInstance>();

const queryForm = reactive({
    keyword: "",
    type: "",
    page: 1,
    pageSize: 10,
});

const questionForm = reactive<{
    id: number;
    articleId: number | undefined;
    sentenceId: number | undefined;
    type: string;
    stem: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    answer: string;
    explanation: string;
    level: string;
}>({
    id: 0,
    articleId: undefined,
    sentenceId: undefined,
    type: "vocabulary_choice",
    stem: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    answer: "A",
    explanation: "",
    level: "",
});

const questionRules: FormRules = {
    type: [{ required: true, message: "请选择题型", trigger: "change" }],
    stem: [{ required: true, message: "请输入题干", trigger: "blur" }],
    answer: [{ required: true, message: "请选择正确答案", trigger: "change" }],
};

const sortedQuestionList = computed(() => {
    return [...questionList.value].sort((a, b) => a.id - b.id);
});

const resetQuestionForm = () => {
    questionForm.id = 0;
    questionForm.articleId = undefined;
    questionForm.sentenceId = undefined;
    questionForm.type = "vocabulary_choice";
    questionForm.stem = "";
    questionForm.optionA = "";
    questionForm.optionB = "";
    questionForm.optionC = "";
    questionForm.optionD = "";
    questionForm.answer = "A";
    questionForm.explanation = "";
    questionForm.level = "";
};

const buildQuestionPayload = () => {
    return {
        articleId: questionForm.articleId || undefined,
        sentenceId: questionForm.sentenceId || undefined,
        type: questionForm.type,
        stem: questionForm.stem,
        optionA: questionForm.optionA || undefined,
        optionB: questionForm.optionB || undefined,
        optionC: questionForm.optionC || undefined,
        optionD: questionForm.optionD || undefined,
        answer: questionForm.answer,
        explanation: questionForm.explanation || undefined,
        level: questionForm.level || undefined,
    };
};

const fetchQuestionList = async () => {
    try {
        loading.value = true;

        const res = await getQuestionListApi({
            type: queryForm.type || undefined,
            keyword: queryForm.keyword || undefined,
            page: queryForm.page,
            pageSize: queryForm.pageSize,
        });

        if (res.code !== 200) {
            ElMessage.error(res.message || "获取题目列表失败");
            return;
        }

        questionList.value = res.data.items || [];
        total.value = res.data.total || 0;
    } catch (error) {
        console.error("获取题目列表失败:", error);
        ElMessage.error("获取题目列表失败，请检查后端服务");
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => {
    queryForm.page = 1;
    fetchQuestionList();
};

const handleReset = () => {
    queryForm.keyword = "";
    queryForm.type = "";
    queryForm.page = 1;
    queryForm.pageSize = 10;
    fetchQuestionList();
};

const handlePageChange = (page: number) => {
    queryForm.page = page;
    fetchQuestionList();
};

const handlePageSizeChange = (pageSize: number) => {
    queryForm.pageSize = pageSize;
    queryForm.page = 1;
    fetchQuestionList();
};

const handleOpenCreate = async () => {
    dialogMode.value = "create";
    resetQuestionForm();
    dialogVisible.value = true;

    await nextTick();
    questionFormRef.value?.clearValidate();
};

const handleOpenEdit = async (row: Question) => {
    try {
        dialogMode.value = "edit";
        resetQuestionForm();
        dialogVisible.value = true;

        const res = await getQuestionDetailApi(row.id);

        if (res.code !== 200 || !res.data) {
            ElMessage.error(res.message || "获取题目详情失败");
            dialogVisible.value = false;
            return;
        }

        questionForm.id = res.data.id;
        questionForm.articleId = res.data.articleId;
        questionForm.sentenceId = res.data.sentenceId;
        questionForm.type = res.data.type || "vocabulary_choice";
        questionForm.stem = res.data.stem || "";
        questionForm.optionA = res.data.optionA || "";
        questionForm.optionB = res.data.optionB || "";
        questionForm.optionC = res.data.optionC || "";
        questionForm.optionD = res.data.optionD || "";
        questionForm.answer = res.data.answer || "A";
        questionForm.explanation = res.data.explanation || "";
        questionForm.level = res.data.level || "";

        await nextTick();
        questionFormRef.value?.clearValidate();
    } catch (error) {
        console.error("获取题目详情失败:", error);
        ElMessage.error("获取题目详情失败");
        dialogVisible.value = false;
    }
};

const handleSubmit = async () => {
    if (!questionFormRef.value) return;

    await questionFormRef.value.validate(async (valid) => {
        if (!valid) return;

        try {
            submitLoading.value = true;

            if (dialogMode.value === "create") {
                const res = await createQuestionApi(buildQuestionPayload());

                if (res.code !== 200) {
                    ElMessage.error(res.message || "新增题目失败");
                    return;
                }

                ElMessage.success("新增题目成功");
            } else {
                const res = await updateQuestionApi(questionForm.id, {
                    id: questionForm.id,
                    ...buildQuestionPayload(),
                });

                if (res.code !== 200) {
                    ElMessage.error(res.message || "更新题目失败");
                    return;
                }

                ElMessage.success("更新题目成功");
            }

            dialogVisible.value = false;
            fetchQuestionList();
        } catch (error) {
            console.error("保存题目失败:", error);
            ElMessage.error("保存题目失败，请检查 AID / SID 是否存在");
        } finally {
            submitLoading.value = false;
        }
    });
};

const handleDelete = async (row: Question) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除题目「${row.stem}」吗？`,
            "删除确认",
            {
                confirmButtonText: "确定删除",
                cancelButtonText: "取消",
                type: "warning",
            },
        );

        const res = await deleteQuestionApi(row.id);

        if (res.code !== 200) {
            ElMessage.error(res.message || "删除题目失败");
            return;
        }

        ElMessage.success("删除成功");

        if (questionList.value.length === 1 && queryForm.page > 1) {
            queryForm.page -= 1;
        }

        fetchQuestionList();
    } catch (error) {
        if (error !== "cancel") {
            console.error("删除题目失败:", error);
            ElMessage.error("删除题目失败");
        }
    }
};

const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
        vocabulary_choice: "词汇选择",
        grammar_choice: "语法选择",
        reading_choice: "阅读理解",
    };

    return map[type] || type;
};

const formatDate = (value?: string) => {
    if (!value) return "-";
    return value.replace("T", " ").slice(0, 19);
};

onMounted(() => {
    fetchQuestionList();
});
</script>

<style scoped lang="scss">
.question-page {
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