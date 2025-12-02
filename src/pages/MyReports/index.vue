<template>
    <div>
        <div class="container">
            <div class="wrapper">
                <div class="top_container">
                    <h1>Мої звіти</h1>
                    <!-- <div class="buttons_conatainer">
                        <button
                            :class="{
                                active: !deletedReportsPage,
                            }"
                            @click="toMyReports"
                        >
                            Недавні
                        </button>
                        <button
                            :class="{
                                active: deletedReportsPage,
                            }"
                            @click="toDeletedReports"
                        >
                            Видалені
                        </button>
                    </div> -->
                </div>
                <div class="line"></div>
                <div class="main_container">
                    <div class="add_new">
                        <h1>Додати новий звіт</h1>
                        <div
                            class="add_new_boxed"
                            @click="$router.push({ name: 'newReportPage' })"
                        >
                            <div class="wrap">
                                <Icon
                                    icon="material-symbols:add"
                                    color="#4285f4"
                                    width="150px"
                                />
                            </div>
                            <div class="sub_container">
                                <p>Пустий звіт</p>
                                <span>EasyAnalize</span>
                            </div>
                        </div>
                    </div>
                    <div class="items_list">
                        <div class="table_header">
                            <div class="table_header_item">Назва</div>
                            <div class="table_header_item">Власник</div>
                            <div class="table_header_item">Дата перегляду</div>
                        </div>
                        <div class="line"></div>
                        <div v-if="userReports && userReports.length">
                            <div
                                class="item"
                                v-for="(item, index) in userReports"
                                :key="index"
                            >
                                <resports-list-item
                                    :report="item"
                                    @refreshReports="getUserReports"
                                />
                            </div>
                        </div>
                        <div class="reports_not_found" v-else>
                            Звітів не знайдено
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import resportsListItem from "@/components/reports/reportsListItem.vue";
import { Icon } from "@iconify/vue";
import { mapGetters } from "vuex";
import { getReports } from "@/helpers/data";

export default {
    name: "MyReports",
    components: {
        resportsListItem,
        Icon,
    },

    data() {
        return {
            userReports: [],
        };
    },
    computed: {
        ...mapGetters("auth", ["getUserId"]),
        deletedReportsPage() {
            return this.$route.name === "deletedReports" ? true : false;
        },
        userId() {
            return this.getUserId || 0;
        },
    },
    methods: {
        toDeletedReports() {
            this.$router.push({ name: "deletedReports" });
        },
        toMyReports() {
            this.$router.push({ name: "myReportsPage" });
        },
        getUserReports() {
            this.userReports = [];
            getReports(this.userId)
                .then((resp) => {
                    if (
                        resp &&
                        resp.data &&
                        resp.data.reports &&
                        resp.data.reports.length
                    ) {
                        this.userReports = resp.data.reports;
                    }
                })
                .catch((err) => console.log("getUserReports", err));
        },
    },
    mounted() {
        this.getUserReports();
    },
};
</script>

<style lang="scss" scoped>
.container {
    font-family: "Roboto", sans-serif;
    max-width: 1240px;
    width: 100%;
    margin: 0 auto;
}

.wrapper {
    margin-top: 50px;
}
.top_container {
    display: flex;
    align-items: center;
    margin-bottom: 25px;

    h1 {
        font-size: 26px;
        color: #3c4043;
        vertical-align: middle;
    }

    .buttons_conatainer {
        margin-left: 30px;
        button {
            padding: 12px 25px;
            font-size: 22px;
            border: 1px solid #dadce0;
            color: #5f6368;
            background-color: transparent;

            &:hover {
                background-color: #f9f9f9;
            }
        }
        .active {
            color: #1967d2 !important;
            background-color: #cedcf5 !important;
            &:hover {
                background-color: #e3ebf8 !important;
            }
        }
    }
}
.line {
    border-radius: 1em;
    border-bottom: 1px solid #dadce0;
}

.main_container {
    margin-top: 40px;
}
.add_new {
    h1 {
        font-size: 20px;
    }
}

.add_new_boxed {
    max-width: 310px;
    margin-top: 30px;
    padding: 10px;
    border: 2px solid #dadce0;
    border-radius: 5px;
    cursor: pointer;
    &:hover {
        border: 2px solid #4285f4;
    }
    .wrap {
        font-size: 20px;
        text-align: center;
    }
    .sub_container {
        p {
            margin-bottom: 6px;
        }
        span {
            color: #94969a;
        }
    }
}

.items_list {
    margin-top: 40px;
}

.table_header {
    display: flex;
    justify-content: space-between;
    .table_header_item {
        font-size: 20px;
        color: #202124;
        height: 34px;
        &:nth-child(2) {
            margin-left: 130px;
        }
        &:nth-child(3) {
            margin-right: 22px;
        }
    }
}
.reports_not_found {
    padding-top: 15px;
    padding-bottom: 15px;
    text-align: center;
    font-size: 20px;
    background-color: #f8f9fa;
}
</style>
