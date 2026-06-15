<template>
    <div class="sentence-page">
        <el-card>
            <template #header>
                <div class="page-header">
                    <div>
                        <div class="page-title">句子管理</div>
                        <div class="page-desc">
                            管理全部文章下的句子，支持关键词、AID、分页筛选、SID / AID 展示
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

                <el-form-item label="AID">
                    <el-input-number v-model="queryForm.articleId" :min="1" clearable style="width: 160px" />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="handleSearch">
                        搜索
                    </el-button>
                    <el-button @click="handleReset">
                        重置
                    </el-button>
                </el-form-item>
            </el-form>

            <el-table v-loading="loading" :data="sentenceList" border empty-text="暂无句子数据" style="width: 100%">
                <el-table-column label="序号" width="80">
                    <template #default="{ $index }">
                        {{ (queryForm.page - 1) * queryForm.pageSize + $index + 1 }}
                    </template>
                </el-table-column>

                <el-table-column prop="id" label="SID" width="80" />

                <el-table-column prop="articleId" label="AID" width="100" />

                <el-table-column prop="orderIndex" label="句子顺序" width="110" />

                <el-table-column prop="japaneseText" label="日语原文" min-width="220" show-overflow-tooltip />

                <el-table-column prop="chineseText" label="中文释义" min-width="220" show-overflow-tooltip />

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

                        <el-button type="success" link @click="handleOpenTestDialog(row)">
                            接口测试
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
                <el-form-item label="AID" prop="articleId">
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
                <el-button @click="dialogVisible = false">
                    取消
                </el-button>

                <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
                    保存
                </el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="testDialogVisible" title="Sentence 后端接口测试" width="980px" destroy-on-close>
            <div v-if="currentTestSentence" class="test-sentence-box">
                <div><strong>SID：</strong>{{ currentTestSentence.id }}</div>
                <div><strong>AID：</strong>{{ currentTestSentence.articleId }}</div>
                <div><strong>日语：</strong>{{ currentTestSentence.japaneseText }}</div>
                <div><strong>中文：</strong>{{ currentTestSentence.chineseText }}</div>
            </div>

            <div class="test-actions">
                <el-button type="primary" :loading="detailLoading" @click="fetchSentenceDetail">
                    重新请求详情接口
                </el-button>
            </div>

            <el-alert title="这里用于测试 GET /Sentence/{id}/detail 是否能返回当前句子的已关联词汇和语法。" type="info" show-icon
                :closable="false" class="test-alert" />

            <el-row :gutter="16">
                <el-col :span="12">
                    <el-card shadow="never" class="relation-card">
                        <template #header>
                            <div class="relation-title">已关联词汇</div>
                        </template>

                        <el-table v-loading="detailLoading" :data="relatedVocabularies" border size="small"
                            empty-text="详情接口未返回已关联词汇">
                            <el-table-column prop="id" label="VID" width="70" />
                            <el-table-column prop="word" label="单词" min-width="100" />
                            <el-table-column prop="reading" label="读音" min-width="100">
                                <template #default="{ row }">
                                    {{ row.reading || "-" }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="meaning" label="含义" min-width="120" />
                            <el-table-column label="操作" width="80">
                                <template #default="{ row }">
                                    <el-button type="danger" link @click="handleRemoveVocabulary(row.id)">
                                        移除
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                        <div class="manual-box">
                            <el-input-number v-model="vocabularyIdInput" :min="1" placeholder="VID"
                                style="width: 160px" />
                            <el-button type="primary" @click="handleAddVocabulary">
                                按 VID 关联
                            </el-button>
                            <el-button type="danger" @click="handleRemoveVocabulary(vocabularyIdInput)">
                                按 VID 移除
                            </el-button>
                        </div>
                    </el-card>
                </el-col>

                <el-col :span="12">
                    <el-card shadow="never" class="relation-card">
                        <template #header>
                            <div class="relation-title">已关联语法</div>
                        </template>

                        <el-table v-loading="detailLoading" :data="relatedGrammarPoints" border size="small"
                            empty-text="详情接口未返回已关联语法">
                            <el-table-column prop="id" label="GID" width="70" />
                            <el-table-column prop="title" label="语法标题" min-width="120" />
                            <el-table-column prop="structure" label="结构" min-width="120">
                                <template #default="{ row }">
                                    {{ row.structure || "-" }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="explanation" label="解释" min-width="140" show-overflow-tooltip />
                            <el-table-column label="操作" width="80">
                                <template #default="{ row }">
                                    <el-button type="danger" link @click="handleRemoveGrammar(row.id)">
                                        移除
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                        <div class="manual-box">
                            <el-input-number v-model="grammarPointIdInput" :min="1" placeholder="GID"
                                style="width: 160px" />
                            <el-button type="primary" @click="handleAddGrammar">
                                按 GID 关联
                            </el-button>
                            <el-button type="danger" @click="handleRemoveGrammar(grammarPointIdInput)">
                                按 GID 移除
                            </el-button>
                        </div>
                    </el-card>
                </el-col>
            </el-row>

            <el-card shadow="never" class="raw-card">
                <template #header>
                    <div class="relation-title">详情接口原始返回 data</div>
                </template>

                <pre class="raw-json">{{ formattedSentenceDetail }}</pre>
            </el-card>
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
    addSentenceGrammarApi,
    addSentenceVocabularyApi,
    createSentenceApi,
    deleteSentenceApi,
    getSentenceDetailApi,
    getSentenceListApi,
    removeSentenceGrammarApi,
    removeSentenceVocabularyApi,
    updateSentenceApi,
    type Sentence,
} from "@/api/sentence";

type DialogMode = "create" | "edit";

interface RelationVocabulary {
    id: number;
    word: string;
    reading?: string;
    meaning: string;
    partOfSpeech?: string;
    level?: string;
}

interface RelationGrammarPoint {
    id: number;
    title: string;
    explanation: string;
    structure?: string;
    example?: string;
    level?: string;
}

const loading = ref(false);
const submitLoading = ref(false);
const sentenceList = ref<Sentence[]>([]);
const total = ref(0);

const dialogVisible = ref(false);
const dialogMode = ref<DialogMode>("create");
const sentenceFormRef = ref<FormInstance>();

const testDialogVisible = ref(false);
const detailLoading = ref(false);
const currentTestSentence = ref<Sentence | null>(null);
const sentenceDetail = ref<any>(null);
const vocabularyIdInput = ref<number>(1);
const grammarPointIdInput = ref<number>(1);

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
        { required: true, message: "请输入 AID", trigger: "change" },
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

const isSuccessCode = (code?: number) => {
    return code === 200 || code === 201 || code === 204;
};

const isSuccessResponse = (res: any) => {
    if (!res) return true;
    if (typeof res.code === "undefined") return true;

    return isSuccessCode(res.code);
};

const normalizeId = (value: unknown) => {
    return Number(value);
};

const relatedVocabularies = computed<RelationVocabulary[]>(() => {
    const detail = sentenceDetail.value;
    if (!detail) return [];

    const list =
        detail.vocabularies ||
        detail.Vocabularies ||
        detail.sentenceVocabularies ||
        detail.SentenceVocabularies ||
        [];

    return list
        .map((item: any) => {
            const vocabulary = item.vocabulary || item.Vocabulary || item;

            return {
                id: normalizeId(
                    vocabulary.id ??
                    vocabulary.Id ??
                    item.vocabularyId ??
                    item.VocabularyId,
                ),
                word: vocabulary.word ?? vocabulary.Word ?? "",
                reading: vocabulary.reading ?? vocabulary.Reading ?? "",
                meaning: vocabulary.meaning ?? vocabulary.Meaning ?? "",
                partOfSpeech:
                    vocabulary.partOfSpeech ?? vocabulary.PartOfSpeech ?? "",
                level: vocabulary.level ?? vocabulary.Level ?? "",
            };
        })
        .filter((item: RelationVocabulary) => Boolean(item.id));
});

const relatedGrammarPoints = computed<RelationGrammarPoint[]>(() => {
    const detail = sentenceDetail.value;
    if (!detail) return [];

    const list =
        detail.grammarPoints ||
        detail.GrammarPoints ||
        detail.sentenceGrammarPoints ||
        detail.SentenceGrammarPoints ||
        [];

    return list
        .map((item: any) => {
            const grammar = item.grammarPoint || item.GrammarPoint || item;

            return {
                id: normalizeId(
                    grammar.id ??
                    grammar.Id ??
                    item.grammarPointId ??
                    item.GrammarPointId,
                ),
                title: grammar.title ?? grammar.Title ?? "",
                explanation: grammar.explanation ?? grammar.Explanation ?? "",
                structure: grammar.structure ?? grammar.Structure ?? "",
                example: grammar.example ?? grammar.Example ?? "",
                level: grammar.level ?? grammar.Level ?? "",
            };
        })
        .filter((item: RelationGrammarPoint) => Boolean(item.id));
});

const formattedSentenceDetail = computed(() => {
    if (!sentenceDetail.value) return "暂无详情数据";

    return JSON.stringify(sentenceDetail.value, null, 2);
});

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

        if (!isSuccessCode(res.code)) {
            ElMessage.error(res.message || "获取句子列表失败");
            return;
        }

        sentenceList.value = res.data.items || [];
        total.value = res.data.total || 0;
    } catch (error) {
        console.error("获取句子列表失败:", error);
    } finally {
        loading.value = false;
    }
};

