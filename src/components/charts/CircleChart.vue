<template>
    <div>
        <div class="container">
            <div class="wrapper">
                <canvas width="800" height="600" id="circleChart"> </canvas>
            </div>
        </div>
    </div>
</template>

<script>
import Chart from "chart.js/auto";

export default {
    name: "CircleChart",

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
    mounted() {
        const ctx = document.getElementById("circleChart");
        new Chart(ctx, {
            type: "doughnut",
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
                        text: "Кругова діаграма",
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
};
</script>

<style lang="scss" scoped></style>
