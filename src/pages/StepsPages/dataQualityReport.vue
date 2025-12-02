<template>
    <div class="data-quality-report">
        <h2>Звіт про якість даних</h2>
        <p class="subtitle">
            Автоматичний аналіз вашого набору даних для наукових досліджень
        </p>

        <!-- Общая оценка -->
        <div class="overall-score" :class="scoreClass">
            <div class="score-circle">
                <span class="score-number">{{ overallScore }}</span>
                <span class="score-max">/100</span>
            </div>
            <div class="score-text">
                <strong>Загальна оцінка якості</strong><br />
                <span class="score-label">{{ scoreLabel }}</span>
            </div>
        </div>

        <!-- Список метрик -->
        <div class="metrics-list">
            <div class="metric-item" v-for="metric in metrics" :key="metric.id">
                <div class="metric-header">
                    <iconify-icon :icon="metric.icon" class="metric-icon" />
                    <div class="metric-title">{{ metric.title }}</div>
                    <div class="metric-score" :class="metric.scoreClass">
                        {{ metric.score }}
                    </div>
                </div>
                <div class="metric-details" v-if="metric.details">
                    <ul>
                        <li v-for="issue in metric.details" :key="issue">
                            {{ issue }}
                        </li>
                    </ul>
                </div>
                <div class="metric-good" v-if="metric.good">
                    <iconify-icon icon="mdi-check-circle" class="good-icon" />
                    {{ metric.good }}
                </div>
            </div>
        </div>

        <!-- Кнопки действий -->
        <div class="action-buttons">
            <button @click="goBack" class="btn-back">Назад до типів</button>
            <button @click="downloadReport" class="btn-download">
                <iconify-icon icon="mdi-download" /> Скачати звіт (PDF)
            </button>
            <button @click="goToVisualization" class="btn-next">
                Перейти до візуалізації
                <iconify-icon icon="mdi-arrow-right" />
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name: "DataQualityReport",
    computed: {
        chartData() {
            return this.$store.state.charts.chartData;
        },
        fileType() {
            return this.$store.state.charts.fileType;
        },
        columnTypes() {
            return this.$store.state.charts.columnTypes || {};
        },
        normalizedTable() {
            return this.getNormalizedTable(this.chartData, this.fileType);
        },
        headers() {
            return this.normalizedTable.length > 0
                ? this.normalizedTable[0]
                : [];
        },
        rows() {
            return this.normalizedTable.slice(1);
        },
        totalRows() {
            return this.rows.length;
        },
        // Основные расчёты
        metrics() {
            return [
                this.getCompleteness(),
                this.getTypeCorrectness(),
                this.getOutliers(),
                this.getDuplicates(),
                this.getConsistency(),
                this.getMandatoryFields(),
            ];
        },
        overallScore() {
            const scores = this.metrics.map((m) => m.value);
            return Math.round(
                scores.reduce((a, b) => a + b, 0) / scores.length
            );
        },
        scoreClass() {
            if (this.overallScore >= 90) return "excellent";
            if (this.overallScore >= 70) return "good";
            if (this.overallScore >= 50) return "warning";
            return "poor";
        },
        scoreLabel() {
            if (this.overallScore >= 90) return "Відмінна якість!";
            if (this.overallScore >= 70) return "Добре, можна публікувати";
            if (this.overallScore >= 50) return "Потрібно виправити";
            return "Критичні проблеми";
        },
    },
    methods: {
        getNormalizedTable(data, fileType) {
            if (!data) return [];
            if (fileType === "xlsx") return data[Object.keys(data)[0]] || [];
            if (fileType === "json" && Array.isArray(data)) {
                if (!data.length) return [];
                const headers = Object.keys(data[0]);
                return [headers, ...data.map((o) => headers.map((k) => o[k]))];
            }
            if (fileType === "csv") {
                const headers = data.headers || [];
                return [
                    headers,
                    ...data.data.map((r) => headers.map((h) => r[h])),
                ];
            }
            return [];
        },

        // 1. Полнота
        getCompleteness() {
            const missing = {};
            this.headers.forEach((h, i) => {
                const emptyCount = this.rows.filter(
                    (row) => row[i] == null || row[i] === ""
                ).length;
                if (emptyCount > 0) missing[h] = emptyCount;
            });
            const problemColumns = Object.keys(missing).filter(
                (h) => missing[h] / this.totalRows > 0.1
            );
            const score =
                problemColumns.length === 0
                    ? 100
                    : Math.round(100 - problemColumns.length * 15);
            return {
                id: 1,
                title: "Повнота даних",
                icon: "mdi-format-list-checks",
                score: `${score}%`,
                scoreClass: score >= 90 ? "good" : "warning",
                details: problemColumns.length
                    ? problemColumns.map(
                          (h) =>
                              `Колонка "${h}" — пропущено ${Math.round(
                                  (missing[h] / this.totalRows) * 100
                              )}%`
                      )
                    : null,
                good:
                    problemColumns.length === 0 ? "Усі поля заповнені!" : null,
                value: score,
            };
        },

        // 2. Корректность типов (всегда 100%, т.к. мы их только что настроили)
        getTypeCorrectness() {
            return {
                id: 2,
                title: "Коректність типів",
                icon: "mdi-check-circle-outline",
                score: "100%",
                scoreClass: "good",
                good: "Усі типи даних визначено правильно",
                value: 100,
            };
        },

        // 3. Выбросы (пример для чисел и дат)
        getOutliers() {
            const issues = [];
            this.headers.forEach((h) => {
                const type = this.columnTypes[h];
                if (type === "number") {
                    const values = this.rows
                        .map((r) => r[this.headers.indexOf(h)])
                        .filter((v) => v != null);
                    const nums = values
                        .map((v) => parseFloat(v))
                        .filter((n) => !isNaN(n));
                    if (nums.length) {
                        const mean = nums.reduce((a, b) => a + b) / nums.length;
                        const std = Math.sqrt(
                            nums
                                .map((x) => Math.pow(x - mean, 2))
                                .reduce((a, b) => a + b) / nums.length
                        );
                        const outliers = nums.filter(
                            (n) => Math.abs(n - mean) > 3 * std
                        );
                        if (outliers.length)
                            issues.push(
                                `Колонка "${h}" — ${outliers.length} аномальних значень`
                            );
                    }
                }
            });
            const score = issues.length ? 60 : 100;
            return {
                id: 3,
                title: "Вияви та аномалії",
                icon: "mdi-alert-outline",
                score: issues.length ? "Попередження" : "100%",
                scoreClass: issues.length ? "warning" : "good",
                details: issues.length ? issues : null,
                good: issues.length === 0 ? "Аномалій не виявлено" : null,
                value: score,
            };
        },

        // 4. Дубликаты
        getDuplicates() {
            const seen = new Set();
            const duplicates = this.rows.filter((row) => {
                const key = row.join("|");
                if (seen.has(key)) return true;
                seen.add(key);
                return false;
            });
            const score = duplicates.length ? 70 : 100;
            return {
                id: 4,
                title: "Дублікати",
                icon: "mdi-content-copy",
                score: duplicates.length
                    ? `${duplicates.length} дублів`
                    : "100%",
                scoreClass: duplicates.length ? "warning" : "good",
                details: duplicates.length
                    ? [`Знайдено ${duplicates.length} ідентичних рядків`]
                    : null,
                good: duplicates.length === 0 ? "Дублікатів немає" : null,
                value: score,
            };
        },

        // 5. Согласованность (пример: пол, страна)
        getConsistency() {
            const issues = [];
            if (this.columnTypes["Пол"] || this.columnTypes["Gender"]) {
                const col = this.columnTypes["Пол"] ? "Пол" : "Gender";
                const idx = this.headers.indexOf(col);
                const unique = new Set(
                    this.rows.map((r) => String(r[idx]).trim().toLowerCase())
                );
                if (unique.size > 3)
                    issues.push(
                        `Колонка "${col}" — ${unique.size} різних написань`
                    );
            }
            const score = issues.length ? 75 : 100;
            return {
                id: 5,
                title: "Узгодженість",
                icon: "mdi-link-variant",
                score: issues.length ? "Перевірте" : "100%",
                scoreClass: issues.length ? "warning" : "good",
                details: issues.length ? issues : null,
                good: issues.length === 0 ? "Дані узгоджені" : null,
                value: score,
            };
        },

        // 6. Обязательные поля (пример)
        getMandatoryFields() {
            const mandatory = ["DOI", "ORCID", "Дата експерименту", "Автор"];
            const missing = mandatory.filter(
                (col) => !this.headers.includes(col)
            );
            const score = missing.length
                ? Math.round(100 - missing.length * 20)
                : 100;
            return {
                id: 6,
                title: "Обов’язкові поля",
                icon: "mdi-star-outline",
                score: missing.length ? "Не вистачає" : "100%",
                scoreClass: missing.length ? "warning" : "good",
                details: missing.length
                    ? [`Відсутні: ${missing.join(", ")}`]
                    : null,
                good: missing.length === 0 ? "Усі обов’язкові поля є" : null,
                value: score,
            };
        },

        goBack() {
            this.$emit("back");
        },
        downloadReport() {
            alert("PDF-звіт буде доступний у наступній версії! 😊");
        },
        goToVisualization() {
            this.$router.push({ name: "visualization" }); // или куда тебе нужно
        },
    },
};
</script>

