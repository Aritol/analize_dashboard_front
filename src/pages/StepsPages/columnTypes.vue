<template>
    <div class="column-settings">
        <h2>Налаштування колонок</h2>
        <p class="subtitle">Натисніть на тип даних, щоб змінити</p>

        <div class="columns-list">
            <div
                v-for="(header, index) in headers"
                :key="header"
                class="column-row"
                :class="{ ignored: columnTypes[header] === 'ignore' }"
            >
                <!-- Название колонки + примеры -->
                <div class="column-info">
                    <div class="header-name">{{ header }}</div>
                    <div class="samples" v-if="sampleValues[header]?.length">
                        {{ sampleValues[header].slice(0, 4).join(" • ") }}
                        <span v-if="sampleValues[header].length > 4"
                            >• ...</span
                        >
                    </div>
                </div>

                <!-- Кастомный выпадающий список -->
                <div class="dropdown-wrapper">
                    <div
                        class="selected-option"
                        @click="toggleDropdown(header)"
                    >
                        <!-- <Icon
                            :icon="
                                types[columnTypes[header]]?.icon ||
                                'mdi-help-circle-outline'
                            "
                            class="type-icon"
                        /> -->
                        <span>{{
                            types[columnTypes[header]]?.label || ""
                        }}</span>
                        <Icon
                            icon="mdi-chevron-down"
                            class="arrow"
                            :class="{ open: openDropdown === header }"
                        />
                    </div>

                    <transition name="fade">
                        <div
                            v-if="openDropdown === header"
                            class="dropdown-menu"
                        >
                            <div
                                v-for="(item, value) in types"
                                :key="value"
                                class="dropdown-item"
                                @click="setType(header, value)"
                            >
                                <Icon
                                    :icon="item.icon"
                                    :style="{ color: item.color }"
                                />
                                <span>{{ item.label }}</span>
                                <Icon
                                    v-if="columnTypes[header] === value"
                                    icon="mdi-check"
                                    class="check"
                                />
                            </div>
                        </div>
                    </transition>
                </div>

                <!-- Разделитель (кроме последней строки) -->
                <hr v-if="index < headers.length - 1" class="divider" />
            </div>
        </div>
    </div>
</template>

