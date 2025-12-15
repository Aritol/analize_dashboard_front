<template>
    <div class="content_container">
        <!-- Прогресс-бар с точками -->
        <div class="steps_progress">
            <div
                class="step"
                :class="{ active: step >= 1, completed: step > 1 }"
            >
                <span class="number">1</span>
                <span class="label">Завантаження файлу</span>
            </div>
            <div class="line"></div>
            <div
                class="step"
                :class="{ active: step >= 2, completed: step > 2 }"
            >
                <span class="number">2</span>
                <span class="label">Перегляд даних</span>
            </div>
            <div class="line"></div>
            <div class="step" :class="{ active: step >= 3 }">
                <span class="number">3</span>
                <span class="label">Типізація</span>
            </div>
        </div>

        <div class="wrapper" v-if="step === 1">
            <!-- <div class="item">
                <Icon
                    icon="material-symbols:add"
                    color="#888888"
                    width="100px"
                />
                <div class="info_container">
                    <h1>Створити</h1>
                    <p>самостійно</p>
                </div>
            </div> -->
            <div class="item" @click="openFileDialog" v-if="!fileLoaded">
                <Icon
                    icon="material-symbols:upload"
                    color="#888888"
                    width="100px"
                />
                <div class="info_container">
                    <h1>Завантажити</h1>
                    <p>з файлів</p>
                </div>
                <input
                    type="file"
                    ref="fileInput"
                    @change="handleFileChange"
                    style="display: none"
                />
                <div class="error_container" v-if="fileLoadError">
                    <api-response-popup
                        :successResponse="false"
                        :responseText="'При завантаженні файлу виникла помилка'"
                        :withTimer="true"
                    />
                </div>
            </div>
        </div>
        <!-- <data-preview-table v-if="step === 2" /> -->
        <data-preview-with-tabs v-if="step === 2" />
        <column-types v-if="step === 3" />
        <data-quality-report v-if="step === 4" @back="step = 3" />

        <div class="action-footer" v-if="step > 1">
            <button @click="prevStep" class="btn-back">
                <Icon icon="mdi-chevron-left" class="arrow-icon" /> Назад
            </button>
            <button @click="step = step + 1" class="btn-next-large">
                {{ getNextStepButtonName }}
                <Icon icon="mdi-chevron-right" class="arrow-icon" />
            </button>
        </div>
    </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import { FILE_TYPES } from "@/constants/commonConstants";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { mapActions, mapGetters } from "vuex";
import ApiResponsePopup from "@/components/common/apiResponsePopup.vue";
// import DataPreviewTable from "@/pages/StepsPages/tablePreview.vue";
import ColumnTypes from "@/pages/StepsPages/columnTypes.vue";
import DataPreviewWithTabs from "@/pages/StepsPages/dataPreviewWithTabsV2.vue";
import DataQualityReport from "@/pages/StepsPages/dataQualityReport.vue";

