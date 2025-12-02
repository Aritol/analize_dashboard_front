<template>
    <div>
        <div class="container">
            <div class="wrapper">
                <div class="chose_container">
                    <div class="left_column" v-if="isNewReport">
                        <h1>Оберіть дані для візуалізації</h1>
                        <div class="first_row">
                            <div class="select_container">
                                <h2
                                    v-if="
                                        fileType == jsonFileType ||
                                        fileType == xlsxFileType
                                    "
                                >
                                    Оберіть масив даних
                                </h2>
                                <div class="enrtypoint_data_container">
                                    <drop-down-menu
                                        v-if="
                                            fileType == jsonFileType ||
                                            fileType == xlsxFileType
                                        "
                                        class="select"
                                        :sckipFirstWord="true"
                                        :propsTitle="
                                            fileType === jsonFileType
                                                ? 'Оберіть масив даних'
                                                : 'Оберіть аркуш'
                                        "
                                        :items="entryKeys"
                                        @dropDownItemSelected="entryKeySelected"
                                    />

                                    <p
                                        :class="{
                                            margin_top:
                                                fileType == jsonFileType ||
                                                fileType == xlsxFileType,
                                            witout_margin:
                                                fileType == !jsonFileType &&
                                                fileType == !xlsxFileType,
                                        }"
                                    >
                                        Назва графіку
                                    </p>
                                    <input
                                        type="text"
                                        maxlength="20"
                                        v-model="chartName"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="second_row">
                            <div class="selects_data_container">
                                <p v-if="fileType === jsonFileType">
                                    Оберіть поле для Х-осі <br />
                                    (наприклад період: день, місяць, рік і тд.)
                                </p>
                                <p v-else>
                                    Оберіть стовпець для Х-осі <br />
                                    (наприклад період: день, місяць, рік і тд.)
                                </p>
                                <drop-down-menu
                                    class="select"
                                    :propsTitle="'Оберіть поле'"
                                    :items="periodsData"
                                    :fileType="fileType"
                                    @dropDownItemSelected="
                                        periodsSourceSelected
                                    "
                                />
                            </div>
                            <div class="selects_data_container">
                                <p v-if="fileType === jsonFileType">
                                    Оберіть поле для Y-осі (числовий тип)<br />(наприклад
                                    кількість: продажі, виручка)
                                </p>
                                <p v-else>
                                    Оберіть поле для Y-осі (числовий тип)<br />(наприклад
                                    кількість: продажі, виручка)
                                </p>
                                <drop-down-menu
                                    class="select"
                                    :propsTitle="'Оберіть поле'"
                                    :items="countData"
                                    :fileType="fileType"
                                    @dropDownItemSelected="countSourceSelected"
                                />
                            </div>

                            <div class="button_container">
                                <button
                                    class="apply_button"
                                    @click="initLineChart"
                                >
                                    Застосувати
                                </button>
                                <button
                                    class="save_button"
                                    v-if="!$route.params.reportId"
                                    @click="saveReportPopup = true"
                                >
                                    Зберегти звіт
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="right_column">
                        <div class="tabs">
                            <button
                                :class="[
                                    'tab',
                                    { active: activeTab === 'vizualization' },
                                ]"
                                @click="activeTab = 'data'"
                            >
                                Дані
                            </button>

                            <button
                                :class="[
                                    'tab',
                                    { active: activeTab === 'visualization' },
                                ]"
                                @click="activeTab = 'visualization'"
                            >
                                Візуалізація
                            </button>
                        </div>
                        <!-- <div v-if="activeTab === 'visualization'"> -->
                        <div>
                            <div class="header">
                                {{
                                    isNewReport ? "Створення графіку" : "Графік"
                                }}
                            </div>
                            <div
                                class="graphic_container"
                                v-if="showExampleChart"
                            >
                                <canvas
                                    id="myChartExample"
                                    width="800"
                                    height="600"
                                ></canvas>
                            </div>
                            <div class="graphic_container" v-else>
                                <line-chart
                                    v-if="chartType === linearDiagramChartType"
                                    :labels="labels"
                                    :name="chartName"
                                    :chartData="chartDataNormalized"
                                />
                                <gistogram-chart
                                    v-else
                                    :labels="labels"
                                    :name="chartName"
                                    :chartData="chartDataNormalized"
                                />
                            </div>
                        </div>
                        <!-- <div v-if="activeTab === 'data'">
                            <div>data</div>
                        </div> -->
                    </div>
                </div>
            </div>
            <div class="save_report_cotainer" v-if="saveReportPopup">
                <save-report
                    :headerText="headerText"
                    :showResponsePopup="showResponsePopup"
                    :responseStatus="responseStatus"
                    :responseText="responseText"
                    @close="saveReportPopup = false"
                    @closeResponsePopup="showResponsePopup = false"
                    @saveReport="saveReport"
                />
            </div>
        </div>
    </div>
