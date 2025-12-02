<template>
    <div>
        <div class="container">
            <div class="wrapper">
                <div class="header">
                    <p v-if="headerText && headerText.length">
                        {{ headerText }}
                    </p>
                    <p v-else-if="showInfo">Інформування</p>
                    <Icon
                        icon="material-symbols:close"
                        width="40px"
                        color="#ffff"
                        @click="close"
                    />
                </div>
                <div class="main_content">
                    <div class="response" v-if="successResponse">
                        <Icon icon="ooui:success" width="75px" color="green" />
                        <p>{{ responseText }}</p>
                    </div>
                    <div class="response" v-else>
                        <Icon
                            icon="material-symbols:error-circle-rounded"
                            width="50px"
                            color="red"
                        />
                        <p>
                            При виконанні запиту виникла помилка.
                            <br />Спробуйте пізніше.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
    name: "apiResponsePopup",
    components: {
        Icon,
    },
    props: {
        headerText: {
            type: String,
            default: "Помилка",
        },
        successResponse: {
            type: Boolean,
            default: false,
        },
        showInfo: {
            type: Boolean,
            default: true,
        },
        responseText: {
            type: String,
            default: "Успішно",
        },
        withTimer: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        close() {
            this.$emit("close");
        },
    },
    mounted() {
        if (this.withTimer) {
            setTimeout(() => {
                this.$emit("close");
            }, 3000);
        }
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
    font-size: 26px;
    display: flex;
    justify-content: space-between;
    border-top-left-radius: 25px;
    border-top-right-radius: 25px;

    color: #ffff;
    background-color: black;
    padding: 15px 0px;
    p {
        flex-grow: 1;
        text-align: center;
        padding-top: 7px;
        margin-left: 30px;
    }

    svg {
        margin-right: 10px;
        float: right;
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
</style>
