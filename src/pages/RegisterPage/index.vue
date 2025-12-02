<template>
    <div>
        <div class="container">
            <div class="api_response_container" v-if="showApiResult">
                <api-response-popup
                    :withTimer="true"
                    :successResponse="false"
                    @close="showApiResult = false"
                />
            </div>
            <div class="header"></div>
            <div class="main_container">
                <!-- <div class="column" v-if="!showConfirmStep"> -->
                <div class="column">
                    <div class="top_content">
                        <h1>Створіть ваш особистий профіль</h1>
                        <p>
                            Все що вам потрібно для аналізу данних в одному
                            місці за 5-хвилин
                        </p>
                        <div class="filled">
                            <Icon icon="logos:google-icon" width="30px" />
                            <p>Sign up with google</p>
                        </div>
                    </div>
                    <div class="mid_content">
                        <hr class="line" />
                        <p>АБО</p>
                        <hr class="line" />
                    </div>
                    <div class="bottom_content">
                        <form @submit.prevent="register">
                            <div class="input_container">
                                <label for="firstName">Ім'я</label>
                                <input
                                    type="text"
                                    required
                                    class="input"
                                    :class="{
                                        'error-input':
                                            formLengthErrors.firstName,
                                    }"
                                    name="firstName"
                                    v-model="form.firstName"
                                    @focusout="checkMinLength('firstName')"
                                />
                                <p
                                    class="error_info"
                                    v-if="formLengthErrors.firstName"
                                >
                                    Мінімальна кількість символів - 3
                                </p>
                            </div>
                            <div class="input_container">
                                <label for="lastName">Фамілія</label>
                                <input
                                    type="text"
                                    required
                                    name="lastName"
                                    class="input"
                                    :class="{
                                        'error-input':
                                            formLengthErrors.lastName,
                                    }"
                                    v-model="form.lastName"
                                    @focusout="checkMinLength('lastName')"
                                />
                                <p
                                    class="error_info"
                                    v-if="
                                        form.lastName.length &&
                                        formLengthErrors.lastName
                                    "
                                >
                                    Мінімальна кількість символів - 3
                                </p>
                            </div>
                            <div class="input_container">
                                <label for="email">Email</label>
                                <input
                                    type="text"
                                    required
                                    name="email"
                                    class="input"
                                    :class="{
                                        'error-input': emailError,
                                    }"
                                    v-model="form.email"
                                    @focusout="validateEmail()"
                                />
                                <p class="error_info" v-if="emailError">
                                    Не валідна пошта
                                </p>
                            </div>
                            <div class="input_container">
                                <label for="password">Пароль</label>
                                <input
                                    type="password"
                                    required
                                    name="password"
                                    class="input"
                                    :class="{
                                        'error-input': passwordError,
                                    }"
                                    v-model="form.password"
                                    @focusout="validatePassword()"
                                />
                                <p class="error_info" v-if="passwordError">
                                    Мінімальна кількість символів - 5
                                </p>
                            </div>
                            <div class="input_container">
                                <label for="repeatPassword"
                                    >Повторіть пароль</label
                                >
                                <input
                                    type="password"
                                    required
                                    name="repeatPassword"
                                    class="input"
                                    :class="{
                                        'error-input': passwordMissMatchError,
                                    }"
                                    v-model="form.repeatPassword"
                                    @focusout="paswordMatching()"
                                />
                                <p
                                    class="error_info"
                                    v-if="passwordMissMatchError"
                                >
                                    Паролі не однакові
                                </p>
                            </div>
                            <div class="terms_container">
                                <input
                                    type="checkbox"
                                    required
                                    id="terms_checkbox"
                                    v-model="terms"
                                />
                                <p>Я даю згоду на обробку персональних даних</p>
                            </div>
                            <div class="submit_button_container">
                                <button type="submit">Зареєструватись</button>
                                <span
                                    class="error_info span"
                                    v-if="errorsInterruptRegistration"
                                >
                                    Заповніть обов'язкові поля
                                </span>
                                <p>
                                    Вже зареєстровані?
                                    <span
                                        @click="
                                            $router.push({ name: 'loginPage' })
                                        "
                                        >Увійдіть</span
                                    >
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="column">
                    <img src="@/assets/images/signup_sideimage2.png" alt="" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import axios from "axios";
import apiEndpoints from "@/constants/apiEndpoints";
import apiResponsePopup from "@/components/common/apiResponsePopup.vue";

const REQUIRED_NAMES_LENGTH = 3;
const REQUIRED_EMAIL_LENGTH = 5;
const REQUIRED_PASSWORD_LENGTH = 5;
const CONFIRM_CODE_LENGTH = 4;

