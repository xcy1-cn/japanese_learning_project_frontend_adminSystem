<template>
    <div class="import-page">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>Excel 批量导入</span>
                </div>
            </template>

            <el-form label-width="120px">
                <el-form-item label="导入类型">
                    <el-select v-model="importType" placeholder="请选择导入类型" style="width: 260px">
                        <el-option label="词汇 Vocabulary" value="vocabulary" />
                        <el-option label="语法 GrammarPoint" value="grammarPoint" />
                        <el-option label="题目 Question" value="question" />
                    </el-select>
                </el-form-item>

                <el-form-item label="Excel 文件">
                    <el-upload ref="uploadRef" :auto-upload="false" :limit="1" :on-change="handleFileChange"
                        :on-remove="handleFileRemove" accept=".xlsx">
                        <el-button type="primary">选择 Excel 文件</el-button>

                        <template #tip>
                            <div class="upload-tip">
                                仅支持 .xlsx 文件。请确保表头与模板一致。
                            </div>
                        </template>
                    </el-upload>
                </el-form-item>

                <el-form-item>
                    <el-button type="success" :loading="loading" @click="handleImport">
                        开始导入
                    </el-button>

                    <el-button @click="resetResult">
                        清空结果
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <el-card class="template-card">
            <template #header>
                <div class="template-header">
                    <span>模板说明</span>

                    <el-button type="primary" size="small" tag="a" :href="currentTemplateUrl"
                        :download="currentTemplateName">
                        下载当前模板
                    </el-button>
                </div>
            </template>

            <div v-if="importType === 'vocabulary'">
                <p>Vocabulary 表头：</p>
                <el-tag>Word</el-tag>
                <el-tag>Reading</el-tag>
                <el-tag>Meaning</el-tag>
                <el-tag>PartOfSpeech</el-tag>
                <el-tag>Level</el-tag>
            </div>

            <div v-if="importType === 'grammarPoint'">
                <p>GrammarPoint 表头：</p>
                <el-tag>Title</el-tag>
                <el-tag>Explanation</el-tag>
                <el-tag>Structure</el-tag>
                <el-tag>Example</el-tag>
                <el-tag>Level</el-tag>
            </div>

            <div v-if="importType === 'question'">
                <p>Question 表头：</p>
                <el-tag>ArticleId</el-tag>
                <el-tag>SentenceId</el-tag>
                <el-tag>Type</el-tag>
                <el-tag>Stem</el-tag>
                <el-tag>OptionA</el-tag>
                <el-tag>OptionB</el-tag>
                <el-tag>OptionC</el-tag>
                <el-tag>OptionD</el-tag>
                <el-tag>Answer</el-tag>
                <el-tag>Explanation</el-tag>
                <el-tag>Level</el-tag>
            </div>
        </el-card>

        <el-card v-if="result" class="result-card">
            <template #header>
                <span>导入结果</span>
            </template>

            <div class="summary">
                <el-alert :title="`成功导入 ${result.successCount} 条，失败 ${result.failCount} 行`"
                    :type="result.failCount > 0 ? 'warning' : 'success'" show-icon :closable="false" />
            </div>

            <el-table v-if="result.errors.length > 0" :data="result.errors" border
                style="width: 100%; margin-top: 16px">
                <el-table-column prop="rowNumber" label="行号" width="100" />
                <el-table-column prop="field" label="字段" width="180" />
                <el-table-column prop="message" label="错误原因" />
            </el-table>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ElMessage, type UploadFile, type UploadInstance } from "element-plus";
import {
    importVocabulariesApi,
    importGrammarPointsApi,
    importQuestionsApi,
    type ImportResult,
} from "@/api/import.ts";

type ImportType = "vocabulary" | "grammarPoint" | "question";

const importType = ref<ImportType>("vocabulary");
const selectedFile = ref<File | null>(null);
const loading = ref(false);
const result = ref<ImportResult | null>(null);
const uploadRef = ref<UploadInstance>();

const templateMap: Record<ImportType, { url: string; name: string }> = {
    vocabulary: {
        url: "/templates/vocabulary-template.xlsx",
        name: "vocabulary-template.xlsx",
    },
    grammarPoint: {
        url: "/templates/grammar-point-template.xlsx",
        name: "grammar-point-template.xlsx",
    },
    question: {
        url: "/templates/question-template.xlsx",
        name: "question-template.xlsx",
    },
};

const currentTemplateUrl = computed(() => {
    return templateMap[importType.value].url;
});

const currentTemplateName = computed(() => {
    return templateMap[importType.value].name;
});    

const handleFileChange = (uploadFile: UploadFile) => {
    const rawFile = uploadFile.raw;

    if (!rawFile) {
        selectedFile.value = null;
        return;
    }

    if (!rawFile.name.endsWith(".xlsx")) {
        ElMessage.error("只支持 .xlsx 文件");
        uploadRef.value?.clearFiles();
        selectedFile.value = null;
        return;
    }

    selectedFile.value = rawFile;
};

const handleFileRemove = () => {
    selectedFile.value = null;
};

const handleImport = async () => {
    if (!selectedFile.value) {
        ElMessage.warning("请先选择 Excel 文件");
        return;
    }

    loading.value = true;
    result.value = null;

    try {
        let res;

        if (importType.value === "vocabulary") {
            res = await importVocabulariesApi(selectedFile.value);
        } else if (importType.value === "grammarPoint") {
            res = await importGrammarPointsApi(selectedFile.value);
        } else {
            res = await importQuestionsApi(selectedFile.value);
        }

        result.value = res.data;

        if (res.data.failCount > 0) {
            ElMessage.warning("导入完成，但存在失败行");
        } else {
            ElMessage.success("导入成功");
        }
    } catch (error) {
        console.error(error);
        ElMessage.error("导入失败，请检查文件或接口");
    } finally {
        loading.value = false;
    }
};

const resetResult = () => {
    result.value = null;
    selectedFile.value = null;
    uploadRef.value?.clearFiles();
};
</script>

<style scoped>
.import-page {
    padding: 20px;
}

.card-header {
    font-size: 18px;
    font-weight: 700;
}

.upload-tip {
    margin-top: 8px;
    color: #909399;
    font-size: 13px;
}

.template-card,
.result-card {
    margin-top: 20px;
}

.el-tag {
    margin-right: 8px;
    margin-bottom: 8px;
}

.summary {
    margin-bottom: 12px;
}

.template-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>