</template>

<script>
import Chart from "chart.js/auto";
import { isEmpty, get } from "lodash";
import DropDownMenu from "@/components/dropdownMenu";
import LineChart from "@/components/charts/LineChart.vue";
import { format } from "date-fns";
import { getUserData, getReport, saveReport } from "@/helpers/data";
import GistogramChart from "@/components/charts/GistogramChart.vue";
import { FILE_TYPES } from "@/constants/commonConstants";
import { mapGetters } from "vuex";
import SaveReport from "./components/saveReport.vue";

const GISTOGTAM_CHART_TYPE = "gistogram";
const LINEAR_DIAGRAM_CHART_TYPE = "linearDiagram";

export default {
    name: "linearDiagram",
    components: {
        DropDownMenu,
        LineChart,
        GistogramChart,
        SaveReport,
    },
    data() {
        return {
            showExampleChart: true,
            // JSON---------------
            entryKeys: [],
            userSelectedKeysJson: {
                entryKey: "",
                countsKey: "",
                periodsKey: "",
            },
            // XLSX---------------
            userSelectedColumsXlsx: {
                entrySheet: "",
                countColumn: "",
                periodsColumn: "",
            },
            // DB---------------
            userSelectedColumsCsv: {
                countColumn: "",
                periodsColumn: "",
            },
            // common ---------------
            countData: [],
            periodsData: [],
            normilizedChartData: [],
            labels: [],
            chartName: "",
            chartDataNormalized: [],
            jsonFileType: FILE_TYPES.FILE_TYPE_JSON,
            xlsxFileType: FILE_TYPES.FILE_TYPE_XLSX,
            csvFileType: FILE_TYPES.FILE_TYPE_CSV,

            linearDiagramChartType: LINEAR_DIAGRAM_CHART_TYPE,
            gistogramChartType: GISTOGTAM_CHART_TYPE,
            responseStatus: "",
            responseText: "",
            saveReportPopup: false,
            showResponsePopup: false,
            userName: "",
            headerText: "",
            activeTab: "data",
        };
    },
    watch: {
        activeTab(value) {
            console.log(value);
            if (value === "visualization") {
                setTimeout(() => {
                    const ctx = document.getElementById("myChartExample");
                    console.log("ctx");
                    console.log(ctx);

                    new Chart(ctx, {
                        type: "line",
                        data: {
                            labels: [
                                "Понеділок",
                                "Вівторок",
                                "Середа",
                                "Четвер",
                                "П'ятниця",
                                "Неділя",
                            ],
                            datasets: [
                                {
                                    label: "Example",
                                    borderWidth: 1,
                                },
                            ],
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: "top",
                                },
                                title: {
                                    display: true,
                                    text: "Лінійна діаграма",
                                },
                            },
                        },
                    });
                }, 100);
            }
        },
    },
    computed: {
        ...mapGetters("charts", ["getChartData", "getFileType"]),
        ...mapGetters("auth", ["getUserId"]),
        chartData() {
            return this.getChartData || {};
        },
        fileType() {
            return this.getFileType || {};
        },
        chartType() {
            return this.$route.name === GISTOGTAM_CHART_TYPE
                ? GISTOGTAM_CHART_TYPE
                : LINEAR_DIAGRAM_CHART_TYPE;
        },
        userId() {
            return this.getUserId || 0;
        },
        isNewReport() {
            return !this.$route.params.reportId;
        },
    },
    methods: {
        initializeEntryKeys() {
            const keys = Object.keys(this.chartData);
            for (let i of keys) {
                this.entryKeys.push(i);
            }
        },
        entryKeySelected(key) {
            this.countData = [];
            this.periodsData = [];
            if (this.fileType === this.jsonFileType) {
                this.userSelectedKeysJson.entryKey = key;
                const keys = Object.keys(this.chartData[key]);
                for (let item of keys) {
                    this.countData.push(item);
                    this.periodsData.push(item);
                }
            } else if (this.fileType === this.xlsxFileType) {
                this.userSelectedColumsXlsx.entrySheet = key;
                const columns = this.chartData[key][0];
                for (let item of columns) {
                    this.countData.push(item);
                    this.periodsData.push(item);
                }
            } else if (this.fileType === this.csvFileType) {
                const columns = this.chartData.headers;
                for (let item of columns) {
                    this.countData.push(item);
                    this.periodsData.push(item);
                }
            }
        },
        initLineChart() {
            if (!this.showExampleChart) {
                this.showExampleChart = true;
            }
            this.chartDataNormalized = [];
            this.labels = [];
            if (this.fileType === this.jsonFileType) {
                const chartDataEntry =
                    this.chartData[this.userSelectedKeysJson.entryKey];
                const periods =
                    chartDataEntry[this.userSelectedKeysJson.periodsKey];
                periods.forEach((element) => {
                    this.chartDataNormalized.push(
                        chartDataEntry[this.userSelectedKeysJson.countsKey][
                            element
                        ]
                    );
                });
                this.labels =
                    chartDataEntry[this.userSelectedKeysJson.periodsKey];
            } else if (this.fileType === this.xlsxFileType) {
                const chartDataEntry =
                    this.chartData[this.userSelectedColumsXlsx.entrySheet];
                const countColumnIndex = chartDataEntry[0].indexOf(
                    this.userSelectedColumsXlsx.countColumn
                );
                const periodColumnIndex = chartDataEntry[0].indexOf(
                    this.userSelectedColumsXlsx.periodsColumn
                );
                chartDataEntry.shift();
                chartDataEntry.forEach((el) => {
                    this.labels.push(el[periodColumnIndex]);
                    this.chartDataNormalized.push(el[countColumnIndex]);
                });
            } else if (this.fileType === this.csvFileType) {
                const chartDataEntry = this.chartData.data;
                chartDataEntry.forEach((el) => {
                    this.labels.push(
                        el[this.userSelectedColumsCsv.periodsColumn]
                    );
                    this.chartDataNormalized.push(
                        el[this.userSelectedColumsCsv.countColumn]
                    );
                });
            }
            setTimeout(() => {
                this.showExampleChart = false;
            }, 100);
        },
        countSourceSelected(key) {
            if (this.fileType === this.jsonFileType) {
                this.userSelectedKeysJson.countsKey = key;
            } else if (this.fileType === this.xlsxFileType) {
                this.userSelectedColumsXlsx.countColumn = key;
            } else if (this.fileType === this.csvFileType) {
                this.userSelectedColumsCsv.countColumn = key;
            }
        },
        periodsSourceSelected(key) {
            if (this.fileType === this.jsonFileType) {
                this.userSelectedKeysJson.periodsKey = key;
            } else if (this.fileType === this.xlsxFileType) {
                this.userSelectedColumsXlsx.periodsColumn = key;
            } else if (this.fileType === this.csvFileType) {
                this.userSelectedColumsCsv.periodsColumn = key;
            }
        },
        saveReport(reportName) {
            this.responseStatus = false;
            this.responseText = "";
            const reportParams = {
                name: reportName || "",
                userId: this.userId || 0,
                chartType: this.chartType,
                fileType: this.fileType,
                owner: this.userName || "",
                lastViewed: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
                countData: this.countData,
                periodsData: this.periodsData,
                labels: this.labels,
                chartData: this.chartDataNormalized,
                data: this.chartData,
            };
            if (this.fileType == this.jsonFileType) {
                reportParams.entryKey = this.userSelectedKeysJson.entryKey;
            } else if (this.fileType == this.xlsxFileType) {
                reportParams.entryKey = this.userSelectedColumsXlsx.entrySheet;
            }
            saveReport(reportParams)
                .then((resp) => {
                    this.showResponsePopup = true;
                    if (resp && resp.data) {
                        this.headerText = "Успішно";
                        this.responseStatus = true;
                        this.responseText = "Звіт збережено успішно";
                    } else {
                        this.responseStatus = false;
                        this.responseText = "Помилка при збереженні";
                    }
                })
                .catch((err) => {
                    console.log("saveReport error -->", err);
                    this.responseStatus = false;
                    this.responseText = "Помилка при збереженні";
                })
                .finally(() => {
                    setTimeout(() => {
                        this.saveReportPopup = false;
                        this.$router.push({ name: "myReportsPage" });
                    }, 3500);
                });
        },
        getUserData() {
            getUserData()
                .then((resp) => {
                    if (resp && resp.data) {
                        const firstName =
                            get(resp.data, "userData.firstName", "") || "";
                        const secondName =
                            get(resp.data, "userData.lastName", "") || "";
                        this.userName = `${firstName} ${secondName}`;
                    }
                })
                .catch((err) => {
                    console.log("getUserData error ---> ", err);
                });
        },
        getReport() {
            getReport(this.$route.params.reportId)
                .then((resp) => {
                    const report = get(resp.data, "report", {}) || {};
                    if (!isEmpty(report)) {
                        this.labels = report.labels;
                        this.chartDataNormalized = report.chartData;
                        setTimeout(() => {
                            this.showExampleChart = false;
                        }, 100);
                    }
                })
                .catch((err) => {
                    console.log("getReport --->", err);
                });
        },
    },
    mounted() {
        this.getUserData();
        if (this.$route.params.reportId) {
            this.getReport();
        }
        if (!isEmpty(this.chartData)) {
            this.initializeEntryKeys();
        }
        if (this.activeTab === "visualization") {
            const ctx = document.getElementById("myChartExample");
            new Chart(ctx, {
                type: "line",
                data: {
                    labels: [
                        "Понеділок",
                        "Вівторок",
                        "Середа",
                        "Четвер",
                        "П'ятниця",
                        "Неділя",
                    ],
                    datasets: [
                        {
                            label: "Example",
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: "top",
                        },
                        title: {
                            display: true,
                            text: "Лінійна діаграма",
                        },
                    },
                },
            });
        }

        if (this.fileType === this.csvFileType) {
            this.entryKeySelected();
        }
    },
};
</script>

