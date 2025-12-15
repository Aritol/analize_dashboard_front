<template>
    <div>
        <div class="step_two">
            <div class="header">
                <h1>Оберіть тип графіку для відображення</h1>
            </div>
            <div class="graphics_container" v-if="!selectedDiagramType">
                <h1>Типи графіків</h1>
                <div class="graphics_container_wrapper">
                    <div class="row" @click="selectDiagramType('gistogram')">
                        <div class="graphic">
                            <div class="img_container">
                                <img
                                    src="../../../assets/images/gistogram.png"
                                    alt=""
                                />
                            </div>
                            <p>Гістограма</p>
                        </div>
                    </div>
                    <div
                        class="row"
                        @click="selectDiagramType('circleDiagram')"
                    >
                        <div class="graphic">
                            <div class="img_container">
                                <img
                                    style="width: 295px"
                                    src="../../../assets/images/circle_diagram.png"
                                    alt=""
                                />
                            </div>

                            <p>Кругова діаграма</p>
                        </div>
                    </div>
                    <div
                        class="row"
                        @click="selectDiagramType('linearDiagram')"
                    >
                        <div class="graphic">
                            <div class="img_container">
                                <img
                                    style="width: 295px"
                                    src="../../../assets/images/linear_gistogram.png"
                                    alt=""
                                />
                            </div>

                            <p>Лінійна діаграма</p>
                        </div>
                    </div>
                </div>
            </div>
            <!-- <div v-if="selectedDiagramType">
                <circle-diagram
                    v-if="selectedDiagramType === 'circleDiagram'"
                />
                <linear-diagram
                    v-if="selectedDiagramType === 'linearDiagram'"
                />
            </div> -->
        </div>
    </div>
</template>

<script>
// import CircleDiagram from "@/pages/DiagramPages/circleDiagram.vue";
// import LinearDiagram from "@/pages/DiagramPages/linearDiagram.vue";
export default {
    name: "DataVisualizationPreview",
    components: {
        // CircleDiagram,
        // LinearDiagram,
    },
    data() {
        return {
            selectedDiagramType: "",
        };
    },
    methods: {
        selectDiagramType(type) {
            console.log(type);

            this.selectedDiagramType = type;
            this.$router.push({ name: type });
        },
    },
};
</script>

<style lang="scss" scoped>
.step_two {
    text-align: center;
    .header {
        font-size: 40px;
    }
}
.graphics_container {
    margin-top: 50px;
    h1 {
        font-size: 30px;
    }
}
.graphics_container_wrapper {
    margin-top: 30px;
    display: flex;
    justify-content: space-evenly;
}
.row {
    cursor: pointer;
    transition: all, 0.3s ease-in-out;

    &:hover {
        box-shadow: 1px 1px #959c98, 2px 2px #959c98, 3px 3px#959c98,
            4px 4px #959c98, 5px 5px #959c98, 6px 6px#959c98, 7px 7px #959c98;
        -webkit-transform: translateX(-7px);
        transform: translateX(-7px);
    }
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.15);
    border: 2px solid #e4e4e4;
    p {
        border-top: 2px solid #e4e4e4;
        font-size: 30px;
        padding-top: 30px;
        padding-bottom: 20px;
    }
}
.img_container {
    margin: 50px 100px;
}

.info_container {
    border-top: 1px solid #dadce0;
    padding: 20px;
    font-size: 24px;
    color: #3c4043;
    h1 {
        font-weight: bold;
    }
    p {
        color: #888;
    }
}
</style>
