<template>
    <div class="vocabulary-page">
        <el-card>
            <template #header>
                <div class="page-header">
                    <div>
                        <div class="page-title">词汇管理</div>
                        <div class="page-desc">
                            管理日语词汇，支持单词、等级、词性筛选和基础 CRUD
                        </div>
                    </div>

                    <el-button type="primary" @click="handleOpenCreate">
                        新增词汇
                    </el-button>
                </div>
            </template>

            <el-form :model="queryForm" inline class="search-form">
                <el-form-item label="关键词">
                    <el-input v-model="queryForm.word" placeholder="搜索单词 / 读音 / 含义" clearable style="width: 240px"
                        @keyup.enter="handleSearch" />
                </el-form-item>

                <el-form-item label="等级">
                    <el-select v-model="queryForm.level" placeholder="等级" clearable style="width: 120px">
                        <el-option label="N5" value="N5" />
                        <el-option label="N4" value="N4" />
                        <el-option label="N3" value="N3" />
                        <el-option label="N2" value="N2" />
                        <el-option label="N1" value="N1" />
                    </el-select>
                </el-form-item>

                <el-form-item label="词性">
                    <el-select v-model="queryForm.partOfSpeech" placeholder="词性" clearable filterable allow-create
                        style="width: 150px">
                        <el-option label="noun" value="noun" />
                        <el-option label="verb" value="verb" />
                        <el-option label="adjective" value="adjective" />
                        <el-option label="adverb" value="adverb" />
                        <el-option label="particle" value="particle" />
                        <el-option label="expression" value="expression" />
                    </el-select>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="handleSearch">搜索</el-button>
                    <el-button @click="handleReset">重置</el-button>
                </el-form-item>
            </el-form>

            <el-table v-loading="loading" :data="sortedVocabularyList" border style="width: 100%">
                <el-table-column label="序号" width="80">
                    <template #default="{ $index }">
                        {{ (queryForm.page - 1) * queryForm.pageSize + $index + 1 }}
                    </template>
                </el-table-column>

                <el-table-column prop="id" label="VID" width="80" />

                <el-table-column prop="word" label="单词" min-width="160" />

                <el-table-column prop="reading" label="读音" min-width="160">
                    <template #default="{ row }">
                        {{ row.reading || "-" }}
                    </template>
                </el-table-column>

                <el-table-column prop="meaning" label="含义" min-width="180" />

                <el-table-column prop="partOfSpeech" label="词性" width="130">
                    <template #default="{ row }">
                        <el-tag v-if="row.partOfSpeech">
                            {{ row.partOfSpeech }}
                        </el-tag>
                        <span v-else>-</span>
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

        <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增词汇' : '编辑词汇'" width="620px"
            destroy-on-close>
            <el-form ref="vocabularyFormRef" :model="vocabularyForm" :rules="vocabularyRules" label-width="90px">
                <el-form-item label="单词" prop="word">
                    <el-input v-model="vocabularyForm.word" placeholder="请输入单词，例如：学生" />
                </el-form-item>

                <el-form-item label="读音" prop="reading">
                    <el-input v-model="vocabularyForm.reading" placeholder="请输入读音，例如：がくせい" />
                </el-form-item>

                <el-form-item label="含义" prop="meaning">
                    <el-input v-model="vocabularyForm.meaning" placeholder="请输入中文含义，例如：学生" />
                </el-form-item>

                <el-form-item label="词性" prop="partOfSpeech">
                    <el-select v-model="vocabularyForm.partOfSpeech" placeholder="请选择或输入词性" clearable filterable
                        allow-create style="width: 100%">
                        <el-option label="noun" value="noun" />
                        <el-option label="verb" value="verb" />
                        <el-option label="adjective" value="adjective" />
                        <el-option label="adverb" value="adverb" />
                        <el-option label="particle" value="particle" />
                        <el-option label="expression" value="expression" />
                    </el-select>
                </el-form-item>

                <el-form-item label="等级" prop="level">
                    <el-select v-model="vocabularyForm.level" placeholder="请选择等级" clearable style="width: 100%">
                        <el-option label="N5" value="N5" />
                        <el-option label="N4" value="N4" />
                        <el-option label="N3" value="N3" />
                        <el-option label="N2" value="N2" />
                        <el-option label="N1" value="N1" />
                    </el-select>
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
    createVocabularyApi,
    deleteVocabularyApi,
    getVocabularyDetailApi,
    getVocabularyListApi,
    updateVocabularyApi,
    type Vocabulary,
} from "@/api/vocabulary";

type DialogMode = "create" | "edit";

const loading = ref(false);
const submitLoading = ref(false);
const vocabularyList = ref<Vocabulary[]>([]);
const total = ref(0);

const dialogVisible = ref(false);
const dialogMode = ref<DialogMode>("create");
const vocabularyFormRef = ref<FormInstance>();

const queryForm = reactive({
    word: "",
    level: "",
    partOfSpeech: "",
    page: 1,
    pageSize: 10,
});

const vocabularyForm = reactive({
    id: 0,
    word: "",
    reading: "",
    meaning: "",
    partOfSpeech: "",
    level: "",
});

const vocabularyRules: FormRules = {
    word: [
        { required: true, message: "请输入单词", trigger: "blur" },
    ],
    meaning: [
        { required: true, message: "请输入中文含义", trigger: "blur" },
    ],
};