<style lang="scss" scoped>
.container {
    font-family: Lato, "Helvetica Neue", Helvetica, Arial, sans-serif;
    background-color: #c4c4c4;
    width: 100%;
    // height: 100vh;
    display: flex;
    justify-content: center;
}

.wrapper {
    max-width: 1240px;
    margin-top: 50px;
    padding-bottom: 50px;
}

.header {
    font-size: 24px;
}
.chose_container {
    // margin-top: 30px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 50px;
}
.tabs {
    display: flex;
    // align-items: flex-end;
    // background: #d4d8dd;
    // height: 48px;
    // border-radius: 8px;
    .tab {
        font-size: 22px;
        position: relative;
        // height: 32px;
        width: 100%;
        padding: 10px 14px;
        // margin-right: -15px;

        background: #ececec;
        border-radius: 20px 20px 0 0;
        cursor: pointer;

        // display: flex;
        align-items: center;
        z-index: 1;

        // transition: all 0.15s ease-in-out;
        // box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6),
        //     inset 0 -1px 0 rgba(0, 0, 0, 0.1);

        // padding: 20px 30px;
        // font-size: 20px;
        // background: #dde3e9;
        // cursor: pointer;
        transition: all 0.25s ease-in-out;
        &:hover {
            background: #c8cdd2;
        }
        button {
        }
    }
    .active {
        background: #ffffff;
        list-style: underline;
        font-weight: bold;
        &:hover {
            background: #ffffff;
        }
    }
}
.left_column {
    width: 100%;
    h1 {
        color: #ffff;
        font-size: 18px;
        font-weight: bold;
        padding: 18px 8px;
        background-color: #004976;
    }
}
.first_row {
    padding: 20px 10px;
    background-color: #ffff;
}
.second_row {
    margin-top: 15px;
    padding: 10px 10px;
    background-color: #ffff;
}