const fetchSentenceDetail = async () => {
    if (!currentTestSentence.value) return;

    try {
        detailLoading.value = true;

        const res = await getSentenceDetailApi(currentTestSentence.value.id);

        if (!isSuccessResponse(res) || !res.data) {
            ElMessage.error(res?.message || "获取句子详情失败");
            return;
        }

        sentenceDetail.value = res.data;

        console.log("Sentence detail response data:", res.data);
    } catch (error) {
        console.error("获取句子详情失败:", error);
    } finally {
        detailLoading.value = false;
    }
};

const handleOpenTestDialog = async (row: Sentence) => {
    currentTestSentence.value = row;
    sentenceDetail.value = null;
    vocabularyIdInput.value = 1;
    grammarPointIdInput.value = 1;
    testDialogVisible.value = true;

    await fetchSentenceDetail();
};

const handleAddVocabulary = async () => {
    if (!currentTestSentence.value || !vocabularyIdInput.value) return;

    try {
        const res = await addSentenceVocabularyApi(
            currentTestSentence.value.id,
            vocabularyIdInput.value,
        );

        if (!isSuccessResponse(res)) {
            ElMessage.error(res?.message || "关联词汇失败");
            return;
        }

        ElMessage.success(`已提交关联：SID ${currentTestSentence.value.id} - VID ${vocabularyIdInput.value}`);

        await fetchSentenceDetail();
    } catch (error) {
        console.error("关联词汇失败:", error);
    }
};

