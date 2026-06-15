<template>
    <div class="sentence-page">
        <el-card>
            <template #header>
                <div class="page-header">
                    <div>
                        <div class="page-title">文章句子管理</div>
                        <div class="page-desc">
                            当前文章 AID：{{ articleId }}，管理该文章下的句子内容
                        </div>
                    </div>

                    <div class="header-actions">
                        <el-button @click="handleBack">
                            返回文章管理
                        </el-button>

                        <el-button type="primary" @click="handleOpenCreate">
                            新增句子
                        </el-button>
                    </div>
                </div>
            </template>

            <el-table v-loading="loading" :data="sortedSentenceList" border empty-text="暂无句子数据" style="width: 100%">
                <el-table-column label="序号" width="80">
                    <template #default="{ $index }">
                        {{ $index + 1 }}
                    </template>
                </el-table-column>

                <el-table-column prop="id" label="SID" width="80" />

                <el-table-column prop="articleId" label="AID" width="80" />

                <el-table-column prop="orderIndex" label="句子顺序" width="110" />

                <el-table-column prop="japaneseText" label="日语原文" min-width="220" show-overflow-tooltip />

                <el-table-column prop="chineseText" label="中文释义" min-width="220" show-overflow-tooltip />

                <el-table-column prop="romaji" label="罗马音" min-width="180" show-overflow-tooltip>
                    <template #default="{ row }">
                        {{ row.romaji || "-" }}
                    </template>
                </el-table-column>

                <el-table-column prop="createdAt" label="创建时间" width="180">
                    <template #default="{ row }">
                        {{ formatDate(row.createdAt) }}
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="260" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="handleOpenEdit(row)">
                            编辑
                        </el-button>

                        <el-button type="success" link @click="handleOpenVocabularyDialog(row)">
                            关联词汇
                        </el-button>

                        <el-button type="warning" link @click="handleOpenGrammarDialog(row)">
                            关联语法
                        </el-button>

                        <el-button type="danger" link @click="handleDelete(row)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增句子' : '编辑句子'" width="720px"
            destroy-on-close>
            <el-form ref="sentenceFormRef" :model="sentenceForm" :rules="sentenceRules" label-width="90px">
                <el-form-item label="AID" prop="articleId">
                    <el-input-number v-model="sentenceForm.articleId" :min="1" disabled style="width: 100%" />
                </el-form-item>

                <el-form-item label="句子顺序" prop="orderIndex">
                    <el-input-number v-model="sentenceForm.orderIndex" :min="1" style="width: 100%" />
                </el-form-item>

                <el-form-item label="日语原文" prop="japaneseText">
                    <el-input v-model="sentenceForm.japaneseText" type="textarea" :rows="3" placeholder="请输入日语句子" />
                </el-form-item>

                <el-form-item label="中文释义" prop="chineseText">
                    <el-input v-model="sentenceForm.chineseText" type="textarea" :rows="3" placeholder="请输入中文释义" />
                </el-form-item>

                <el-form-item label="罗马音" prop="romaji">
                    <el-input v-model="sentenceForm.romaji" placeholder="请输入罗马音，可选" />
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

        <el-dialog v-model="vocabularyDialogVisible" title="关联词汇" width="860px" destroy-on-close>
            <div v-if="currentSentence" class="relation-sentence-box">
                <div><strong>SID：</strong>{{ currentSentence.id }}</div>
                <div><strong>日语：</strong>{{ currentSentence.japaneseText }}</div>
                <div><strong>中文：</strong>{{ currentSentence.chineseText }}</div>
            </div>

            <el-form :model="vocabularyQueryForm" inline class="relation-search-form">
                <el-form-item label="关键词">
                    <el-input v-model="vocabularyQueryForm.word" placeholder="搜索词汇" clearable style="width: 220px"
                        @keyup.enter="fetchVocabularyOptions" />
                </el-form-item>

                <el-form-item label="等级">
                    <el-select v-model="vocabularyQueryForm.level" placeholder="等级" clearable style="width: 120px">
                        <el-option label="N5" value="N5" />
                        <el-option label="N4" value="N4" />
                        <el-option label="N3" value="N3" />
                        <el-option label="N2" value="N2" />
                        <el-option label="N1" value="N1" />
                    </el-select>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="fetchVocabularyOptions">
                        搜索
                    </el-button>
                </el-form-item>
            </el-form>

            <div class="relation-section">
                <div class="relation-section-title">已关联词汇</div>

                <el-table :data="relatedVocabularies" border size="small" empty-text="暂无已关联词汇" class="related-table">
                    <el-table-column prop="id" label="VID" width="80" />
                    <el-table-column prop="word" label="单词" min-width="120" />
                    <el-table-column prop="reading" label="读音" min-width="120">
                        <template #default="{ row }">
                            {{ row.reading || "-" }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="meaning" label="含义" min-width="160" />
                    <el-table-column prop="level" label="等级" width="90">
                        <template #default="{ row }">
                            <el-tag v-if="row.level" type="success">
                                {{ row.level }}
                            </el-tag>
                            <span v-else>-</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" width="100" fixed="right">
                        <template #default="{ row }">
                            <el-button type="danger" link @click="handleRemoveVocabulary(row)">
                                移除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div class="relation-section">
                <div class="relation-section-title">可关联词汇</div>

                <el-table v-loading="vocabularyLoading" :data="availableVocabularyOptions" border height="320"
                    empty-text="暂无可关联词汇">
                    <el-table-column prop="id" label="VID" width="80" />
                    <el-table-column prop="word" label="单词" min-width="140" />
                    <el-table-column prop="reading" label="读音" min-width="140">
                        <template #default="{ row }">
                            {{ row.reading || "-" }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="meaning" label="含义" min-width="160" />
                    <el-table-column prop="level" label="等级" width="90">
                        <template #default="{ row }">
                            <el-tag v-if="row.level" type="success">
                                {{ row.level }}
                            </el-tag>
                            <span v-else>-</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" width="100" fixed="right">
                        <template #default="{ row }">
                            <el-button type="primary" link @click="handleAddVocabulary(row)">
                                关联
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-dialog>

        <el-dialog v-model="grammarDialogVisible" title="关联语法" width="900px" destroy-on-close>
            <div v-if="currentSentence" class="relation-sentence-box">
                <div><strong>SID：</strong>{{ currentSentence.id }}</div>
                <div><strong>日语：</strong>{{ currentSentence.japaneseText }}</div>
                <div><strong>中文：</strong>{{ currentSentence.chineseText }}</div>
            </div>

            <el-form :model="grammarQueryForm" inline class="relation-search-form">
                <el-form-item label="关键词">
                    <el-input v-model="grammarQueryForm.keyword" placeholder="搜索语法" clearable style="width: 220px"
                        @keyup.enter="fetchGrammarOptions" />
                </el-form-item>

                <el-form-item label="等级">
                    <el-select v-model="grammarQueryForm.level" placeholder="等级" clearable style="width: 120px">
                        <el-option label="N5" value="N5" />
                        <el-option label="N4" value="N4" />
                        <el-option label="N3" value="N3" />
                        <el-option label="N2" value="N2" />
                        <el-option label="N1" value="N1" />
                    </el-select>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="fetchGrammarOptions">
                        搜索
                    </el-button>
                </el-form-item>
            </el-form>

            <div class="relation-section">
                <div class="relation-section-title">已关联语法</div>

                <el-table :data="relatedGrammarPoints" border size="small" empty-text="暂无已关联语法" class="related-table">
                    <el-table-column prop="id" label="GID" width="80" />
                    <el-table-column prop="title" label="语法标题" min-width="140" />
                    <el-table-column prop="structure" label="结构" min-width="180">
                        <template #default="{ row }">
                            {{ row.structure || "-" }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="explanation" label="解释" min-width="220" show-overflow-tooltip />
                    <el-table-column prop="level" label="等级" width="90">
                        <template #default="{ row }">
                            <el-tag v-if="row.level" type="success">
                                {{ row.level }}
                            </el-tag>
                            <span v-else>-</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" width="100" fixed="right">
                        <template #default="{ row }">
                            <el-button type="danger" link @click="handleRemoveGrammar(row)">
                                移除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div class="relation-section">
                <div class="relation-section-title">可关联语法</div>

                <el-table v-loading="grammarLoading" :data="availableGrammarOptions" border height="320"
                    empty-text="暂无可关联语法">
                    <el-table-column prop="id" label="GID" width="80" />
                    <el-table-column prop="title" label="语法标题" min-width="140" />
                    <el-table-column prop="structure" label="结构" min-width="180">
                        <template #default="{ row }">
                            {{ row.structure || "-" }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="explanation" label="解释" min-width="220" show-overflow-tooltip />
                    <el-table-column prop="level" label="等级" width="90">
                        <template #default="{ row }">
                            <el-tag v-if="row.level" type="success">
                                {{ row.level }}
                            </el-tag>
                            <span v-else>-</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" width="100" fixed="right">
                        <template #default="{ row }">
                            <el-button type="primary" link @click="handleAddGrammar(row)">
                                关联
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
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
    addSentenceGrammarApi,
    addSentenceVocabularyApi,
    createSentenceApi,
    deleteSentenceApi,
    getArticleSentencesApi,
    getSentenceDetailApi,
    removeSentenceGrammarApi,
    removeSentenceVocabularyApi,
    updateSentenceApi,
    type Sentence,
    type SentenceDetail,
} from "@/api/sentence";
import {
    getVocabularyListApi,
    type Vocabulary,
} from "@/api/vocabulary";
import {
    getGrammarListApi,
    type GrammarPoint,
} from "@/api/grammar";

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

const currentSentence = ref<Sentence | null>(null);
const currentSentenceDetail = ref<SentenceDetail | null>(null);

const vocabularyDialogVisible = ref(false);
const vocabularyLoading = ref(false);
const vocabularyOptions = ref<Vocabulary[]>([]);

const grammarDialogVisible = ref(false);
const grammarLoading = ref(false);
const grammarOptions = ref<GrammarPoint[]>([]);

const vocabularyQueryForm = reactive({
    word: "",
    level: "",
    partOfSpeech: "",
    page: 1,
    pageSize: 20,
});

const grammarQueryForm = reactive({
    keyword: "",
    level: "",
    page: 1,
    pageSize: 20,
});

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
        { required: true, message: "请输入句子顺序", trigger: "change" },
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

const isSuccessCode = (code?: number) => {
    return code === 200 || code === 201 || code === 204;
};

const isSuccessResponse = (res: any) => {
    if (!res) return true;
    if (typeof res.code === "undefined") return true;

    return isSuccessCode(res.code);
};

const relatedVocabularies = computed<Vocabulary[]>(() => {
    return currentSentenceDetail.value?.vocabularies || [];
});

const relatedGrammarPoints = computed<GrammarPoint[]>(() => {
    return currentSentenceDetail.value?.grammarPoints || [];
});

const availableVocabularyOptions = computed(() => {
    const relatedIds = new Set(
        relatedVocabularies.value.map((item) => Number(item.id)),
    );

    return vocabularyOptions.value.filter((item) => {
        return !relatedIds.has(Number(item.id));
    });
});

const availableGrammarOptions = computed(() => {
    const relatedIds = new Set(
        relatedGrammarPoints.value.map((item) => Number(item.id)),
    );

    return grammarOptions.value.filter((item) => {
        return !relatedIds.has(Number(item.id));
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
    try {
        loading.value = true;

        const res = await getArticleSentencesApi(articleId);

        sentenceList.value = Array.isArray(res) ? res : [];
    } catch (error) {
        console.error("获取文章句子列表失败:", error);
    } finally {
        loading.value = false;
    }
};

const fetchCurrentSentenceDetail = async () => {
    if (!currentSentence.value) return;

    try {
        const res = await getSentenceDetailApi(currentSentence.value.id);

        if (!isSuccessResponse(res) || !res.data) {
            return;
        }

        currentSentenceDetail.value = res.data;
    } catch (error) {
        console.error("获取句子详情失败:", error);
    }
};

const fetchVocabularyOptions = async () => {
    try {
        vocabularyLoading.value = true;

        const res = await getVocabularyListApi({
            word: vocabularyQueryForm.word || undefined,
            level: vocabularyQueryForm.level || undefined,
            partOfSpeech: vocabularyQueryForm.partOfSpeech || undefined,
            page: vocabularyQueryForm.page,
            pageSize: vocabularyQueryForm.pageSize,
        });

        if (!isSuccessResponse(res) || !res.data) {
            return;
        }

        vocabularyOptions.value = res.data.items || [];
    } catch (error) {
        console.error("获取词汇候选列表失败:", error);
    } finally {
        vocabularyLoading.value = false;
    }
};

const fetchGrammarOptions = async () => {
    try {
        grammarLoading.value = true;

        const res = await getGrammarListApi({
            keyword: grammarQueryForm.keyword || undefined,
            level: grammarQueryForm.level || undefined,
            page: grammarQueryForm.page,
            pageSize: grammarQueryForm.pageSize,
        });

        if (!isSuccessResponse(res) || !res.data) {
            return;
        }

        grammarOptions.value = res.data.items || [];
    } catch (error) {
        console.error("获取语法候选列表失败:", error);
    } finally {
        grammarLoading.value = false;
    }
};

const handleBack = () => {
    router.push("/articles");
};

const handleOpenCreate = async () => {
    dialogMode.value = "create";
    resetSentenceForm();
    dialogVisible.value = true;

    await nextTick();
    sentenceFormRef.value?.clearValidate();
};

const handleOpenEdit = async (row: Sentence) => {
    dialogMode.value = "edit";

    sentenceForm.id = row.id;
    sentenceForm.articleId = row.articleId;
    sentenceForm.japaneseText = row.japaneseText || "";
    sentenceForm.chineseText = row.chineseText || "";
    sentenceForm.romaji = row.romaji || "";
    sentenceForm.orderIndex = row.orderIndex;

    dialogVisible.value = true;

    await nextTick();
    sentenceFormRef.value?.clearValidate();
};

const handleOpenVocabularyDialog = async (row: Sentence) => {
    currentSentence.value = row;
    currentSentenceDetail.value = null;

    vocabularyQueryForm.word = "";
    vocabularyQueryForm.level = "";
    vocabularyQueryForm.partOfSpeech = "";
    vocabularyQueryForm.page = 1;

    vocabularyDialogVisible.value = true;

    await Promise.all([
        fetchCurrentSentenceDetail(),
        fetchVocabularyOptions(),
    ]);
};

const handleOpenGrammarDialog = async (row: Sentence) => {
    currentSentence.value = row;
    currentSentenceDetail.value = null;

    grammarQueryForm.keyword = "";
    grammarQueryForm.level = "";
    grammarQueryForm.page = 1;

    grammarDialogVisible.value = true;

    await Promise.all([
        fetchCurrentSentenceDetail(),
        fetchGrammarOptions(),
    ]);
};

const handleAddVocabulary = async (row: Vocabulary) => {
    if (!currentSentence.value) return;

    try {
        const res = await addSentenceVocabularyApi(
            currentSentence.value.id,
            row.id,
        );

        if (!isSuccessResponse(res)) {
            return;
        }

        ElMessage.success(`已关联词汇：${row.word}`);

        await Promise.all([
            fetchCurrentSentenceDetail(),
            fetchVocabularyOptions(),
        ]);
    } catch (error) {
        console.error("关联词汇失败:", error);
    }
};

const handleRemoveVocabulary = async (row: Vocabulary) => {
    if (!currentSentence.value) return;

    try {
        await ElMessageBox.confirm(
            `确定要移除词汇「${row.word}」的关联吗？`,
            "移除确认",
            {
                confirmButtonText: "确定移除",
                cancelButtonText: "取消",
                type: "warning",
            },
        );

        const res = await removeSentenceVocabularyApi(
            currentSentence.value.id,
            row.id,
        );

        if (!isSuccessResponse(res)) {
            return;
        }

        ElMessage.success(`已移除词汇：${row.word}`);

        await Promise.all([
            fetchCurrentSentenceDetail(),
            fetchVocabularyOptions(),
        ]);
    } catch (error) {
        if (error !== "cancel") {
            console.error("移除词汇关联失败:", error);
        }
    }
};

const handleAddGrammar = async (row: GrammarPoint) => {
    if (!currentSentence.value) return;

    try {
        const res = await addSentenceGrammarApi(
            currentSentence.value.id,
            row.id,
        );

        if (!isSuccessResponse(res)) {
            return;
        }

        ElMessage.success(`已关联语法：${row.title}`);

        await Promise.all([
            fetchCurrentSentenceDetail(),
            fetchGrammarOptions(),
        ]);
    } catch (error) {
        console.error("关联语法失败:", error);
    }
};

const handleRemoveGrammar = async (row: GrammarPoint) => {
    if (!currentSentence.value) return;

    try {
        await ElMessageBox.confirm(
            `确定要移除语法「${row.title}」的关联吗？`,
            "移除确认",
            {
                confirmButtonText: "确定移除",
                cancelButtonText: "取消",
                type: "warning",
            },
        );

        const res = await removeSentenceGrammarApi(
            currentSentence.value.id,
            row.id,
        );

        if (!isSuccessResponse(res)) {
            return;
        }

        ElMessage.success(`已移除语法：${row.title}`);

        await Promise.all([
            fetchCurrentSentenceDetail(),
            fetchGrammarOptions(),
        ]);
    } catch (error) {
        if (error !== "cancel") {
            console.error("移除语法关联失败:", error);
        }
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
            await fetchSentenceList();
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
            `确定要删除 SID「${row.id}」这条句子吗？`,
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
        await fetchSentenceList();
    } catch (error) {
        if (error !== "cancel") {
            console.error("删除句子失败:", error);
        }
    }
};

const formatDate = (value?: string) => {
    if (!value) return "-";

    return value.replace("T", " ").slice(0, 19);
};

onMounted(() => {
    if (!articleId || Number.isNaN(articleId)) {
        ElMessage.error("AID 无效");
        router.replace("/articles");
        return;
    }

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
    align-items: center;
    gap: 10px;
}

.relation-sentence-box {
    padding: 12px 14px;
    margin-bottom: 16px;
    line-height: 1.8;
    font-size: 14px;
    color: #374151;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
}

.relation-search-form {
    margin-bottom: 12px;
}

.relation-section {
    margin-top: 16px;
}

.relation-section-title {
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 700;
    color: #1f2937;
}

.related-table {
    margin-bottom: 12px;
}
</style>