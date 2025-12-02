<template>
    <div>
        <div class="container">
            <div class="content_container">
                <div class="header">
                    <p>Оберіть розмір фото</p>
                    <Icon
                        icon="material-symbols:close"
                        width="50px"
                        color="#ffff"
                        @click="close"
                    />
                </div>
                <div class="img-container">
                    <img
                        alt=""
                        ref="image"
                        :src="base64Image"
                        v-show="showCropp"
                    />
                </div>
                <button @click="savePhotoCropped" :disabled="loading">
                    <span v-if="!loading">Зберегти фото</span>
                    <span v-else class="spinner"></span>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import Cropper from "cropperjs";
import { Icon } from "@iconify/vue";

export default {
    name: "PhotoEditor",
    components: {
        Icon,
    },
    props: {
        src: {
            type: File,
            default: () => {},
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            cropper: {},
            destanation: {},
            image: {},
            base64Image: null,
            showCropp: false,
        };
    },
    watch: {
        src: {
            immediate: true,
            handler(photo) {
                if (photo) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        this.base64Image = reader.result;
                    };
                    reader.readAsDataURL(photo);
                }
            },
        },
    },
    methods: {
        initCropper() {
            this.image = this.$refs.image;
            this.cropper = new Cropper(this.image, {
                zoomable: false,
                scalable: false,
                aspectRatio: 1,
                crop: () => {
                    const canvas = this.cropper.getCroppedCanvas();
                    canvas.toBlob((blob) => {
                        this.destanation = new File([blob], "filename.jpg", {
                            type: "image/jpeg",
                        });
                    });
                },
            });
        },
        savePhotoCropped() {
            this.$emit("savePhoto", this.destanation);
        },
        close() {
            this.$emit("close");
        },
    },
    mounted() {
        const reader = new FileReader();
        reader.onload = () => {
            this.base64Image = reader.result;
            this.showCropp = true;
            this.initCropper();
        };
        reader.readAsDataURL(this.src);
    },
    beforeUnmount() {
        this.cropper.destroy();
    },
};
</script>

<style lang="scss" scoped>
.container {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.85);
}

.content_container {
    max-width: 450px;
    margin: 0 auto;
    margin-top: 10%;
    border-radius: 20px;
    background-color: #ffff;
    overflow: hidden;
}

.header {
    max-width: 450px;
    text-align: center;
    padding: 10px 0px;
    background-color: black;
    color: #ffff;
    font-size: 22px;
    display: flex;
    p {
        margin-left: 27%;
        margin-top: 16px;
    }

    svg {
        margin-left: 65px;
        cursor: pointer;
    }
}

.img-container {
    margin: 20px auto;

    height: 350px; /* Added */
    width: 400px; /* Added */
    img {
        // width: 100%; /* Added */
        display: block;
        max-width: 100%;
    }
}

button {
    margin-top: 20px;
    margin-bottom: 25px;
    background-color: #ff3d17;
    padding: 17px 20px;
    font-size: 17px;
    color: #ffffff;
    border-radius: 10px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background-color: #c03b21;
    }

    &:disabled {
        background-color: #c03b21;
        cursor: not-allowed;
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
