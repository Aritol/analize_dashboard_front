<template>
    <div class="content_container">
        <div class="header_container">
            <h1>Почніть роботу з EasyAnalize</h1>
            <p>Візуалізуйте свої дані просто зрозуміло та безкоштовно.</p>
        </div>
        <div class="main_container">
            <div class="input_container">
                <label for="email">Пошта</label>
                <input
                    :class="{
                        'error-input': loginError,
                    }"
                    type="text"
                    id="email"
                    v-model="form.email"
                />
            </div>
            <div class="input_container">
                <label for="password">Пароль</label>
                <input
                    :class="{
                        'error-input': loginError,
                    }"
                    type="password"
                    id="password"
                    v-model="form.password"
                />
                <span class="error-info" v-if="loginError"
                    >Невірна пошта чи пароль</span
                >
            </div>
            <div class="forgot_password">
                <p>Забули пароль?</p>
            </div>
            <button @click="login">Увійти</button>
            <div class="bottom_info_container">
                <p>Ще немає аккаунту?</p>
                <router-link to="/signup">Зареєструватись</router-link>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import apiEndpoints from "@/constants/apiEndpoints";
import { mapActions } from "vuex";

export default {
    name: "LoginPage",
    data() {
        return {
            form: {
                email: "",
                password: "",
            },
            loginError: false,
        };
    },
    watch: {
        complexFormWatcher() {
            if (this.loginError) {
                this.loginError = false;
            }
        },
    },
    computed: {
        complexFormWatcher() {
            return `${this.form.email}_${this.form.password}`;
        },
    },
    methods: {
        ...mapActions("auth", ["setAuthData"]),
        login() {
            axios
                .post(apiEndpoints.user.login, {
                    email: this.form.email,
                    password: this.form.password,
                })
                .then((resp) => {
                    if (resp && resp.data && resp.data.user) {
                        this.setAuthData(resp.data.user);
                        this.$router.push({ name: "homePage" });
                    } else {
                        this.loginError = true;
                    }
                })
                .catch((err) => {
                    console.log("login error --->", err);
                    this.loginError = true;
                });
        },
    },
};
</script>

<style lang="scss" scoped>
.content_container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100vh;
    background-color: #fafbfe;
    font-family: Lato, "Helvetica Neue", Helvetica, Arial, sans-serif;
    p {
        color: #646a72;
        font-size: 16px;
        font-weight: 600;
    }
}

.header_container {
    margin-top: 60px;
    h1 {
        text-align: center;
        color: rgb(35, 44, 66);
        font-weight: 700;
        font-size: 24px;
        margin-top: 20px;
    }
    p {
        margin-top: 10px;
    }
}

.main_container {
    button {
        margin-top: 50px;
        background-color: rgb(80, 158, 227);
        font-size: 20px;
        font-weight: 600;
        color: white;
        padding: 20px 250px;
        border-radius: 15px;
        transition: background-color 200ms ease 0s, border-color 200ms ease 0s,
            color 200ms ease 0s, opacity 200ms ease 0s;

        &:hover {
            background-color: #2d86d4;
        }
    }
}

.input_container {
    margin-top: 40px;

    label {
        font-size: 15px;
        font-weight: 600;
    }
    input {
        margin-top: 10px;
        display: block;
        padding: 8px 15px;
        font-size: 19px;
        transition: border-color 100ms ease 0s;
        background-color: rgb(255, 255, 255);
        transition: border-color 400ms ease 0s;
        border: solid 2px transparent;
        border-radius: 8px;
        min-width: 565px;
        &:focus {
            border: solid 2px #88bdec;
        }
    }
}

.forgot_password {
    margin-top: 20px;
    p {
        margin-top: 10px;
        cursor: pointer;
    }
}

.bottom_info_container {
    display: flex;
    margin-top: 20px;
    p {
        margin: 0;
    }
    a {
        margin-left: 5px;
        font-size: 16px;
        color: rgb(80, 158, 227);
        font-weight: 700;
    }
}

.error-info {
    position: relative;
    color: red;
    top: 8px;
    font-weight: normal;
    font-size: 20px;
}
.error-input {
    border: solid 2px red !important;
}
</style>
