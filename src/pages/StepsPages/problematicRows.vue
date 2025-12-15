<template>
    <div class="problematic-rows">
        <h2>
            Проблемні рядки: {{ currentMetric?.title || "Завантаження..." }}
        </h2>
        <p class="subtitle">Підсвічено лише ячейки з виявленими проблемами</p>

        <div class="table-wrapper">
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th v-for="header in headers" :key="header">
                                {{ header }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="(row, rowIdx) in highlightedRows"
                            :key="rowIdx"
                        >
                            <td class="row-num">{{ row.originalIndex + 1 }}</td>
                            <td
                                v-for="(cell, colIdx) in row.cells"
                                :key="colIdx"
                                :class="{
                                    highlight:
                                        row.highlightedCells.includes(colIdx),
                                    'highlight-validity':
                                        currentMetric.id === 2,
                                    'highlight-outlier': currentMetric.id === 3,
                                    'highlight-duplicate':
                                        currentMetric.id === 4,
                                }"
                            >
                                {{ cell || "" }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="action-footer">
            <button @click="goBack" class="btn-back">Назад до звіту</button>
        </div>
    </div>
</template>

<script>
export default {
    name: "ProblematicRows",
    computed: {
        currentMetric() {
            return this.$store.getters["charts/currentMetric"];
        },
        highlightedRows() {
            return this.$store.getters["charts/highlightedRows"];
        },
        headers() {
            return this.$store.getters["charts/normalizedHeaders"]; // или твой геттер
        },
    },
    methods: {
        goBack() {
            this.$store.dispatch("charts/clearHighlightedRows");
            this.$router.push({ name: "new-report" });
        },
    },
};
</script>

<style lang="scss" scoped>
.problematic-rows {
    padding: 40px 20px;
    max-width: 95%;
    margin: 0 auto;
}

h2 {
    text-align: center;
    font-size: 32px;
    color: #1e293b;
    margin-bottom: 12px;
}
.subtitle {
    text-align: center;
    color: #64748b;
    margin-bottom: 40px;
}

.table-wrapper {
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.table-container {
    overflow-x: auto;
    max-height: 70vh;
}

table {
    width: 100%;
    min-width: 1200px;
    border-collapse: collapse;
}

th {
    background: #667eea;
    color: white;
    padding: 16px;
    text-align: center;
    position: sticky;
    top: 0;
    z-index: 10;
}

td {
    padding: 12px 16px;
    text-align: center;
    border-bottom: 1px solid #e2e8f0;
}

.row-num {
    font-weight: 600;
    background: #f8fafc;
}

.highlight {
    background: #fee2e2 !important;
    color: #991b1b;
    font-weight: 600;
    animation: pulse 2s infinite;
}

.highlight-validity {
    background: #fecaca !important;
}
.highlight-outlier {
    background: #fef3c7 !important;
    border: 2px solid #f59e0b;
}
.highlight-duplicate {
    background: #dbeefe !important;
    border: 2px dashed #3b82f6;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.7;
    }
}
</style>
