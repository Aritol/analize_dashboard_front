<template>
    <div class="data-quality-report">
        <h2>Звіт про якість даних</h2>
        <p class="subtitle">
            Автоматичний аналіз вашого набору даних для наукових досліджень
        </p>

        <!-- Загальна оцінка -->
        <div class="overall-score" :class="scoreClass">
            <div class="score-circle">
                <span class="score-number">{{ overallScore }}</span>
                <span class="score-max">/100</span>
            </div>
            <div class="score-text">
                <strong>Загальна оцінка якості</strong><br />
                <!-- <span class="score-label">{{ scoreLabel }}</span> -->
            </div>
        </div>

        <!-- Метрики -->
        <div class="metrics-list">
            <div class="metric-item" v-for="metric in metrics" :key="metric.id">
                <div class="metric-header">
                    <Icon :icon="metric.icon" class="metric-icon" />
                    <div class="metric-title">{{ metric.title }}</div>
                    <div class="metric-score" :class="metric.scoreClass">
                        {{ metric.displayScore }}
                    </div>
                </div>

                <div
                    v-if="metric.issues && metric.issues.length"
                    class="metric-details"
                >
                    <ul>
                        <li
                            v-for="issue in metric.issues.slice(0, 3)"
                            :key="issue"
                        >
                            {{ issue }}
                        </li>
                        <li
                            v-if="
                                metric.issues.length > 3 &&
                                metric.issues.length > 0
                            "
                            class="show-all-issues-btn subtle"
                            @click="showProblematicRows(metric)"
                        >
                            ...і ще {{ metric.issues.length - 3 }} проблем
                        </li>
                    </ul>
                </div>

                <div v-if="metric.good" class="metric-good">
                    <Icon icon="mdi-check-circle" class="good-icon" />
                    {{ metric.good }}
                </div>
            </div>
        </div>

        <!-- Кнопки -->
        <div class="action-buttons">
            <button @click="goBack" class="btn-back">Назад до типів</button>
            <button @click="downloadReport" class="btn-download">
                <Icon icon="mdi-download" /> Скачати звіт (PDF)
            </button>
        </div>
    </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
    name: "DataQualityReport",
    components: { Icon },

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
            if (!this.chartData) return [];
            if (this.fileType === "xlsx")
                return this.chartData[Object.keys(this.chartData)[0]] || [];
            if (this.fileType === "json" && Array.isArray(this.chartData)) {
                if (!this.chartData.length) return [];
                const headers = Object.keys(this.chartData[0]);
                return [
                    headers,
                    ...this.chartData.map((o) => headers.map((k) => o[k])),
                ];
            }
            if (this.fileType === "csv") {
                const headers = this.chartData.headers || [];
                return [
                    headers,
                    ...this.chartData.data.map((r) => headers.map((h) => r[h])),
                ];
            }
            return [];
        },

        headers() {
            return this.normalizedTable[0] || [];
        },
        rows() {
            return this.normalizedTable.slice(1);
        },
        totalRows() {
            return this.rows.length;
        },

        // Основні метрики
        metrics() {
            return [
                this.checkCompleteness(),
                this.checkValidity(),
                this.checkOutliers(),
                this.checkDuplicates(),
                this.checkConsistency(),
                this.checkMandatoryFields(),
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
        showProblematicRows(metric) {
            console.log(metric);

            const highlighted = this.collectProblematicRows(metric);

            // this.$store.dispatch("charts/setHighlightedRows", {
            //     metric,
            //     rows: highlightedRows,
            // });

            this.$store.dispatch("charts/setCurrentMetric", metric);
            this.$store.dispatch("charts/setHighlightedRows", highlighted);

            this.$router.push({ name: "problematicRows" });
        },

        // collectProblematicRows(metric) {
        //     // if (metric.id === 2) {
        //     // }
        //     //
        // },
        checkCompleteness() {
            const issues = [];
            let totalCells = 0;
            let missingCells = 0;

            this.headers.forEach((header, i) => {
                if (this.columnTypes[header] === "ignore") return;

                const empty = this.rows.filter((row) => {
                    const val = row[i];
                    return val == null || val === "" || val === undefined;
                }).length;

                totalCells += this.totalRows;
                missingCells += empty;

                const percent = this.totalRows
                    ? Math.round((empty / this.totalRows) * 100)
                    : 0;
                if (percent > 10) {
                    issues.push(
                        `Колонка "${header}" — ${percent}% пропущених значень`
                    );
                }
            });

            const score =
                totalCells === 0
                    ? 100
                    : Math.round((1 - missingCells / totalCells) * 100);

            return {
                id: 1,
                title: "Повнота даних",
                icon: "mdi-format-list-checks",
                displayScore: `${score}%`,
                scoreClass: score >= 90 ? "good" : "warning",
                issues: issues.length ? issues : null,
                good: issues.length === 0 ? "Усі важливі поля заповнені" : null,
                value: score,
            };
        },

        checkValidity() {
            const issues = [];

            this.headers.forEach((header, i) => {
                if (this.columnTypes[header] === "ignore") return;
                const type = this.columnTypes[header];

                this.rows.forEach((row, rowIdx) => {
                    const val = row[i];

                    if (type === "number" || type === "currency") {
                        if (val !== "" && isNaN(parseFloat(val))) {
                            issues.push(
                                `"${header}" (рядок ${rowIdx + 2}): не є числом`
                            );
                        }
                    }
                    if (
                        (type === "date" || type === "datetime") &&
                        val &&
                        isNaN(Date.parse(val))
                    ) {
                        issues.push(
                            `"${header}" (рядок ${
                                rowIdx + 2
                            }): неправильна дата`
                        );
                    }
                    if (
                        type === "email" &&
                        val &&
                        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
                    ) {
                        issues.push(
                            `"${header}" (рядок ${
                                rowIdx + 2
                            }): некоректний email`
                        );
                    }
                });
            });

            const score =
                issues.length === 0 ? 100 : issues.length <= 5 ? 85 : 60;

            return {
                id: 2,
                title: "Валідність значень",
                icon: "mdi-shield-check-outline",
                displayScore: issues.length === 0 ? "100%" : "Є помилки",
                scoreClass: issues.length === 0 ? "good" : "warning",
                issues: issues.length ? issues : null,
                good: issues.length === 0 ? "Усі значення валідні" : null,
                value: score,
            };
        },

        checkOutliers() {
            const issues = [];

            this.headers.forEach((header, i) => {
                if (!["number", "currency"].includes(this.columnTypes[header]))
                    return;

                const values = this.rows
                    .map((r) => parseFloat(r[i]))
                    .filter((v) => !isNaN(v));

                if (values.length < 4) return;

                const sorted = [...values].sort((a, b) => a - b);
                const q1 = sorted[Math.floor(sorted.length * 0.25)];
                const q3 = sorted[Math.floor(sorted.length * 0.75)];
                const iqr = q3 - q1;
                const lower = q1 - 1.5 * iqr;
                const upper = q3 + 1.5 * iqr;

                const outliers = values.filter((v) => v < lower || v > upper);
                if (outliers.length > 0) {
                    issues.push(
                        `Колонка "${header}" — ${outliers.length} аномалій`
                    );
                }
            });

            const score = issues.length === 0 ? 100 : 70;

            return {
                id: 3,
                title: "Виявиті аномалії",
                icon: "mdi-alert-outline",
                displayScore: issues.length === 0 ? "100%" : "Знайдено",
                scoreClass: issues.length === 0 ? "good" : "warning",
                issues: issues.length ? issues : null,
                good: issues.length === 0 ? "Аномалій не виявлено" : null,
                value: score,
            };
        },

        checkDuplicates() {
            const seen = new Set();
            const duplicates = [];

            this.rows.forEach((row, idx) => {
                const key = row.join("|");
                if (seen.has(key)) duplicates.push(idx + 1);
                seen.add(key);
            });

            const score = duplicates.length === 0 ? 100 : 60;

            return {
                id: 4,
                title: "Дублікати рядків",
                icon: "mdi-content-copy",
                displayScore:
                    duplicates.length === 0
                        ? "100%"
                        : `${duplicates.length} дублів`,
                scoreClass: duplicates.length === 0 ? "good" : "warning",
                issues: duplicates.length
                    ? [`Знайдено дублікатів у рядках: ${duplicates.join(", ")}`]
                    : null,
                good: duplicates.length === 0 ? "Дублікатів немає" : null,
                value: score,
            };
        },

        checkConsistency() {
            const genderCols = this.headers.filter((h) =>
                ["Пол", "Gender", "Стать", "Sex"].some((k) =>
                    h.toLowerCase().includes(k.toLowerCase())
                )
            );

            const issues = [];
            genderCols.forEach((col) => {
                const idx = this.headers.indexOf(col);
                const unique = new Set(
                    this.rows
                        .map((r) => String(r[idx]).trim().toLowerCase())
                        .filter((v) => v)
                );
                if (unique.size > 4) {
                    issues.push(
                        `Колонка "${col}" — ${unique.size} різних варіантів написання`
                    );
                }
            });

            const score = issues.length === 0 ? 100 : 75;

            return {
                id: 5,
                title: "Узгодженість даних",
                icon: "mdi-link-variant",
                displayScore: issues.length === 0 ? "100%" : "Перевірте",
                scoreClass: issues.length === 0 ? "good" : "warning",
                issues: issues.length ? issues : null,
                good: issues.length === 0 ? "Дані узгоджені" : null,
                value: score,
            };
        },

        checkMandatoryFields() {
            const mandatoryGroups = {
                DOI: ["doi"],
                ORCID: ["orcid"],
                "Дата експерименту": [
                    "date",
                    "experiment",
                    "collection",
                    "sampling",
                ],
                Автор: ["author", "creator", "investigator", "автор"],
                "Назва дослідження": ["title", "study", "project", "назва"],
            };

            const missing = [];
            Object.entries(mandatoryGroups).forEach(([name, keywords]) => {
                const exists = this.headers.some((h) => {
                    if (this.columnTypes[h] === "ignore") return false;
                    return keywords.some((k) =>
                        h.toLowerCase().includes(k.toLowerCase())
                    );
                });
                if (!exists) missing.push(name);
            });

            const score = Math.round(
                ((Object.keys(mandatoryGroups).length - missing.length) /
                    Object.keys(mandatoryGroups).length) *
                    100
            );

            return {
                id: 6,
                title: "Обов’язкові поля",
                icon: "mdi-star-outline",
                displayScore: missing.length === 0 ? "100%" : "Не вистачає",
                scoreClass: missing.length === 0 ? "good" : "warning",
                issues: missing.length
                    ? [`Відсутні: ${missing.join(", ")}`]
                    : null,
                good: missing.length === 0 ? "Усі критичні поля є" : null,
                value: score,
            };
        },

        goBack() {
            this.$emit("back");
        },
        downloadReport() {
            alert("PDF-звіт буде доступний у наступній версії!");
        },
    },
};
</script>

<style lang="scss" scoped>
/* Той самий стиль, що був у тебе — залишаю без змін */
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
        border: 3px solid #10b981;
    }
    &.good {
        border: 3px solid #3b82f6;
    }
    &.warning {
        border: 3px solid #f59e0b;
    }
    &.poor {
        border: 3px solid #ef4444;
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
.score-text strong {
    font-size: 20px;
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
    margin-left: 40px;
    display: flex;
    align-items: center;
    gap: 6px;
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
    display: flex;
    align-items: center;
    gap: 8px;
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

.show-all-issues-btn {
    margin-top: 12px;
    padding: 10px 16px;
    background: #ef4444;
    color: white;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
    font-size: 15px;

    .btn-icon {
        font-size: 20px;
    }

    &:hover {
        background: #dc2626;
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
    }

    &.subtle {
        background: #fee2e2;
        color: #991b1b;
        border: 1px dashed #fca5a5;

        &:hover {
            background: #fecaca;
            border-style: solid;
        }
    }
}
</style>
