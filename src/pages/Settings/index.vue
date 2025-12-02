<template>
    <div>
        <div class="content_container">
            <div class="wrapper">
                <div class="column first">
                    <div class="wrap">
                        <h1 class="center-text">
                            {{ `${userData.firstName} ${userData.lastName}` }}
                        </h1>
                        <div class="photo_container">
                            <div class="photo">
                                <div
                                    class="icon_wrap"
                                    v-if="
                                        userData.photo && userData.photo.length
                                    "
                                >
                                    <img
                                        class="__img"
                                        :src="userData.photo"
                                        alt=""
                                    />
                                    <Icon
                                        class="delete-icon"
                                        icon="material-symbols:delete-outline"
                                        width="50px"
                                        color="#ffff"
                                        @click="showConfirmPopup = true"
                                    />
                                </div>
                                <div class="no_photo" v-else>
                                    <Icon
                                        icon="carbon:user-avatar-filled"
                                        width="120px"
                                        color="#21ACED"
                                        @mouseover="showSubMenu = true"
                                    />
                                    <p>Фото відсутнє</p>
                                </div>
                                <photo-editor
                                    v-if="showPhotoEditor"
                                    class="photo_editor"
                                    :src="file"
                                    :loading="loadingPhotoToServer"
                                    @savePhoto="savePhotoAfterEdit"
                                    @close="showPhotoEditor = false"
                                />
                            </div>
                            <button @click="$refs.file.click">
                                Завантажити{{
                                    userData.photo ? " інше фото" : " фото"
                                }}
                            </button>
                            <input
                                type="file"
                                ref="file"
                                style="display: none"
                                @change="fileLoaded"
                            />

                            <div class="info_container">
                                <p>
                                    Завантажте свій аватар. Фото з великим
                                    розміром зміняться автоматично.
                                </p>
                                <p>Максимальний розмір 10мб.</p>
                            </div>
                            <div class="since_date">
                                <p>Користувач з 2018 р.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="column">
                    <div class="wrap">
                        <div class="top_container">
                            <h1>Редагування профілю</h1>
                            <p>Інформація про користувача</p>
                        </div>
                        <div class="user_info_container">
                            <div class="sub_column">
                                <div class="container">
                                    <p>Ім'я</p>
                                    <input
                                        type="text"
                                        :value="userData.firstName"
                                        @change="handleFormChange"
                                    />
                                </div>
                                <div class="container">
                                    <p>Email</p>
                                    <input
                                        type="text"
                                        :value="userData.email"
                                        @change="handleFormChange"
                                    />
                                </div>
                                <div class="container">
                                    <p>Пароль</p>
                                    <input type="password" />
                                </div>
                                <button>Зберегти зміни</button>
                            </div>
                            <div class="sub_column ml-40">
                                <div class="container">
                                    <p>Прізвище</p>
                                    <input
                                        type="text"
                                        :value="userData.lastName"
                                        @change="handleFormChange"
                                    />
                                </div>
                                <div class="container" v-if="false">
                                    <p>Повторіть email</p>
                                    <input type="text" />
                                </div>
                                <div class="container" v-if="false">
                                    <p>Повторіть пароль</p>
                                    <input type="password" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="confirm_delete_container">
                <confirm-action-popup
                    v-if="showConfirmPopup"
                    :headerText="'Видалення фотографії'"
                    :bodyText="'Бажаєте видалити фото?'"
                    @close="showConfirmPopup = false"
                    @submit="deletePhoto"
                />
            </div>
            <div class="api_response_container">
                <api-response-popup
                    v-if="showApiResponsePopup"
                    :headerText="apiResponsePopupData.headerText"
                    :successResponse="apiResponsePopupData.successResponse"
                    :showInfo="apiResponsePopupData.showInfo"
                    :withLoader="apiResponsePopupData.withLoader"
                    :withTimer="apiResponsePopupData.withTimer"
                    :responseText="apiResponsePopupData.responseText"
                    @close="showApiResponsePopup = false"
                />
            </div>
        </div>
    </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import { get, isEmpty } from "lodash";
import PhotoEditor from "@/components/PhotoEditor";
import { saveImageToServer, deleteImage, getUserData } from "@/helpers/data";
import ConfirmActionPopup from "@/components/common/confirmActionPopup.vue";
import ApiResponsePopup from "@/components/common/apiResponsePopup.vue";

