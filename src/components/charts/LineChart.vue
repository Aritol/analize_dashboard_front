<template>
    <div>
        <div class="container">
            <div class="wrapper">
                <canvas width="800" height="600" id="lineChart"> </canvas>
            </div>
        </div>
    </div>
</template>

<script>
import Chart from "chart.js/auto";

export default {
    name: "LineChart",
    props: {
        labels: {
            type: Array,
            default: () => [],
        },
        chartData: {
            type: Array,
            default: () => [],
        },
        name: {
            type: String,
            default: "",
        },
    },
    data() {
        return {
            chart: null, // силка на екземпляр графіка
        };
    },
    methods: {
        destroyChart() {
            if (this.chart) {
                this.chart.destroy();
                this.chart = null;
            }
        },
    },
    mounted() {
        const ctx = document.getElementById("lineChart");
        this.chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: this.labels,
                datasets: [
                    {
                        label:
                            this.name && this.name.length
                                ? this.name
                                : "Приклад",
                        data: this.chartData,
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "top",
                    },
                    title: {
                        display: true,
                        text: "Лінійна діаграма",
                    },
                },
            },
        });
    },
    beforeUnmount() {
        this.destroyChart();
    },
};
</script>

<style scoped>
.line-chart-container {
    width: 100%;
    height: 400px;
}
</style>
