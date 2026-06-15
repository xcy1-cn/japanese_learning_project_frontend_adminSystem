<template>
    <div class="grammar-page">
        <el-card>
            <template #header>
                <div class="page-header">
                    <div>
                        <div class="page-title">语法管理</div>
                        <div class="page-desc">
                            管理日语语法点，支持关键词、等级筛选和基础 CRUD
                        </div>
                    </div>

                    <el-button type="primary" @click="handleOpenCreate">
                        新增语法
                    </el-button>
                </div>
            </template>

            <el-form :model="queryForm" inline class="search-form">
                <el-form-item label="关键词">
                    <el-input v-model="queryForm.keyword" placeholder="搜索标题 / 解释 / 结构 / 例句" clearable
                        style="width: 260px" @keyup.enter="handleSearch" />
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

                <el-form-item>
                    <el-button type="primary" @click="handleSearch">搜索</el-button>
                    <el-button @click="handleReset">重置</el-button>
                </el-form-item>
            </el-form>

            <el-table v-loading="loading" :data="sortedGrammarList" border style="width: 100%">
                <el-table-column label="序号" width="80">
                    <template #default="{ $index }">
                        {{ (queryForm.page - 1) * queryForm.pageSize + $index + 1 }}
                    </template>
                </el-table-column>

                <el-table-column prop="id" label="GID" width="80" />

                <el-table-column prop="title" label="语法标题" min-width="160" />

                <el-table-column prop="structure" label="语法结构" min-width="180">
                    <template #default="{ row }">
                        {{ row.structure || "-" }}
                    </template>
                </el-table-column>

                <el-table-column prop="explanation" label="语法解释" min-width="220" show-overflow-tooltip />

                <el-table-column prop="example" label="例句" min-width="220" show-overflow-tooltip>
                    <template #default="{ row }">
                        {{ row.example || "-" }}
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

        <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增语法' : '编辑语法'" width="720px"
            destroy-on-close>
            <el-form ref="grammarFormRef" :model="grammarForm" :rules="grammarRules" label-width="90px">
                <el-form-item label="语法标题" prop="title">
                    <el-input v-model="grammarForm.title" placeholder="请输入语法标题，例如：〜ために" />
                </el-form-item>

                <el-form-item label="语法解释" prop="explanation">
                    <el-input v-model="grammarForm.explanation" type="textarea" :rows="3"
                        placeholder="请输入语法解释，例如：表示目的" />
                </el-form-item>

                <el-form-item label="语法结构" prop="structure">
                    <el-input v-model="grammarForm.structure" placeholder="请输入语法结构，例如：V辞書形 + ために" />
                </el-form-item>

                <el-form-item label="例句" prop="example">
                    <el-input v-model="grammarForm.example" type="textarea" :rows="3"
                        placeholder="请输入例句，例如：日本へ行くために勉強します。" />
                </el-form-item>

                <el-form-item label="等级" prop="level">
                    <el-select v-model="grammarForm.level" placeholder="请选择等级" clearable style="width: 100%">
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
    createGrammarApi,
    deleteGrammarApi,
    getGrammarDetailApi,
    getGrammarListApi,
    updateGrammarApi,
    type GrammarPoint,
} from "@/api/grammar";

type DialogMode = "create" | "edit";

const loading = ref(false);
const submitLoading = ref(false);
const grammarList = ref<GrammarPoint[]>([]);
const total = ref(0);

const dialogVisible = ref(false);
const dialogMode = ref<DialogMode>("create");
const grammarFormRef = ref<FormInstance>();

const queryForm = reactive({
    keyword: "",
    level: "",
    page: 1,
    pageSize: 10,
});

const grammarForm = reactive({
    id: 0,
    title: "",
    explanation: "",
    structure: "",
    example: "",
    level: "",
});

const grammarRules: FormRules = {
    title: [
        { required: true, message: "请输入语法标题", trigger: "blur" },
    ],
    explanation: [
        { required: true, message: "请输入语法解释", trigger: "blur" },
    ],
};

const sortedGrammarList = computed(() => {
    return [...grammarList.value].sort((a, b) => a.id - b.id);
});

const resetGrammarForm = () => {
    grammarForm.id = 0;
    grammarForm.title = "";
    grammarForm.explanation = "";
    grammarForm.structure = "";
    grammarForm.example = "";
    grammarForm.level = "";
};