const handleRemoveVocabulary = async (vocabularyId: number) => {
    if (!currentTestSentence.value || !vocabularyId) return;

    try {
        const res = await removeSentenceVocabularyApi(
            currentTestSentence.value.id,
            vocabularyId,
        );

        if (!isSuccessResponse(res)) {
            ElMessage.error(res?.message || "移除词汇关联失败");
            return;
        }

        ElMessage.success(`已提交移除：SID ${currentTestSentence.value.id} - VID ${vocabularyId}`);

        await fetchSentenceDetail();
    } catch (error) {
        console.error("移除词汇关联失败:", error);
    }
};

const handleAddGrammar = async () => {
    if (!currentTestSentence.value || !grammarPointIdInput.value) return;

    try {
        const res = await addSentenceGrammarApi(
            currentTestSentence.value.id,
            grammarPointIdInput.value,
        );

        if (!isSuccessResponse(res)) {
            ElMessage.error(res?.message || "关联语法失败");
            return;
        }

        ElMessage.success(`已提交关联：SID ${currentTestSentence.value.id} - GID ${grammarPointIdInput.value}`);

        await fetchSentenceDetail();
    } catch (error) {
        console.error("关联语法失败:", error);
    }
};

const handleRemoveGrammar = async (grammarPointId: number) => {
    if (!currentTestSentence.value || !grammarPointId) return;

    try {
        const res = await removeSentenceGrammarApi(
            currentTestSentence.value.id,
            grammarPointId,
        );

        if (!isSuccessResponse(res)) {
            ElMessage.error(res?.message || "移除语法关联失败");
            return;
        }

        ElMessage.success(`已提交移除：SID ${currentTestSentence.value.id} - GID ${grammarPointId}`);

        await fetchSentenceDetail();
    } catch (error) {
        console.error("移除语法关联失败:", error);
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

        if (!isSuccessCode(res.code) || !res.data) {
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

                if (!isSuccessCode(res.code)) {
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

                if (!isSuccessCode(res.code)) {
                    ElMessage.error(res.message || "更新句子失败");
                    return;
                }

                ElMessage.success("更新句子成功");
            }

            dialogVisible.value = false;
            fetchSentenceList();
        } catch (error) {
            console.error("保存句子失败:", error);
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

        if (!isSuccessCode(res.code)) {
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

.test-sentence-box {
    padding: 12px 14px;
    margin-bottom: 14px;
    line-height: 1.8;
    font-size: 14px;
    color: #374151;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
}

.test-actions {
    margin-bottom: 12px;
}

.test-alert {
    margin-bottom: 16px;
}

.relation-card {
    margin-bottom: 16px;
}

.relation-title {
    font-size: 15px;
    font-weight: 700;
    color: #1f2937;
}

.manual-box {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 12px;
}

.raw-card {
    margin-top: 16px;
}

.raw-json {
    max-height: 320px;
    padding: 12px;
    overflow: auto;
    font-size: 13px;
    line-height: 1.6;
    background: #111827;
    color: #d1d5db;
    border-radius: 6px;
}
</style>