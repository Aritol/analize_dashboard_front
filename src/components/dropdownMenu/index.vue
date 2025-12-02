<template>
    <div>
        <div class="container">
            <div class="wrapper">
                <div
                    class="dropdown_header"
                    @click="dropdownActive = !dropdownActive"
                >
                    <div class="right_header_item">
                        <p>{{ title }}</p>
                    </div>
                    <Icon
                        icon="material-symbols:keyboard-arrow-down"
                        width="30px"
                        color="#333333"
                        :class="{
                            open: dropdownActive,
                        }"
                    />
                </div>
                <div class="dropdown_list" v-if="dropdownActive">
                    <div
                        v-for="(item, i) in items"
                        :key="i"
                        class="dropdown_list_item"
                        @click="onListItemSelected(item)"
                    >
                        <p v-if="fileType === jsonFileType">
                            {{ `Ключ { ${item} }` }}
                        </p>
                        <p v-else-if="sckipFirstWord">
                            {{ item }}
                        </p>
                        <p v-else>
                            {{ `Стовпець - "${item}"` }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import { FILE_TYPES } from "@/constants/commonConstants";

export default {
    name: "dropdownMenu",
    components: {
        Icon,
    },
    props: {
        items: {
            type: Array,
            default: () => [],
        },
        propsTitle: {
            type: String,
            default: "Оберіть опцію",
        },
        fileType: {
            type: String,
            default: "",
        },
        sckipFirstWord: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            dropdownActive: false,
            title: "",
            jsonFileType: FILE_TYPES.FILE_TYPE_JSON,
            xlsxFileType: FILE_TYPES.FILE_TYPE_XLSX,
            csvFileType: FILE_TYPES.FILE_TYPE_CSV,
        };
    },
    watch: {
        propsTitle: {
            immediate: true,
            handler(value) {
                if (value) {
                    this.title = value;
                }
            },
        },
    },
    methods: {
        onListItemSelected(item) {
            this.dropdownActive = false;
            this.title = `{ ${item} }`;
            this.$emit("dropDownItemSelected", item);
        },
        handleClickOutside(evt) {
            if (!this.$el.contains(evt.target)) {
                this.dropdownActive = false;
            }
        },
    },
    mounted() {
        document.addEventListener("click", this.handleClickOutside);
    },
    beforeUnmount() {
        document.removeEventListener("click", this.handleClickOutside);
    },
};
</script>

<style lang="scss" scoped>
.container {
    -webkit-user-select: none;
    width: 100%;
    // max-width: 200px;
    .dropdown_header {
        padding: 6px 8px;

        border: 2px solid #dfe1f0;

        transition: background-color 0.3s ease;
        cursor: pointer;

        display: flex;
        justify-content: space-between;
        &:hover {
            background-color: #f6f8fd;
        }

        .right_header_item {
            display: flex;
            align-items: center;
            p {
                color: black;
                font-size: 18px;
            }
            .dropdown_selected {
                margin-left: 10px;
                padding-top: 2px;
            }
        }

        svg {
            text-align: right;
            transition: transform 0.4s ease-in-out;
        }
        .open {
            transform: rotateZ(-180deg);
        }
    }

    .dropdown_list {
        border: 2px solid #dfe1f0;
        border-top: 0px;
        transition: background-color 0.2s ease;
        cursor: pointer;
        .dropdown_list_item {
            display: flex;
            padding: 12px 10px;
            &:hover {
                background-color: #f6f8fd;
            }
            p {
                font-size: 18px;
                // margin-top: 6px;
                // margin-left: 20px;
            }
        }
    }
}
</style>
