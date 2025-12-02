<template>
    <div>
        <div class="popup_container">
            <call-back-popup
                v-if="showCallBackPopup"
                @close="showCallBackPopup = false"
            />
        </div>
        <div class="main_container">
            <div class="wrapp">
                <div
                    class="logo_container"
                    @click="$router.push({ name: 'homePage' })"
                >
                    <img src="@/assets/images/logo.png" alt="" />
                </div>
                <div class="menu_container">
                    <div class="menu_list">
                        <div class="menu_item">
                            <p
                                v-if="isAuthorized"
                                @click="$router.push({ name: 'newReportPage' })"
                            >
                                Створити звіт
                            </p>
                            <p
                                v-else
                                @click="$router.push({ name: 'homePage' })"
                            >
                                Головна
                            </p>
                        </div>
                        <div class="menu_item">
                            <p
                                v-if="isAuthorized"
                                @click="$router.push({ name: 'myReportsPage' })"
                            >
                                Мої звіти
                            </p>
                            <p v-else @click="showCallBackPopup = true">
                                Контакти
                            </p>
                        </div>
                        <div class="menu_item">
                            <p
                                v-if="isAuthorized"
                                @click="$router.push({ name: 'settingsPage' })"
                            >
                                Налаштування
                            </p>
                            <p
                                v-else
                                @click="$router.push({ name: 'partnersPage' })"
                            >
                                Партнери
                            </p>
                        </div>
                        <div class="menu_item">
                            <p v-if="isAuthorized" @click="logoutUser">Вихід</p>
                            <p v-else @click="loginUser">Увійти</p>
                        </div>
                    </div>
                </div>
                <div class="avatar">
                    <Avatar />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Avatar from "@/components/Avatar";
import CallBackPopup from "@/components/common/callBackPopup.vue";
import { mapActions, mapGetters } from "vuex";

export default {
    name: "Header",
    components: {
        Avatar,
        CallBackPopup,
    },
    data() {
        return {
            showCallBackPopup: false,
        };
    },
    computed: {
        ...mapGetters("auth", ["authorized"]),
        isAuthorized() {
            return this.authorized;
        },
    },
    methods: {
        ...mapActions("auth", ["logout"]),
        logoutUser() {
            this.logout();
        },
        loginUser() {
            this.$router.push({ name: "loginPage" });
        },
    },
};
</script>

<style lang="scss" scoped>
.main_container {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    // display: flex;
    border-bottom: 1px solid #e4e4e4;
    // justify-content: space-between;
}

.logo_container {
    margin-top: 15px;

    img {
        cursor: pointer;
        width: 120px;
    }
}

.wrapp {
    margin: 0 auto;
    max-width: 1240px;
    display: flex;
}
.menu_container {
    margin-top: 15px;
}

.menu_list {
    display: flex;
    align-items: center;
    // flex-direction: row;
    .menu_item {
        display: flex;
        justify-content: center;
        margin-top: 5px;
        margin-left: 100px;
        border-radius: 15px;
        text-align: center;
        transition: background-color 0.3s;
        &:hover {
            background-color: #f3f8fc;
            a {
                color: #509ee3;
            }
        }
        p {
            font-size: 21px;
            align-items: center;
            padding: 20px;
            cursor: pointer;
            color: #5a6072;
        }
    }
}
.avatar {
    margin-top: 10px;
    margin-left: 130px;
}
</style>