export default {
    name: "NewReport",
    components: {
        Icon,
        ApiResponsePopup,
        // DataPreviewTable,
        ColumnTypes,
        DataPreviewWithTabs,
        DataQualityReport,
    },
    data() {
        return {
            step: 1,
            fileLoaded: false,
            fileLoadError: false,
        };
    },
    computed: {
        ...mapGetters("charts", ["getChartData", "getFileType"]),
        normalizedTable() {
            const data = this.$store.state.charts.chartData;
            const fileType = this.$store.state.charts.fileType;

            if (!data) return [];

            if (fileType === FILE_TYPES.FILE_TYPE_XLSX) {
                const sheetNames = Object.keys(data);
                const sheet = data[sheetNames[0]];
                return sheet;
            }

            if (fileType === FILE_TYPES.FILE_TYPE_JSON) {
                if (!Array.isArray(data) || !data.length) return [];

                const headers = Object.keys(data[0]);
                const rows = data.map((obj) => headers.map((key) => obj[key]));

                return [headers, ...rows];
            }

            if (fileType === FILE_TYPES.FILE_TYPE_CSV) {
                const headers = data.headers;
                const rows = data.data.map((obj) => headers.map((h) => obj[h]));
                return [headers, ...rows];
            }

            return [];
        },
        getNextStepButtonName() {
            if (this.step === 2) {
                return "Налаштувати типи даних та задати валідацію";
            }
            if (this.step === 3) {
                return "Звіт якості даних";
            }
            return "";
        },
    },

    methods: {
        ...mapActions("charts", [
            "setChartDataAction",
            "setFileTypeAction",
            "resetChartData",
        ]),
        prevStep() {
            if (this.$route.query && this.$route.query.chartType) {
                this.$router.replace({ query: {} });
            }
            if (this.step === 2) {
                this.fileLoaded = false;
            }
            this.step = this.step - 1;
        },
        openFileDialog() {
            this.$refs.fileInput.click();
        },
        cleanCell(value) {
            if (value === null || value === undefined) return "";
            const str = String(value).trim();
            const trash = [
                "NULL",
                "null",
                "Null",
                "\\N",
                "N/A",
                "n/a",
                "NA",
                "na",
                "-",
                "—",
                "–",
                "",
                " ",
                "undefined",
                "None",
                "NaN",
            ];
            return trash.includes(str) ? "" : str;
        },

        cleanTable(table) {
            return table.map((row) =>
                Array.isArray(row)
                    ? row.map((cell) => this.cleanCell(cell))
                    : Object.fromEntries(
                          Object.entries(row).map(([key, val]) => [
                              key,
                              this.cleanCell(val),
                          ])
                      )
            );
        },
        handleFileChange(event) {
            this.resetChartData();
            this.fileLoadError = false;
            const file = event.target.files[0];
            const fileType = file.name.split(".").pop().toLowerCase();
            if (file) {
                switch (fileType) {
                    case FILE_TYPES.FILE_TYPE_JSON:
                        this.readJsonFile(file);
                        break;
                    case FILE_TYPES.FILE_TYPE_XLSX:
                        this.readExcelFile(file);
                        break;
                    case FILE_TYPES.FILE_TYPE_CSV:
                        this.readCsvFile(file);
                        break;
                    default:
                        alert("Unsupported file type");
                }
            }
        },
        // === JSON ===
        readJsonFile(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    let data = JSON.parse(e.target.result);
                    // if (Array.isArray(data)) {
                    //     data = this.cleanTable(data); // чистим
                    // }
                    this.setFileTypeAction("json");
                    this.setChartDataAction(data);
                    this.fileLoaded = true;
                    this.successLoad();
                } catch (err) {
                    console.error(err);
                    this.fileLoadError = true;
                }
            };
            reader.readAsText(file);
        },

        readExcelFile(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: "array" });
                    const result = {};

                    for (const sheetName in workbook.Sheets) {
                        // eslint-disable-next-line no-prototype-builtins
                        if (workbook.Sheets.hasOwnProperty(sheetName)) {
                            let sheetData = XLSX.utils.sheet_to_json(
                                workbook.Sheets[sheetName],
                                {
                                    header: 1,
                                    defval: "",
                                }
                            );
                            // sheetData = this.cleanTable(sheetData);
                            result[sheetName] = sheetData;
                        }
                    }

                    this.setFileTypeAction("xlsx");
                    this.setChartDataAction(result);
                    this.fileLoaded = true;
                    this.successLoad();
                } catch (err) {
                    console.error(err);
                    this.fileLoadError = true;
                }
            };
            reader.readAsArrayBuffer(file);
        },

        // === CSV ===
        readCsvFile(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const csv = Papa.parse(e.target.result, {
                        header: true,
                        dynamicTyping: false,
                        skipEmptyLines: true,
                    });

                    const headers = csv.meta.fields;
                    let rows = csv.data;

                    rows = rows.map((row) =>
                        Object.fromEntries(
                            Object.entries(row).map(([key, val]) => [
                                key,
                                this.cleanCell(val),
                            ])
                        )
                    );

                    const cleanData = { headers, data: rows };

                    this.setFileTypeAction("csv");
                    this.setChartDataAction(cleanData);
                    this.fileLoaded = true;
                    this.successLoad();
                } catch (err) {
                    console.error(err);
                    this.fileLoadError = true;
                }
            };
            reader.readAsText(file, "UTF-8");
        },
        selectDiagramType(diagramType = "") {
            if (diagramType && diagramType.length) {
                this.$router.push({ name: diagramType });
            }
        },
        successLoad() {
            this.step = 2;
        },
    },
    mounted() {
        if (this.getFileType && this.getFileType.length) {
            this.fileLoaded = true;
            this.step = 2;
        }
    },
};
</script>