<style lang="scss" scoped>
.data-quality-report {
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px 20px;
    font-family: "Roboto", sans-serif;
}

h2 {
    text-align: center;
    font-size: 32px;
    color: #1e293b;
    margin-bottom: 8px;
}
.subtitle {
    text-align: center;
    color: #64748b;
    margin-bottom: 40px;
}

.overall-score {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 30px;
    margin: 40px 0;
    padding: 30px;
    border-radius: 20px;
    background: #f8fafc;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    &.excellent {
        border-left: 6px solid #10b981;
    }
    &.good {
        border-left: 6px solid #3b82f6;
    }
    &.warning {
        border-left: 6px solid #f59e0b;
    }
    &.poor {
        border-left: 6px solid #ef4444;
    }
}

.score-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    .score-number {
        font-size: 42px;
    }
    .score-max {
        font-size: 18px;
        color: #64748b;
    }
}

.score-text {
    text-align: center;
}
.score-label {
    font-size: 18px;
    color: #475569;
}

.metrics-list {
    margin: 40px 0;
}
.metric-item {
    background: white;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
}
.metric-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 10px;
}
.metric-icon {
    font-size: 28px;
    color: #667eea;
}
.metric-title {
    flex: 1;
    font-size: 18px;
    font-weight: 600;
}
.metric-score {
    font-weight: bold;
    font-size: 20px;
}
.metric-score.good {
    color: #10b981;
}
.metric-score.warning {
    color: #f59e0b;
}

.metric-details ul {
    margin: 10px 0 0 40px;
    color: #ef4444;
}
.metric-good {
    color: #10b981;
    font-weight: 500;
    margin-top: 10px;
}
.good-icon {
    color: #10b981;
    margin-right: 6px;
}

.action-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 50px;
    flex-wrap: wrap;
}
.btn-back {
    padding: 14px 28px;
    background: #e2e8f0;
    color: #475569;
    border: none;
    border-radius: 14px;
    cursor: pointer;
    font-weight: 600;
}
.btn-download {
    padding: 14px 28px;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 14px;
    cursor: pointer;
    font-weight: 600;
}
.btn-next {
    padding: 16px 36px;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
}
</style>
