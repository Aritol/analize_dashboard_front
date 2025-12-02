<template>
    <div>
        <div class="container">
            <div class="wrapper">
                <div class="modal_header">
                    <h1>Збереження звіту</h1>
                    <Icon
                        icon="material-symbols:close"
                        width="40px"
                        color="#ffff"
                        @click="close"
                    />
                </div>
                <div class="modal_body">
                    <div class="content_container">
                        <input type="text" v-model="reportName" />
                    </div>
                    <div class="button_container">
                        <button class="success_btn" @click="saveReport">
                            Зберегти
                        </button>
                        <button class="cancel_btn" @click="close">Назад</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="api_response_popup" v-if="showResponsePopup">
            <api-response-popup
                :headerText="headerText"
                :successResponse="responseStatus"
                :responseText="responseText"
                :withTimer="true"
                @close="closeResponsePopup"
            />
        </div>
    </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import ApiResponsePopup from "@/components/common/apiResponsePopup.vue";
export default {
    name: "saveReport",
    components: {
        Icon,
        ApiResponsePopup,
    },
    props: {
        showResponsePopup: {
            type: Boolean,
            default: false,
        },
        headerText: {
            type: String,
            default: "",
        },
        responseStatus: {
            type: String,
            default: "",
        },
        responseText: { type: String, default: "" },
    },
    data() {
        return {
            reportName: "",
        };
    },
    methods: {
        saveReport() {
            this.$emit("saveReport", this.reportName);
        },
        closeResponsePopup() {
            this.$emit("closeResponsePopup");
        },
        close() {
            this.$emit("close");
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

.modal_header {
    background-color: #004976;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 4px 15px 15px;
    h1 {
        color: #ffff;
        font-size: 30px;
    }

    svg {
        margin-left: 40px;
        cursor: pointer;
    }
}
.modal_body {
    background-color: #ffff;
    padding: 20px;
}

.content_container {
    font-size: 22px;
    margin-top: 10px;

    input {
        margin-bottom: 20px;
        border: 2px solid #e4e4e4;
        padding: 8px 5px;
        font-size: 20px;
        width: 100%;
        min-width: 380px;

        &:focus {
            border: 2px solid #386991;
            transition: 0.3s ease;
        }
    }
}

.button_container {
    text-align: center;
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    button {
        padding: 13px 30px;
        font-size: 26px;
        border-radius: 5px;
        transition: background-color 0.25s ease-in-out;
        color: #ffff;
    }

    .success_btn {
        background-color: #33be4b;
        &:hover {
            background-color: #38e455;
        }
    }
    .cancel_btn {
        background-color: #c53131;

        &:hover {
            background-color: #e75050;
        }
    }
}
</style>