<style lang="scss" scoped>
.content_container {
    font-family: "Roboto", sans-serif;
}
.wrapper {
    margin-top: 50px;
    padding-bottom: 100px;
    display: flex;
    justify-content: space-evenly;
}

.item {
    // box-sizing: border-box;
    box-shadow: 0 0 7px rgba(0, 0, 0, 0.15);
    border: 2px solid #e4e4e4;
    cursor: pointer;
    text-align: center;
    transition: all, 0.3s ease-in-out;
    border-radius: 20px;

    &:hover {
        box-shadow: 1px 1px #959c98, 2px 2px #959c98, 3px 3px#959c98,
            4px 4px #959c98, 5px 5px #959c98, 6px 6px#959c98, 7px 7px #959c98;
        -webkit-transform: translateX(-7px);
        transform: translateX(-7px);
        background-color: #eff4f9;
        svg {
            color: #e8f0fe;
        }
    }
    svg {
        margin: 210px 210px;
    }
}

.step_two {
    text-align: center;
    .header {
        font-size: 40px;
    }
}
.graphics_container {
    margin-top: 50px;
    h1 {
        font-size: 30px;
    }
}
.graphics_container_wrapper {
    margin-top: 30px;
    display: flex;
    justify-content: space-evenly;
}
.row {
    cursor: pointer;
    transition: all, 0.3s ease-in-out;

    &:hover {
        box-shadow: 1px 1px #959c98, 2px 2px #959c98, 3px 3px#959c98,
            4px 4px #959c98, 5px 5px #959c98, 6px 6px#959c98, 7px 7px #959c98;
        -webkit-transform: translateX(-7px);
        transform: translateX(-7px);
    }
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.15);
    border: 2px solid #e4e4e4;
    p {
        border-top: 2px solid #e4e4e4;
        font-size: 30px;
        padding-top: 30px;
        padding-bottom: 20px;
    }
}
.img_container {
    margin: 50px 100px;
}

.info_container {
    border-top: 1px solid #dadce0;
    padding: 20px;
    font-size: 24px;
    color: #3c4043;
    h1 {
        font-weight: bold;
    }
    p {
        color: #888;
    }
}

.steps_progress {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 40px 40px 60px 40px;

    .step {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;

        .number {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #e0e0e0;
            color: #999;
            font-size: 22px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            z-index: 2;
        }

        .label {
            margin-top: 12px;
            font-size: 15px;
            color: #777;
            transition: color 0.3s;
        }

        &.active .number {
            background: #667eea;
            color: white;
            box-shadow: 0 0 0 6px rgba(102, 126, 234, 0.3);
        }

        &.completed .number {
            background: #48bb78;
            color: white;

            &:after {
                content: "✓";
                margin-left: 4px;
            }
        }

        &.completed + .line {
            background: #48bb78;
        }
    }

    .line {
        flex: 1;
        height: 4px;
        background: #e0e0e0;
        margin: 0 20px;
        transition: background 0.4s;
    }
}

.action-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 50px;
    padding: 30px 80px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-top: 1px solid #e2e8f0;
    position: sticky;
    bottom: 0;
    z-index: 10;
    border-radius: 0 0 16px 16px;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
    // padding: 30px 20px 60px;
}

.btn-back {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 18px 36px;
    font-size: 17px;
    font-weight: 600;
    color: #475569;
    background: #e2e8f0;
    border: none;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.3s ease;

    .arrow-icon {
        font-size: 28px;
        font-weight: bold;
    }

    &:hover {
        background: #cbd5e1;
        transform: translateY(-2px);
        .arrow-icon {
            transform: translateX(-4px);
        }
    }
}

.btn-next-large {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    padding: 18px 36px;
    font-size: 18px;
    font-weight: 600;
    color: white;
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    border-radius: 16px;
    cursor: pointer;
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
    transition: all 0.3s ease;

    .arrow-icon {
        font-size: 32px;
        font-weight: bold;
        transition: transform 0.3s ease;
    }

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 35px rgba(16, 185, 129, 0.4);
        background: linear-gradient(135deg, #059669, #047857);

        .arrow-icon {
            transform: translateX(6px);
        }
    }

    &:active {
        transform: translateY(-1px);
    }
}
</style>
