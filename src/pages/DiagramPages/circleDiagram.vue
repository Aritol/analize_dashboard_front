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
                                    Оберіть поле для категорій
                                </p>
                                <p v-else>
                                    Оберіть стовпець для групування (наприклад:
                                    категорія)
                                </p>
                                <drop-down-menu
                                    class="select"
                                    :propsTitle="'Оберіть поле'"
                                    :items="keysToGroupData"
                                    :fileType="fileType"
                                    @dropDownItemSelected="groupSourceSelected"
                                />
                            </div>
                            <div class="selects_data_container">
                                <p v-if="fileType === jsonFileType">
                                    Оберіть поле для кількості (числовий тип)
                                </p>
                                <p v-else>
                                    Оберіть стовпець для кількості (числовий
                                    тип)
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
                                    v-if="!$route.params.reportId"
                                    class="save_button"
                                    @click="saveReportPopup = true"
                                >
                                    Зберегти звіт
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="right_column">
                        <div class="header">Створення графіку</div>
                        <div class="graphic_container" v-if="showExampleChart">
                            <canvas
                                id="myChartExample"
                                width="800"
                                height="600"
                            ></canvas>
                        </div>
                        <div class="graphic_container" v-else>
                            <circle-chart
                                :labels="labels"
                                :name="chartName"
                                :chartData="chartDataNormalized"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="save_report_cotainer" v-if="saveReportPopup">
            <save-report
                :showResponsePopup="showResponsePopup"
                :responseStatus="responseStatus"
                :responseText="responseText"
                @close="saveReportPopup = false"
                @closeResponsePopup="showResponsePopup = false"
                @saveReport="saveReport"
            />
        </div>
    </div>
</template>

