<template>
    <div>
        <div class="content_container" @click="openReport">
            <div class="wrapper" ref="wrapper">
                <div class="name_container">
                    <Icon
                        icon="ion:analytics-sharp"
                        color="#4285f4"
                        width="30px"
                    />
                    <p>{{ report.name }}</p>
                </div>
                <div class="owner_container">
                    <p>{{ report.owner }}</p>
                </div>
                <div class="last_seen_container">
                    <p>{{ formattedDate }}</p>
                    <div class="more_container">
                        <div class="more_button">
                            <Icon
                                icon="akar-icons:more-vertical"
                                color="#888888"
                                width="25px"
                                @click.stop="showOptions = true"
                            />
                        </div>
                        <div class="options" v-if="showOptions" ref="options">
                            <div class="option">
                                <Icon
                                    icon="material-symbols:drive-file-rename-outline-outline-sharp"
                                    color="#888888"
                                    width="30px"
                                />
                                <p>Перейменувати</p>
                            </div>
                            <div class="option" @click="deleteReport">
                                <Icon
                                    icon="material-symbols:delete-outline"
                                    color="#888888"
                                    width="30px"
                                />
                                <p>Видалити</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import { format } from "date-fns";
import { deleteReport } from "@/helpers/data";

export default {
    name: "reportsListItem",
    components: {
        Icon,
    },
    props: {
        report: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            showOptions: false,
        };
    },
    computed: {
        formattedDate() {
            return format(this.report.lastViewed, "yyyy-MM-dd HH:mm");
        },
    },
    methods: {
        handleClickOutside(event) {
            const wrapper = this.$refs.wrapper;
            const options = this.$refs.options;
            if (
                wrapper &&
                !wrapper.contains(event.target) &&
                options &&
                !options.contains(event.target)
            ) {
                this.showOptions = false;
            }
        },
        deleteReport() {
            deleteReport(this.report._id)
                .then((resp) => {
                    if (resp) {
                        this.$emit("refreshReports");
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        openReport() {
            if (this.report.chartType === "circleDiagram") {
                this.$router.push({
                    name: "circleDiagram",
                    params: { reportId: this.report._id },
                });
            }
            if (this.report.chartType === "linearDiagram") {
                this.$router.push({
                    name: "linearDiagram",
                    params: { reportId: this.report._id },
                });
            }
            if (this.report.chartType === "gistogram") {
                this.$router.push({
                    name: "gistogram",
                    params: { reportId: this.report._id },
                });
            }
        },
    },

    mounted() {
        document.addEventListener("click", this.handleClickOutside);
    },
    beforeUnmount() {
        document.removeEventListener("click", this.handleClickOutside);
    },
};
</script>

<style lang="scss" scoped>
.content_container {
}

.wrapper {
    position: relative;
    display: flex;
    justify-content: space-between;
    // margin-top: 10px;
    border-bottom: 1px solid #dadce0;
    padding: 10px 4px;
    align-items: center;
    cursor: pointer;

    &:hover {
        background-color: #f8f9fa;
    }

    p {
        font-size: 16px;
    }
}

.name_container {
    display: flex;
    align-items: center;
    max-width: 250px;
    width: 100%;

    p {
        margin-left: 15px;
    }
}

.last_seen_container {
    display: flex;
    align-items: center;
    svg {
        margin-left: 5px;
    }
}
.options {
    position: absolute;
    top: 50%;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    max-width: 250px;
    width: 100%;
    z-index: 100;
}
.option {
    padding: 15px 10px;

    display: flex;
    align-items: center;
    cursor: pointer;

    &:hover {
        background-color: #f8f9fa;
    }

    p {
        margin-left: 10px;
        font-size: 18px;
    }
}
</style>