.right_column {
    margin-left: 20px;
    padding: 30px 20px;
    background-color: #ffff;
    max-height: 900px;
}

.select_container {
    color: #5a5b59;
    h2 {
        font-weight: bold;
        font-size: 24px;
        margin-bottom: 20px;
    }
    p {
        font-weight: bold;
        font-size: 18px;
    }
}
.select {
    margin-top: 15px;
}

.selects_data_container {
    margin-top: 20px;
    font-size: 18px;
    p {
        line-height: 22px;
    }
}
.button_container {
    text-align: center;
    margin-top: 20px;
    margin-bottom: 10px;

    button {
        padding: 10px 30px;
        font-size: 20px;
        font-weight: bold;
        display: block;
    }

    .apply_button {
        margin: 0 auto;
        color: #166ba0;
        background-color: transparent;
        border: solid 2px #166ba0;
        transition: all 0.3s ease-in-out;
        border-radius: 10px;
        &:hover {
            color: #ffff;
            background-color: #166ba0;
        }
    }

    .save_button {
        margin: 0 auto;
        margin-top: 20px;
        background-color: transparent;
        color: #12b65c;
        border: solid 2px #12b65c;
        transition: all 0.3s ease-in-out;
        border-radius: 10px;
        &:hover {
            color: #ffff;
            background-color: #12b65c;
        }
    }
}

.enrtypoint_data_container {
    .margin_top {
        margin-top: 20px;
    }
    .witout_margin {
        margin-top: 0px;
    }

    input {
        margin-top: 10px;
        margin-bottom: 20px;
        border: 2px solid #e4e4e4;
        padding: 8px 5px;
        font-size: 16px;
        width: 100%;

        &:focus {
            border: 2px solid #c4c0c0;
            transition: 0.3s ease;
        }
    }
}
</style>
