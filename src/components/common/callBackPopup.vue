<template>
    <div>
        <div class="container">
            <div class="wrapper" v-if="!showResponsePopup">
                <div class="content_container">
                    <div class="modal_header">
                        <h1>Замовити зворотній дзвінок</h1>
                        <Icon
                            icon="material-symbols:close"
                            width="40px"
                            color="#999"
                            @click="close"
                        />
                    </div>
                    <div class="modal_body">
                        <form action="" @submit.prevent="onSubmit">
                            <div class="form_item">
                                <label for="">Ім'я</label>
                                <input
                                    type="text"
                                    :class="{
                                        'error-input':
                                            requiredFieldsError.name ||
                                            requiredLengthError.name,
                                    }"
                                    required
                                    v-model="form.name"
                                    @change="validateName"
                                />
                                <p
                                    v-if="requiredFieldsError.name"
                                    class="error-info"
                                >
                                    Поле "Ім'я" є обов'язковим
                                </p>
                                <p
                                    v-if="requiredLengthError.name"
                                    class="error-info"
                                >
                                    Поле "Ім'я" повинно містити хочаб 3 букви
                                </p>
                            </div>
                            <div class="form_item">
                                <label for="">Телефон</label>
                                <input
                                    :class="{
                                        'error-input':
                                            requiredFieldsError.phone ||
                                            requiredLengthError.phone,
                                    }"
                                    type="text"
                                    placeholder="+38 (___) ___ __ __"
                                    required
                                    v-mask="'+38 (0##) ### ## ##'"
                                    v-model="form.phone"
                                    @change="validatePhone"
                                />
                                <p
                                    v-if="requiredFieldsError.phone"
                                    class="error-info"
                                >
                                    Поле "Телефон" є обов'язковим
                                </p>
                                <p
                                    v-if="requiredLengthError.phone"
                                    class="error-info"
                                >
                                    Поле "Телефон" повинно містити 12 цифр
                                </p>
                            </div>
                            <div class="form_item">
                                <textarea
                                    name=""
                                    id=""
                                    placeholder="Коментар"
                                    cols="10"
                                    rows="5"
                                    v-model="form.comment"
                                ></textarea>
                            </div>
                            <div class="form_item"></div>
                            <button type="submit">Передзвоніть мені</button>
                        </form>
                    </div>
                </div>
            </div>
            <div class="api_response_container" v-else>
                <api-response-popup
                    :successResponse="responseStatus"
                    :responseText="responseText"
                    :withTimer="true"
                    @close="closeMainPopup"
                />
            </div>
        </div>
    </div>
</template>

<script>
const NAME_REQUIRED_LENGTH = 3;
const PHONE_REQUIRED_LENGTH = 19;

import { Icon } from "@iconify/vue";
import { mask } from "vue-the-mask";
import { callBackOrder } from "@/helpers/data";
import apiResponsePopup from "@/components/common/apiResponsePopup.vue";
export default {
    name: "callBackPopup",
    components: {
        Icon,
        apiResponsePopup,
    },
    directives: {
        mask,
    },
    data() {
        return {
            requiredLengthError: {
                name: false,
                phone: false,
            },
            requiredFieldsError: {
                name: false,
                phone: false,
            },
            form: {
                name: "",
                phone: "",
                comment: "",
            },
            showResponsePopup: false,
            responseStatus: false,
            responseText: "",
        };
    },
    watch: {
        "form.name": {
            handler(value) {
                if (value) {
                    if (this.requiredLengthError.name) {
                        this.requiredLengthError.name = false;
                    }
                    if (this.requiredFieldsError.name) {
                        this.requiredFieldsError.name = false;
                    }
                }
            },
        },
        "form.phone": {
            handler(value) {
                if (value) {
                    if (this.requiredLengthError.phone) {
                        this.requiredLengthError.phone = false;
                    }
                    if (this.requiredFieldsError.phone) {
                        this.requiredFieldsError.phone = false;
                    }
                }
            },
        },
    },
    methods: {
        validateName() {
            if (this.form.name) {
                if (this.form.name.length < NAME_REQUIRED_LENGTH) {
                    this.requiredLengthError.name = true;
                } else {
                    this.requiredLengthError.name = false;
                }
            } else {
                this.requiredFieldsError.name = true;
            }
        },
        validatePhone() {
            if (this.form.phone) {
                if (this.form.phone.length < PHONE_REQUIRED_LENGTH) {
                    this.requiredLengthError.phone = true;
                } else {
                    this.requiredLengthError.phone = false;
                }
            } else {
                this.requiredFieldsError.phone = true;
            }
        },
        close() {
            this.$emit("close");
        },
        closeMainPopup() {
            this.$emit("close");
        },
        onSubmit() {
            const lengthKeys = Object.values(this.requiredLengthError);
            const requiredKeys = Object.values(this.requiredFieldsError);
            if (
                lengthKeys.every((el) => !el) &&
                requiredKeys.every((el) => !el)
            ) {
                callBackOrder({
                    name: this.form.name,
                    phoneNumber: this.form.phone,
                    text: this.form.comment ? this.form.comment : "",
                })
                    .then((resp) => {
                        this.showResponsePopup = true;
                        if (resp && resp.data && resp.data.status) {
                            this.showResponsePopup = true;
                            this.responseStatus = true;
                            this.responseText =
                                "Лист успішно надіслано, наш менеджер незабаром зв'яжеться з вами";
                        }
                    })
                    .catch((error) => {
                        this.showResponsePopup = true;
                        this.responseStatus = false;
                        this.responseText =
                            "Помилка при надсиланні листа спробуйте пізніше";
                        console.log(error);
                    });
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.container {
    font-family: Lato, "Helvetica Neue", Helvetica, Arial, sans-serif;
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.85);
    display: flex;
    justify-content: center;
    z-index: 1;
}
.wrapper {
    margin-top: 10%;
    background-color: #ffff;
    max-height: 600px;
    max-width: 450px;
    width: 100%;
}

.content_container {
}

.modal_header {
    font-size: 26px;
    display: flex;
    justify-content: space-between;
    padding: 10px 15px;
    h1 {
        padding-top: 5px;
    }
    svg {
        cursor: pointer;
        float: right;
    }
}
.modal_body {
    padding: 0px 30px;
}

.form_item {
    margin-top: 30px;
    label {
        font-size: 20px;
    }
    input {
        margin-top: 10px;
        display: block;
        width: 100%;
        border: 2px solid #cacaca;
        font-size: 18px;
        padding: 8px 5px;
        border-radius: 13px;
    }
    textarea {
        width: 100%;
        height: auto;
        min-height: 100px;
        max-height: 200px;
        max-width: 400px;
        min-width: 400px;
        padding: 4px 5px;
        border: 2px solid #cacaca;
        border-radius: 13px;
    }
}

button {
    margin-top: 20px;
    text-align: center;
    font-size: 28px;
    width: 100%;
    padding: 12px 30px;
    color: #fff;
    background-color: #509ee3;
    border-color: #509ee3;
    border-radius: 10px;
    transition: background-color 0.3s ease, color 0.3s ease, border 0.3s ease;
    &:hover {
        background-color: #1c6bb0;
    }
}
.error-info {
    color: red;
    margin-top: 5px;
    font-weight: normal;
    font-size: 18px;
}
.error-input {
    border: solid 2px red !important;
}

.api_response_container {
    z-index: 100;
}
</style>
