<template>
    <div class="preview-with-tabs">
        <h2 class="section-title">Попередній перегляд даних</h2>

        <div class="tabs">
            <button
                @click="activeTab = 'table'"
                :class="{ active: activeTab === 'table' }"
                class="tab-btn"
            >
                Таблиця
            </button>
            <button
                @click="activeTab = 'visualization'"
                :class="{ active: activeTab === 'visualization' }"
                class="tab-btn"
            >
                Візуалізація
            </button>
        </div>

        <transition name="fade" mode="out-in">
            <div v-if="activeTab === 'table'" key="table">
                <data-preview-table />
            </div>

            <div v-else key="visualization" class="visualization-tab">
                <data-visualization-preview />
            </div>
        </transition>
    </div>
</template>

<script>
import DataPreviewTable from "./dataPreview/tablePreview.vue";
import DataVisualizationPreview from "./dataPreview/dataVisualizationPreview.vue";

export default {
    name: "DataPreviewWithTabs",
    components: {
        DataPreviewTable,
        DataVisualizationPreview,
    },
    data() {
        return {
            activeTab: "table",
        };
    },
};
</script>

<style lang="scss" scoped>
.preview-with-tabs {
    margin-top: 40px;
    padding: 0 20px;
}

.section-title {
    text-align: center;
    font-size: 32px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 30px;
}

.tabs {
    display: flex;
    justify-content: center;
    gap: 32px;
    margin-bottom: 40px;
    padding-bottom: 12px;
    border-bottom: 2px solid #e2e8f0;
}

.tab-btn {
    padding: 12px 32px;
    font-size: 19px;
    font-weight: 600;
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    position: relative;
    transition: all 0.3s ease;
    border-radius: 12px;

    &.active {
        color: #4f46e5;
        background: rgba(79, 70, 229, 0.08);

        &::after {
            content: "";
            position: absolute;
            bottom: -14px;
            left: 50%;
            transform: translateX(-50%);
            width: 60%;
            height: 4px;
            background: #4f46e5;
            border-radius: 2px;
        }
    }

    &:hover:not(.active) {
        color: #4f46e5;
        background: rgba(79, 70, 229, 0.05);
    }
}

.visualization-tab {
    min-height: 800px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
    padding: 30px;
    margin-top: 20px;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