const fetchGrammarList = async () => {
    try {
        loading.value = true;

        const res = await getGrammarListApi({
            keyword: queryForm.keyword || undefined,
            level: queryForm.level || undefined,
            page: queryForm.page,
            pageSize: queryForm.pageSize,
        });

        if (res.code !== 200) {
            ElMessage.error(res.message || "获取语法列表失败");
            return;
        }

        grammarList.value = res.data.items || [];
        total.value = res.data.total || 0;
    } catch (error) {
        console.error("获取语法列表失败:", error);
        ElMessage.error("获取语法列表失败，请检查后端服务");
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => {
    queryForm.page = 1;
    fetchGrammarList();
};

const handleReset = () => {
    queryForm.keyword = "";
    queryForm.level = "";
    queryForm.page = 1;
    queryForm.pageSize = 10;
    fetchGrammarList();
};

const handlePageChange = (page: number) => {
    queryForm.page = page;
    fetchGrammarList();
};

const handlePageSizeChange = (pageSize: number) => {
    queryForm.pageSize = pageSize;
    queryForm.page = 1;
    fetchGrammarList();
};

const handleOpenCreate = async () => {
    dialogMode.value = "create";
    resetGrammarForm();
    dialogVisible.value = true;

    await nextTick();
    grammarFormRef.value?.clearValidate();
};

const handleOpenEdit = async (row: GrammarPoint) => {
    try {
        dialogMode.value = "edit";
        resetGrammarForm();
        dialogVisible.value = true;

        const res = await getGrammarDetailApi(row.id);

        if (res.code !== 200 || !res.data) {
            ElMessage.error(res.message || "获取语法详情失败");
            dialogVisible.value = false;
            return;
        }

        grammarForm.id = res.data.id;
        grammarForm.title = res.data.title || "";
        grammarForm.explanation = res.data.explanation || "";
        grammarForm.structure = res.data.structure || "";
        grammarForm.example = res.data.example || "";
        grammarForm.level = res.data.level || "";

        await nextTick();
        grammarFormRef.value?.clearValidate();
    } catch (error) {
        console.error("获取语法详情失败:", error);
        ElMessage.error("获取语法详情失败");
        dialogVisible.value = false;
    }
};

const handleSubmit = async () => {
    if (!grammarFormRef.value) return;

    await grammarFormRef.value.validate(async (valid) => {
        if (!valid) return;

        try {
            submitLoading.value = true;

            if (dialogMode.value === "create") {
                const res = await createGrammarApi({
                    title: grammarForm.title,
                    explanation: grammarForm.explanation,
                    structure: grammarForm.structure || undefined,
                    example: grammarForm.example || undefined,
                    level: grammarForm.level || undefined,
                });

                if (res.code !== 200) {
                    ElMessage.error(res.message || "新增语法失败");
                    return;
                }

                ElMessage.success("新增语法成功");
            } else {
                const res = await updateGrammarApi(grammarForm.id, {
                    id: grammarForm.id,
                    title: grammarForm.title,
                    explanation: grammarForm.explanation,
                    structure: grammarForm.structure || undefined,
                    example: grammarForm.example || undefined,
                    level: grammarForm.level || undefined,
                });

                if (res.code !== 200) {
                    ElMessage.error(res.message || "更新语法失败");
                    return;
                }

                ElMessage.success("更新语法成功");
            }

            dialogVisible.value = false;
            fetchGrammarList();
        } catch (error) {
            console.error("保存语法失败:", error);
            ElMessage.error("保存语法失败，请检查请求参数或后端服务");
        } finally {
            submitLoading.value = false;
        }
    });
};

const handleDelete = async (row: GrammarPoint) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除语法「${row.title}」吗？`,
            "删除确认",
            {
                confirmButtonText: "确定删除",
                cancelButtonText: "取消",
                type: "warning",
            },
        );

        const res = await deleteGrammarApi(row.id);

        if (res.code !== 200) {
            ElMessage.error(res.message || "删除语法失败");
            return;
        }

        ElMessage.success("删除成功");

        if (grammarList.value.length === 1 && queryForm.page > 1) {
            queryForm.page -= 1;
        }

        fetchGrammarList();
    } catch (error) {
        if (error !== "cancel") {
            console.error("删除语法失败:", error);
            ElMessage.error("删除语法失败");
        }
    }
};

onMounted(() => {
    fetchGrammarList();
});
</script>

<style scoped lang="scss">
.grammar-page {
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