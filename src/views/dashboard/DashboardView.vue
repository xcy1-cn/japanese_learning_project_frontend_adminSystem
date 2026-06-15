<template>
    <div class="dashboard-page">
        <div class="dashboard-header">
            <div>
                <div class="page-title">控制台</div>
                <div class="page-desc">
                    Japanese Learning Admin 数据概览
                </div>
            </div>

            <el-button type="primary" :loading="loading" @click="fetchDashboardData">
                刷新数据
            </el-button>
        </div>

        <el-row :gutter="16" class="stat-row">
            <el-col v-for="item in statCards" :key="item.key" :xs="24" :sm="12" :md="8" :lg="4" :xl="4">
                <el-card class="stat-card" shadow="hover">
                    <div class="stat-label">{{ item.label }}</div>
                    <div class="stat-value">{{ item.value }}</div>
                    <div class="stat-desc">{{ item.desc }}</div>
                </el-card>
            </el-col>
        </el-row>

        <el-card class="chart-card" shadow="never">
            <template #header>
                <div class="chart-header">
                    <div>
                        <div class="chart-title">内容数量统计</div>
                        <div class="chart-desc">
                            文章、句子、词汇、语法点、题目的数据量对比
                        </div>
                    </div>
                </div>
            </template>

            <div v-loading="loading" class="chart-wrapper">
                <VChart class="chart" :option="chartOption" autoresize />
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import VChart from "vue-echarts";
import { use } from "echarts/core";
import { BarChart, PieChart } from "echarts/charts";
import {
    GridComponent,
    LegendComponent,
    TooltipComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { getDashboardCountsApi } from "@/api/dashboard";

use([
    BarChart,
    PieChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    CanvasRenderer,
]);

const loading = ref(false);

const counts = ref({
    articleCount: 0,
    sentenceCount: 0,
    vocabularyCount: 0,
    grammarCount: 0,
    questionCount: 0,
});

const statCards = computed(() => {
    return [
        {
            key: "article",
            label: "文章数量",
            value: counts.value.articleCount,
            desc: "Articles",
        },
        {
            key: "sentence",
            label: "句子数量",
            value: counts.value.sentenceCount,
            desc: "Sentences",
        },
        {
            key: "vocabulary",
            label: "词汇数量",
            value: counts.value.vocabularyCount,
            desc: "Vocabularies",
        },
        {
            key: "grammar",
            label: "语法点数量",
            value: counts.value.grammarCount,
            desc: "Grammar Points",
        },
        {
            key: "question",
            label: "题目数量",
            value: counts.value.questionCount,
            desc: "Questions",
        },
    ];
});

const chartOption = computed(() => {
    return {
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "shadow",
            },
        },
        grid: {
            top: 30,
            right: 24,
            bottom: 40,
            left: 50,
        },
        xAxis: {
            type: "category",
            data: ["文章", "句子", "词汇", "语法点", "题目"],
            axisTick: {
                alignWithLabel: true,
            },
        },
        yAxis: {
            type: "value",
            minInterval: 1,
        },
        series: [
            {
                name: "数量",
                type: "bar",
                barWidth: "42%",
                data: [
                    counts.value.articleCount,
                    counts.value.sentenceCount,
                    counts.value.vocabularyCount,
                    counts.value.grammarCount,
                    counts.value.questionCount,
                ],
                label: {
                    show: true,
                    position: "top",
                },
            },
        ],
    };
});

const fetchDashboardData = async () => {
    try {
        loading.value = true;

        counts.value = await getDashboardCountsApi();
    } catch (error) {
        console.error("获取 Dashboard 数据失败:", error);
        ElMessage.error("获取 Dashboard 数据失败，请检查后端服务");
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchDashboardData();
});
</script>

<style scoped lang="scss">
.dashboard-page {
    padding: 20px;
}

.dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.page-title {
    font-size: 24px;
    font-weight: 800;
    color: #1f2937;
}

.page-desc {
    margin-top: 6px;
    font-size: 14px;
    color: #6b7280;
}

.stat-row {
    margin-bottom: 20px;
}

.stat-card {
    margin-bottom: 16px;
    border-radius: 12px;
}

.stat-label {
    font-size: 14px;
    color: #6b7280;
}

.stat-value {
    margin-top: 12px;
    font-size: 32px;
    font-weight: 800;
    color: #111827;
}

.stat-desc {
    margin-top: 8px;
    font-size: 12px;
    color: #9ca3af;
}

.chart-card {
    border-radius: 12px;
}

.chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.chart-title {
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
}

.chart-desc {
    margin-top: 4px;
    font-size: 13px;
    color: #6b7280;
}

.chart-wrapper {
    width: 100%;
    height: 380px;
}

.chart {
    width: 100%;
    height: 100%;
}
</style>