export default {
    name: "RegisterPage",
    components: {
        Icon,
        apiResponsePopup,
    },
    data() {
        return {
            form: {
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                repeatPassword: "",
            },
            terms: false,
            formLengthErrors: {
                firstName: false,
                lastName: false,
            },
            emailError: false,
            passwordError: false,
            passwordMissMatchError: false,
            confirmCodeLength: CONFIRM_CODE_LENGTH,
            confirmCode: "",
            confirmCodeError: "",
            showConfirmStep: false,
            showApiResult: false,
        };
    },
    watch: {
        "form.firstName": {
            handler() {
                if (this.formLengthErrors.firstName)
                    this.formLengthErrors.firstName = false;
            },
        },
        "form.lastName": {
            handler() {
                if (this.formLengthErrors.lastName)
                    this.formLengthErrors.lastName = false;
            },
        },
        "form.email": {
            handler() {
                if (this.emailError) this.emailError = false;
            },
        },
        "form.password": {
            handler() {
                if (this.passwordError) {
                    this.passwordError = false;
                }
            },
        },
        "form.repeatPassword": {
            handler() {
                if (this.passwordMissMatchError)
                    this.passwordMissMatchError = false;
            },
        },
        confirmCode() {
            if (this.confirmCodeError) this.confirmCodeError = false;
        },
    },
    computed: {
        errorsInterruptRegistration() {
            let result = false;
            if (
                this.formLengthErrors.firstName ||
                this.formLengthErrors.lastName ||
                this.emailError ||
                this.passwordError ||
                this.repeatPassword
            ) {
                result = true;
            }
            return result;
        },
    },
    methods: {
        checkMinLength(field = "") {
            console.log("checkMinLength");
            if (
                !this.form[field] ||
                (this.form[field] &&
                    this.form[field].length < REQUIRED_NAMES_LENGTH)
            ) {
                this.formLengthErrors[field] = true;
            }
        },
        validateEmail() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (
                !emailRegex.test(this.form.email) ||
                this.form.email.length < REQUIRED_EMAIL_LENGTH
            )
                this.emailError = true;
        },
        validatePassword() {
            if (
                !this.form.password ||
                this.form.password.length < REQUIRED_PASSWORD_LENGTH
            ) {
                this.passwordError = true;
            }
        },
        paswordMatching() {
            if (this.form.password !== this.form.repeatPassword) {
                this.passwordMissMatchError = true;
            }
        },
        validateConfirmCode() {
            if (this.confirmCode.length != this.confirmCodeLength) {
                this.confirmCodeError = true;
            }
        },
        async register() {
            this.showConfirmStep = true;
            if (!this.errorsInterruptRegistration) {
                axios
                    .post(apiEndpoints.user.signup, {
                        firstName: this.form.firstName,
                        lastName: this.form.lastName,
                        email: this.form.email,
                        password: this.form.password,
                    })
                    .then((resp) => {
                        if (resp && resp.data) {
                            this.$router.push({ name: "homePage" });
                        } else {
                            this.showApiResult = true;
                        }
                    })
                    .catch((err) => {
                        console.log("register error --->", err);
                        this.showApiResult = true;
                    });
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.main_container {
    display: flex;
    font-family: Lato, "Helvetica Neue", Helvetica, Arial, sans-serif;
    justify-content: space-between;
    padding: 0 200px;
    margin-top: 50px;
}

.top_content {
    text-align: center;
    h1 {
        font-weight: 600;
        font-size: 36px;
        color: #1f1f1f;
    }

    p {
        color: #e4e4e4;
        font-weight: 500;
        font-size: 18px;
        margin-top: 10px;
    }

    .filled {
        margin-top: 35px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 10px 0px;
        border: 3px solid #e4e4e4;
        cursor: pointer;

        transition: all, 0.3s ease;

        &:hover {
            background-color: #ebe9e9;
            box-shadow: 1px 1px #959c98, 2px 2px #959c98, 3px 3px#959c98,
                4px 4px #959c98, 5px 5px #959c98, 6px 6px#959c98,
                7px 7px #959c98;
            -webkit-transform: translateX(-7px);
            transform: translateX(-7px);
        }

        p {
            color: #1f1f1f;
            margin-left: 20px;
            margin-top: 3px;
        }
    }

    .filled:after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 0;
        background: #999;
        -webkit-transition: 0.3s;
        transition: 0.3s;
    }
    .filled:hover {
        height: 100%;
    }
}

.mid_content {
    margin-top: 20px;
    display: flex;
    align-items: center;

    .line {
        flex-grow: 1;
        border: 1px solid #e4e4e4;
        border-radius: 1em;
    }

    p {
        font-size: 18px;
        margin: 0 20px;
        color: #e4e4e4;
    }
}

.bottom_content {
    .input_container {
        margin-top: 25px;
        label {
            font-weight: 600;
            font-size: 20px;
        }
        .input {
            margin-top: 15px;
            display: block;

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
}

.terms_container {
    margin-top: 30px;
    font-size: 18px;
    display: flex;

    p {
        margin-left: 15px;
    }
}

#terms_checkbox {
}

.submit_button_container {
    margin-top: 30px;
    margin-bottom: 50px;

    button {
        padding: 25px 0px;
        width: 100%;
        font-size: 20px;
        background-color: #1f1f1f;
        border: 0px;
        color: #ffff;

        &:hover {
            background-color: #383838;
            transition: 0.25s ease;
        }
    }
    p {
        margin-top: 15px;
        font-size: 18px;
        color: #c4c0c0;
        span {
            color: #1f1f1f;
            font-weight: 600;
            cursor: pointer;
        }
    }
}
.confirm_registration {
    margin-top: 150px;

    text-align: center;
    align-items: center;

    h1 {
        font-weight: 600;
        font-size: 20px;
        color: #1f1f1f;
    }

    p {
        margin-top: 15px;
        font-size: 18px;
    }

    .input {
        margin: 30px auto;
        display: block;
        justify-content: center;
        border: 2px solid #e4e4e4;
        padding: 8px 5px;
        font-size: 16px;
        // -webkit-appearance: none;
        &:focus {
            border: 2px solid #c4c0c0;
            transition: 0.3s ease;
        }
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    button {
        background-color: #509ee3;
        color: #ffff;
        margin-top: 30px;
        font-size: 20px;
        padding: 15px 100px;

        transition: background-color 200ms ease 0s;

        &:hover {
            background-color: #2d86d4;
        }
    }
}

.error_info {
    color: rgb(232, 59, 70);
    margin-top: 10px;
}

.span {
    margin-top: 10px;
}
.error-input {
    border: 2px solid #e83b46 !important;
}

img {
    margin-top: 15px;
    width: 640px;
}
</style>