const sortedVocabularyList = computed(() => {
    return [...vocabularyList.value].sort((a, b) => a.id - b.id);
});

const resetVocabularyForm = () => {
    vocabularyForm.id = 0;
    vocabularyForm.word = "";
    vocabularyForm.reading = "";
    vocabularyForm.meaning = "";
    vocabularyForm.partOfSpeech = "";
    vocabularyForm.level = "";
};

const fetchVocabularyList = async () => {
    try {
        loading.value = true;

        const res = await getVocabularyListApi({
            word: queryForm.word || undefined,
            level: queryForm.level || undefined,
            partOfSpeech: queryForm.partOfSpeech || undefined,
            page: queryForm.page,
            pageSize: queryForm.pageSize,
        });

        if (res.code !== 200) {
            ElMessage.error(res.message || "获取词汇列表失败");
            return;
        }

        vocabularyList.value = res.data.items || [];
        total.value = res.data.total || 0;
    } catch (error) {
        console.error("获取词汇列表失败:", error);
        ElMessage.error("获取词汇列表失败，请检查后端服务");
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => {
    queryForm.page = 1;
    fetchVocabularyList();
};

const handleReset = () => {
    queryForm.word = "";
    queryForm.level = "";
    queryForm.partOfSpeech = "";
    queryForm.page = 1;
    queryForm.pageSize = 10;
    fetchVocabularyList();
};

const handlePageChange = (page: number) => {
    queryForm.page = page;
    fetchVocabularyList();
};

const handlePageSizeChange = (pageSize: number) => {
    queryForm.pageSize = pageSize;
    queryForm.page = 1;
    fetchVocabularyList();
};

const handleOpenCreate = async () => {
    dialogMode.value = "create";
    resetVocabularyForm();
    dialogVisible.value = true;

    await nextTick();
    vocabularyFormRef.value?.clearValidate();
};

const handleOpenEdit = async (row: Vocabulary) => {
    try {
        dialogMode.value = "edit";
        resetVocabularyForm();
        dialogVisible.value = true;

        const res = await getVocabularyDetailApi(row.id);

        if (res.code !== 200 || !res.data) {
            ElMessage.error(res.message || "获取词汇详情失败");
            dialogVisible.value = false;
            return;
        }

        vocabularyForm.id = res.data.id;
        vocabularyForm.word = res.data.word || "";
        vocabularyForm.reading = res.data.reading || "";
        vocabularyForm.meaning = res.data.meaning || "";
        vocabularyForm.partOfSpeech = res.data.partOfSpeech || "";
        vocabularyForm.level = res.data.level || "";

        await nextTick();
        vocabularyFormRef.value?.clearValidate();
    } catch (error) {
        console.error("获取词汇详情失败:", error);
        ElMessage.error("获取词汇详情失败");
        dialogVisible.value = false;
    }
};

const handleSubmit = async () => {
    if (!vocabularyFormRef.value) return;

    await vocabularyFormRef.value.validate(async (valid) => {
        if (!valid) return;

        try {
            submitLoading.value = true;

            if (dialogMode.value === "create") {
                const res = await createVocabularyApi({
                    word: vocabularyForm.word,
                    reading: vocabularyForm.reading || undefined,
                    meaning: vocabularyForm.meaning,
                    partOfSpeech: vocabularyForm.partOfSpeech || undefined,
                    level: vocabularyForm.level || undefined,
                });

                if (res.code !== 200) {
                    ElMessage.error(res.message || "新增词汇失败");
                    return;
                }

                ElMessage.success("新增词汇成功");
            } else {
                const res = await updateVocabularyApi(vocabularyForm.id, {
                    id: vocabularyForm.id,
                    word: vocabularyForm.word,
                    reading: vocabularyForm.reading || undefined,
                    meaning: vocabularyForm.meaning,
                    partOfSpeech: vocabularyForm.partOfSpeech || undefined,
                    level: vocabularyForm.level || undefined,
                });

                if (res.code !== 200) {
                    ElMessage.error(res.message || "更新词汇失败");
                    return;
                }

                ElMessage.success("更新词汇成功");
            }

            dialogVisible.value = false;
            fetchVocabularyList();
        } catch (error) {
            console.error("保存词汇失败:", error);
            ElMessage.error("保存词汇失败，请检查请求参数或后端服务");
        } finally {
            submitLoading.value = false;
        }
    });
};

const handleDelete = async (row: Vocabulary) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除词汇「${row.word}」吗？`,
            "删除确认",
            {
                confirmButtonText: "确定删除",
                cancelButtonText: "取消",
                type: "warning",
            },
        );

        const res = await deleteVocabularyApi(row.id);

        if (res.code !== 200) {
            ElMessage.error(res.message || "删除词汇失败");
            return;
        }

        ElMessage.success("删除成功");

        if (vocabularyList.value.length === 1 && queryForm.page > 1) {
            queryForm.page -= 1;
        }

        fetchVocabularyList();
    } catch (error) {
        if (error !== "cancel") {
            console.error("删除词汇失败:", error);
            ElMessage.error("删除词汇失败");
        }
    }
};

onMounted(() => {
    fetchVocabularyList();
});
</script>

<style scoped lang="scss">
.vocabulary-page {
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