export default {
    name: "Settings",
    components: {
        Icon,
        PhotoEditor,
        ConfirmActionPopup,
        ApiResponsePopup,
    },
    data() {
        return {
            file: null,
            showPhotoEditor: false,
            showConfirmPopup: false,
            userData: {
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                photo: "",
            },
            changedData: {},
            emailModifyed: false,
            passwordModifyed: false,
            repeatEmail: "",
            repeatPassword: "",
            loadingPhotoToServer: false,
            deletePhotoSucces: false,
            showApiResponsePopup: false,
            apiResponsePopupData: {
                headerText: "",
                successResponse: false,
                showInfo: false,
                withLoader: true,
                withTimer: true,
                responseText: "",
            },
        };
    },
    watch: {
        "userData.email": {
            deep: true,
            handler() {
                this.emailModifyed = true;
            },
        },
        "userData.password": {
            deep: true,
            handler() {
                this.passwordModifyed = true;
            },
        },
    },
    methods: {
        clearApiResponsePopupData() {
            this.apiResponsePopupData = {
                headerText: "",
                successResponse: false,
                showInfo: false,
                withLoader: true,
                withTimer: true,
                responseText: "",
            };
        },
        handleFormChange(fieldName, value) {
            if (value !== this.userData[fieldName]) {
                this.changedData[fieldName] = value;
            }
        },
        fileLoaded(event) {
            const inputedFile = event.target.files[0];
            if (inputedFile) {
                this.showPhotoEditor = true;
                this.file = inputedFile;
            }
        },
        savePhotoAfterEdit(photo) {
            if (photo) {
                const formData = new FormData();
                formData.append("file", photo);
                this.loadingPhotoToServer = true;
                saveImageToServer(formData)
                    .then((response) => {
                        if (
                            response &&
                            response.data &&
                            response.data.uploadSuccess
                        ) {
                            this.showPhotoEditor = false;
                            this.apiResponsePopupData = {
                                headerText: "Збереження фото",
                                successResponse: true,
                                showInfo: true,
                                withLoader: true,
                                withTimer: true,
                                responseText: "Фото збережено успішно",
                            };
                            this.showApiResponsePopup = true;
                            this.getUserData();
                        }
                    })
                    .catch((err) => {
                        console.error("savePhotoAfterEdit --->", err);
                    })
                    .finally(() => {
                        this.showPhotoEditor = false;
                        this.loadingPhotoToServer = false;
                        setTimeout(() => {
                            this.clearApiResponsePopupData();
                        }, 3000);
                    });
            }
        },
        deletePhoto() {
            deleteImage()
                .then((response) => {
                    this.showApiResponsePopup = true;
                    if (response && response.data && response.data.success) {
                        this.deletePhotoSucces = true;
                        this.apiResponsePopupData = {
                            headerText: "Видалення фотографії",
                            successResponse: true,
                            showInfo: false,
                            withLoader: true,
                            withTimer: true,
                            responseText: "Фото видалено успішно",
                        };

                        this.getUserData();
                    } else {
                        this.apiResponsePopupData = {
                            headerText: "Видалення фотографії",
                            successResponse: false,
                            showInfo: false,
                            withLoader: true,
                            withTimer: true,
                        };
                    }
                    this.showApiResponsePopup = true;
                })
                .catch((err) => {
                    console.error("deleteImage --->", err);
                    this.apiResponsePopupData = {
                        headerText: "Видалення фотографії",
                        successResponse: false,
                        showInfo: false,
                        withLoader: true,
                        withTimer: true,
                    };
                    this.showApiResponsePopup = true;
                })
                .finally(() => {
                    this.showConfirmPopup = false;
                    setTimeout(() => {
                        this.clearApiResponsePopupData();
                    }, 3000);
                });
        },
        getUserData() {
            this.deletePhotoSucces = false;
            getUserData()
                .then((resp) => {
                    const response = get(resp.data, "userData", {}) || {};
                    if (response && !isEmpty(response)) {
                        this.userData = response;
                    }
                })
                .catch((err) => {
                    console.error("getUserData --->", err);
                });
        },
    },
    mounted() {
        this.getUserData();
    },
};
</script>

