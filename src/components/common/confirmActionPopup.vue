<template>
    <div>
        <div class="container">
            <div class="wrapper">
                <div class="header">
                    <p v-if="headerText.length">{{ headerText }}</p>
                    <p v-else>Підтвердіть дію</p>
                    <Icon
                        icon="material-symbols:close"
                        width="40px"
                        color="#ffff"
                        @click="close"
                    />
                </div>
                <div class="main_content">
                    <div class="body">
                        <p>{{ bodyText }}</p>
                    </div>
                    <div class="buttons">
                        <div v-if="withLoader">
                            <button
                                class="confirm_btn"
                                @click="sumbit"
                                :disabled="loading"
                            >
                                <span v-if="!loading">{{
                                    confirmBtnText
                                }}</span>
                                <span v-else class="spinner"></span>
                            </button>
                            <button
                                class="cancel_btn"
                                v-if="showCancelButton"
                                :disabled="loading"
                                @click="close"
                            >
                                Відмінити
                            </button>
                        </div>
                        <div v-else>
                            <button class="confirm_btn" @click="sumbit">
                                {{ confirmBtnText }}
                            </button>
                            <button
                                class="cancel_btn"
                                v-if="showCancelButton"
                                @click="close"
                            >
                                Відмінити
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
    name: "ConfirmActionPopup",
    components: {
        Icon,
    },
    props: {
        successResponse: {
            type: Boolean,
            default: false,
        },
        headerText: {
            type: String,
            default: "",
        },
        bodyText: {
            type: String,
            default: "",
        },
        showCancelButton: {
            type: Boolean,
            default: true,
        },
        confirmBtnText: {
            type: String,
            default: "Так",
        },
        loading: {
            type: Boolean,
            default: false,
        },
        withLoader: {
            type: Boolean,
            default: true,
        },
    },
    methods: {
        close() {
            this.$emit("close");
        },
        sumbit() {
            this.$emit("submit");
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
}

.wrapper {
    margin-top: 15%;
}

.header {
    margin-top: 10px;
    padding: 20px 30px;
    font-size: 26px;
    display: flex;
    justify-content: space-between;
    border-top-left-radius: 25px;
    border-top-right-radius: 25px;

    color: #ffff;
    background-color: black;
    p {
        flex-grow: 1;
        text-align: center;
        padding-top: 7px;
        margin-left: 30px;
    }

    svg {
        margin-left: 20px;
        cursor: pointer;
    }
}

.main_content {
    overflow: hidden;
    background-color: #ffff;
    font-size: 20px;
    margin: 0 auto;
    padding: 30px 50px;
    line-height: 24px;
    text-align: center;
    border-bottom-left-radius: 25px;
    border-bottom-right-radius: 25px;
    p {
        margin-top: 10px;
        margin-bottom: 25px;
    }
}

.buttons {
    display: flex;
    justify-content: space-between;

    .confirm_btn {
        background-color: black;
        color: #ffff;
        border: 2px solid black;

        &:hover {
            background-color: rgb(73, 72, 72);
        }
    }

    .cancel_btn {
        background-color: transparent;
        border: 2px solid black;
        margin-left: 15px;
        &:hover {
            background-color: black;
            color: #ffff;
        }
    }

    button {
        border-radius: 25px;
        font-size: 20px;
        padding: 15px 0px;
        min-width: 150px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        &:disabled {
            cursor: not-allowed;
        }
    }
}

.spinner {
    width: 20px;
    height: 20px;
    margin: 0px 20px;
    border: 3px solid #ffffff;
    border-top: 3px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