<script>
import { Icon } from "@iconify/vue";
export default {
    name: "ColumnSettings",
    components: {
        Icon,
    },

    data() {
        return {
            openDropdown: null, // открытый дропдаун (имя колонки)
        };
    },

    computed: {
        // Данные из Vuex
        chartData() {
            return this.$store.state.charts.chartData;
        },
        fileType() {
            return this.$store.state.charts.fileType;
        },
        columnTypes: {
            get() {
                return this.$store.state.charts.columnTypes || {};
            },
            set(value) {
                console.log("value");
                console.log(value);

                this.$store.dispatch("charts/setColumnTypesAction", value);
            },
        },

        // Заголовки колонок
        headers() {
            const table = this.normalizedTable;
            return table.length > 0 ? table[0] : [];
        },

        // Нормализованная таблица
        normalizedTable() {
            return this.getNormalizedTable(this.chartData, this.fileType);
        },

        // Примеры значений
        sampleValues() {
            const table = this.normalizedTable;
            if (table.length < 2) return {};
            const result = {};
            table.slice(1, 20).forEach((row) => {
                this.headers.forEach((h, i) => {
                    if (!result[h]) result[h] = [];
                    const val = row[i];
                    if (val != null && val !== "")
                        result[h].push(String(val).trim());
                });
            });
            return result;
        },

        // Все доступные типы
        types() {
            return {
                number: {
                    label: "Числовий",
                    icon: "mdi-pound",
                    color: "#3b82f6",
                },
                currency: {
                    label: "Грошовий",
                    icon: "mdi-currency-usd",
                    color: "#10b981",
                },
                date: { label: "Дата", icon: "mdi-calendar", color: "#f59e0b" },
                datetime: {
                    label: "Дата та час",
                    icon: "mdi-calendar-clock",
                    color: "#f97316",
                },
                boolean: {
                    label: "Так / Ні",
                    icon: "mdi-toggle-switch",
                    color: "#8b5cf6",
                },
                email: { label: "Email", icon: "mdi-email", color: "#ec4899" },
                phone: {
                    label: "Телефон",
                    icon: "mdi-phone",
                    color: "#14b8a6",
                },
                url: { label: "Посилання", icon: "mdi-link", color: "#0ea5e9" },
                text: {
                    label: "Текст",
                    icon: "mdi-format-text",
                    color: "#64748b",
                },
                ignore: {
                    label: "Ігнорувати",
                    icon: "mdi-eye-off",
                    color: "#ef4444",
                },
            };
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

        toggleDropdown(header) {
            console.log("toggleDropdown");

            this.openDropdown = this.openDropdown === header ? null : header;
        },

        setType(header, type) {
            this.columnTypes = { ...this.columnTypes, [header]: type };
            this.openDropdown = null;
        },
    },

    mounted() {
        // Автоопределение типов
        if (Object.keys(this.columnTypes).length === 0 && this.headers.length) {
            const detected = {};
            this.headers.forEach((header) => {
                const vals = this.sampleValues[header] || [];
                if (vals.length === 0) {
                    detected[header] = "text";
                    return;
                }

                if (vals.every((v) => !isNaN(v) && v !== ""))
                    detected[header] = "number";
                else if (vals.some((v) => /[₴$€£]/.test(v)))
                    detected[header] = "currency";
                else if (vals.every((v) => !isNaN(Date.parse(v)))) {
                    detected[header] = vals.some((v) =>
                        / \d{1,2}:\d{2}/.test(v)
                    )
                        ? "datetime"
                        : "date";
                } else if (
                    vals.every((v) =>
                        /^(true|false|1|0|так|ні|yes|no)$/i.test(v)
                    )
                )
                    detected[header] = "boolean";
                else if (
                    vals.every((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
                )
                    detected[header] = "email";
                else if (
                    vals.every((v) =>
                        // eslint-disable-next-line no-useless-escape
                        /^[\+()0-9\s-]{10,}$/.test(v.replace(/\s/g, ""))
                    )
                )
                    detected[header] = "phone";
                else if (vals.every((v) => /^https?:\/\//i.test(v)))
                    detected[header] = "url";
                else detected[header] = "text";
            });
            this.columnTypes = detected;
        }

        // Закрытие при клике вне
        // document.addEventListener("click", () => {
        //     console.log("hre");

        //     // this.openDropdown = null;
        // });
    },

    beforeUnmount() {
        document.removeEventListener("click", () => {});
    },
};
</script>

<style lang="scss" scoped>
/* Весь CSS из предыдущего сообщения — оставляем 100% без изменений */
.column-settings {
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px 20px;
}
h2 {
    text-align: center;
    font-size: 30px;
    color: #1e293b;
    margin-bottom: 8px;
}
.subtitle {
    text-align: center;
    color: #64748b;
    margin-bottom: 50px;
}

.columns-list {
    background: white;
    border-radius: 20px;
    // overflow: hidden;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
}

.column-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 32px;
    transition: background 0.2s;
    &:hover {
        background: #f8fafc;
    }
    &.ignored {
        opacity: 0.6;
        background: #fefbfb;
    }
}

.column-info {
    flex: 1;
    .header-name {
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 6px;
    }
    .samples {
        font-size: 14px;
        color: #64748b;
    }
}

.dropdown-wrapper {
    position: relative;
}

.selected-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    background: #f1f5f9;
    border-radius: 16px;
    cursor: pointer;
    min-width: 220px;
    transition: all 0.2s;
    &:hover {
        background: #e2e8f0;
    }
    .type-icon {
        font-size: 20px;
    }
    .arrow {
        margin-left: auto;
        transition: transform 0.25s;
        font-size: 24px;
        color: #94a3b8;
    }
    .arrow.open {
        transform: rotate(180deg);
    }
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    margin-top: 8px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
    z-index: 100;
    overflow: hidden;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px;
    cursor: pointer;
    transition: background 0.2s;
    border-bottom: 1px solid #f1f5f9;
    &:hover {
        background: #eef2ff;
    }
    &:last-child {
        border-bottom: none;
    }
    .check {
        margin-left: auto;
        color: #667eea;
        font-weight: bold;
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

.divider {
    margin: 0;
    border: none;
    border-top: 1px solid #e2e8f0;
}
</style>