<style lang="scss" scoped>
.content_container {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    width: 100%;
    background-color: #ced5df;
}

.wrapper {
    max-width: 1340px;
    margin: 0 auto;
    padding-top: 40px;
    display: flex;
    // justify-content: space-between;
    // gap: 20px;
}

.center-text {
    text-align: center;
}

.column {
    background-color: #ffffff;
    // display: inline-block;
    margin: 0px 50px 186px 50px;
    // flex: 1;
}
.first {
    padding: 50px;
    max-width: 430px;
    // max-height: 1000px;
}
.wrap {
    // max-width: 500px;
    // margin: 50px 30px;

    h1 {
        font-size: 19px;
        font-weight: bold;
        margin-top: 20px;
    }
}

.photo_container {
    margin-top: 20px;
    .icon_wrap {
        position: relative;
        overflow: hidden;
        img {
            object-fit: cover;
            height: 100%;
            width: 100%;
            cursor: pointer;
        }
        transition: all 0.3s ease;
        &:hover {
            filter: brightness(0.4);
            .delete-icon {
                opacity: 10;
            }
        }
        svg {
            float: right;
            cursor: pointer;
        }
        .delete-icon {
            position: absolute;
            top: 5px;
            right: 5px;
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 100;
        }

        //     .delete-icon {
        //         z-index: 100;
        //         opacity: 1;
        //     }
        //     .__img {
        //         width: 100%;
        //         height: 100%;
        //         object-fit: cover;
        //         cursor: pointer;
        //     }
        // }
        border-radius: 20px;
        transition: all 0.3s ease;
    }

    .no_photo {
        border: 2px solid #000;
        border-radius: 20px;

        cursor: pointer;
        p {
            margin-bottom: 10px;
            font-size: 18px;
        }
    }
    .photo {
        max-width: 200px;
        max-height: 200px;
        margin: 0 auto;
        width: 100%;
        height: 100%;
        overflow: hidden;
        // &:hover {
        //     .__img {
        //         filter: brightness(0.4);
        //     }

        //     .delete-icon {
        //         z-index: 100;
        //         opacity: 1;
        //     }
        // }
    }

    text-align: center;
    button {
        margin-top: 15px;
        background-color: #ff3d17;
        padding: 17px 20px;
        font-size: 17px;
        color: #ffffff;
        border-radius: 10px;
        transition: all 0.3s ease;

        &:hover {
            background-color: #c03b21;
        }
    }

    .info_container {
        text-align: center;
        // max-width: 300px;
        margin-top: 15px;
        background-color: #f1f4fd;
        padding: 10px 15px;
        font-size: 16px;
        border-radius: 18px;
        line-height: 24px;
    }

    .since_date {
        margin-top: 15px;
        text-align: center;
        font-size: 16px;
        font-weight: bold;
    }
}

.top_container {
    background-color: #f1f4fd;
    padding: 20px 50px 0px 50px;
    min-width: 600px;
    h1 {
        font-size: 27px;
    }
    p {
        font-size: 18px;
        font-weight: bold;
        margin-top: 20px;
        border-bottom: 2px solid #0076fe;
        line-height: 28px;
        max-width: 260px;
    }
}

.user_info_container {
    margin-top: 35px;
    padding: 0px 60px;
    font-size: 22px;
    display: flex;

    button {
        margin-top: 30px;
        background-color: #ff3d17;
        padding: 20px 20px;
        font-size: 18px;
        font-weight: bold;
        color: #ffffff;
        border-radius: 10px;
        transition: all 0.3s ease;

        &:hover {
            background-color: #c03b21;
        }
    }
}
.ml-40 {
    margin-left: 50px;
}
.sub_column {
    color: #586a78;
    // margin-left: 20px;
    margin-bottom: 25px;
    .container {
        input {
            margin: 12px 0px 22px 0px;
            border: 2px solid #f1f4fd;
            padding: 12px 5px;
            font-size: 20px;
            transition: all 0.4s ease;
            &:focus {
                border: 2px solid #0076fe;
            }
        }
    }
}

.photo_editor {
    // position: absolute;
    // top: 0;
    // left: 0;
}
</style>
