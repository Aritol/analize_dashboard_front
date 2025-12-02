<template>
    <div>
        <div class="container">
            <div class="wrapper">
                <canvas width="800" height="600" id="gistogramChart"> </canvas>
            </div>
        </div>
    </div>
</template>

<script>
import Chart from "chart.js/auto";

export default {
    name: "GistogramChart",

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
            chart: null,
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
        const ctx = document.getElementById("gistogramChart");
        this.chart = new Chart(ctx, {
            type: "bar",
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
                        text: "Гістограма",
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.parsed;
                            },
                        },
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

<style lang="scss" scoped></style>