<script>
import Chart from "chart.js/auto";
import { get, isEmpty } from "lodash";
import { format } from "date-fns";
import { getUserData, getReport } from "@/helpers/data";
import DropDownMenu from "@/components/dropdownMenu";
import CircleChart from "@/components/charts/CircleChart.vue";
import SaveReport from "./components/saveReport.vue";
import { FILE_TYPES } from "@/constants/commonConstants";
import { saveReport } from "@/helpers/data";
import { mapGetters } from "vuex";
export default {
    name: "circleDiagram",
    components: {
        DropDownMenu,
        CircleChart,
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
                groupKey: "",
            },
            // XLSX---------------
            userSelectedColumsXlsx: {
                entrySheet: "",
                countColumn: "",
                groupKey: "",
            },
            // DB---------------
            userSelectedColumsCsv: {
                countColumn: "",
                groupKey: "",
            },
            // common ---------------
            countData: [],
            keysToGroupData: [],
            normilizedChartData: [],
            labels: [],
            chartName: "",
            chartDataNormalized: [],
            jsonFileType: FILE_TYPES.FILE_TYPE_JSON,
            xlsxFileType: FILE_TYPES.FILE_TYPE_XLSX,
            csvFileType: FILE_TYPES.FILE_TYPE_CSV,

            saveReportPopup: false,
            showResponsePopup: false,
            userName: "",
        };
    },
    computed: {
        ...mapGetters("charts", ["getChartData", "getFileType"]),
        ...mapGetters("auth", ["getUserId"]),
        chartData() {
            return this.getChartData || {};
        },
        userId() {
            return this.getUserId || 0;
        },
        fileType() {
            return this.getFileType || {};
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
            this.keysToGroupData = [];
            if (this.fileType === this.jsonFileType) {
                this.userSelectedKeysJson.entryKey = key;
                const keys = Object.keys(this.chartData[key][0]);

                for (let item of keys) {
                    this.countData.push(item);
                    this.keysToGroupData.push(item);
                }
            } else if (this.fileType === this.xlsxFileType) {
                this.userSelectedColumsXlsx.entrySheet = key;
                const columns = this.chartData[key][0];
                for (let item of columns) {
                    this.countData.push(item);
                    this.keysToGroupData.push(item);
                }
            } else if (this.fileType === this.csvFileType) {
                const columns = this.chartData.headers;
                for (let item of columns) {
                    this.countData.push(item);
                    this.keysToGroupData.push(item);
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
                const keysToGroup = [];
                chartDataEntry.forEach((el) => {
                    keysToGroup.push(el[this.userSelectedKeysJson.groupKey]);
                });
                const groupedKeys = Array.from(new Set(keysToGroup));

                this.labels = groupedKeys;
                groupedKeys.forEach((firstLevelElement) => {
                    let sum = 0;
                    chartDataEntry.forEach((secondLevelElement) => {
                        if (
                            secondLevelElement[
                                this.userSelectedKeysJson.groupKey
                            ] == firstLevelElement
                        ) {
                            sum +=
                                +secondLevelElement[
                                    this.userSelectedKeysJson.countsKey
                                ];
                        }
                    });
                    this.chartDataNormalized.push(sum);
                });
            } else if (this.fileType === this.xlsxFileType) {
                const chartDataEntry =
                    this.chartData[this.userSelectedColumsXlsx.entrySheet];

                const countColumnIndex = chartDataEntry[0].indexOf(
                    this.userSelectedColumsXlsx.countColumn
                );
                const groupkeyColumnIndex = chartDataEntry[0].indexOf(
                    this.userSelectedColumsXlsx.groupKey
                );

                const keysToGroup = [];
                chartDataEntry.shift();
                chartDataEntry.forEach((el) => {
                    keysToGroup.push(el[groupkeyColumnIndex]);
                });
                const groupedKeys = Array.from(new Set(keysToGroup));

                this.labels = groupedKeys;
                groupedKeys.forEach((el) => {
                    let sum = 0;
                    chartDataEntry.forEach((element) => {
                        if (element[groupkeyColumnIndex] == el) {
                            sum += +element[countColumnIndex];
                        }
                    });
                    this.chartDataNormalized.push(sum);
                });
            } else if (this.fileType === this.csvFileType) {
                const chartDataEntry = this.chartData.data;
                const keysToGroup = [];
                chartDataEntry.forEach((el) => {
                    keysToGroup.push(el[this.userSelectedColumsCsv.groupKey]);
                });
                const groupedKeys = new Set(keysToGroup);

                this.labels = Array.from(groupedKeys);
                groupedKeys.forEach((grpoupKey) => {
                    let sum = 0;
                    chartDataEntry.forEach((el) => {
                        if (
                            el[this.userSelectedColumsCsv.groupKey] == grpoupKey
                        ) {
                            sum += el[this.userSelectedColumsCsv.countColumn];
                        }
                    });
                    this.chartDataNormalized.push(sum);
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
        groupSourceSelected(key) {
            if (this.fileType === this.jsonFileType) {
                this.userSelectedKeysJson.groupKey = key;
            } else if (this.fileType === this.xlsxFileType) {
                this.userSelectedColumsXlsx.groupKey = key;
            } else if (this.fileType === this.csvFileType) {
                this.userSelectedColumsCsv.groupKey = key;
            }
        },
        saveReport(reportName) {
            this.responseStatus = false;
            this.responseText = "";
            const reportParams = {
                name: reportName || "",
                userId: this.userId || 0,
                chartType: "circleDiagram",
                fileType: this.fileType,
                owner: this.userName || "",
                lastViewed: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
                countData: this.countData,
                keysToGroup: this.keysToGroupData,
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
                        // data: [12, 19, 3, 5, 2, 3],
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
    display: flex;
    justify-content: center;
}

.wrapper {
    max-width: 1240px;
    margin-top: 50px;
    margin-bottom: 50px;
}

.header {
    font-size: 24px;
}
.chose_container {
    margin-top: 30px;
    display: flex;
    justify-content: space-between;
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
    padding: 40px 30px;
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
        // button {
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
