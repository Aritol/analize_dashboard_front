<template>
    <div class="preview_table">
        <!-- <h2>Попередній перегляд даних</h2> -->

        <div class="table-wrapper" v-if="normalizedTable.length">
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th v-for="col in normalizedTable[0]" :key="col">
                                {{ col }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="(row, rowIndex) in normalizedTable.slice(
                                1,
                                51
                            )"
                            :key="rowIndex"
                        >
                            <td v-for="(cell, colIndex) in row" :key="colIndex">
                                {{ cell ?? "" }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <p v-else class="no-data">
            Дані не завантажено або формат не підтримується
        </p>
    </div>
</template>

<script>
export default {
    name: "DataPreviewTable",
    computed: {
        normalizedTable() {
            const data = this.$store.state.charts.chartData;
            const fileType = this.$store.state.charts.fileType;

            if (!data) return [];

            if (fileType === "xlsx") {
                const sheetNames = Object.keys(data);
                return data[sheetNames[0]] || [];
            }

            if (fileType === "json") {
                if (!Array.isArray(data) || !data.length) return [];
                const headers = Object.keys(data[0]);
                return [
                    headers,
                    ...data.map((obj) => headers.map((k) => obj[k] ?? "")),
                ];
            }

            if (fileType === "csv") {
                const headers = data.headers || [];
                const rows = data.data.map((obj) =>
                    headers.map((h) => obj[h] ?? "")
                );
                return [headers, ...rows];
            }

            return [];
        },
    },
};
</script>

<style lang="scss" scoped>
.preview_table {
    margin-top: 60px;
    text-align: center;

    h2 {
        font-size: 32px;
        margin-bottom: 40px;
        font-weight: 600;
        color: #2c3e50;
    }

    .no-data {
        color: #94a3b8;
        font-size: 18px;
        padding: 60px;
    }
}

/* Главная обёртка — фиксированная ширина */
.table-wrapper {
    width: 90%;
    max-width: 1600px;
    margin: 0 auto;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
    background: white;
}

/* Контейнер со скроллом — только горизонтальный */
.table-container {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;

    /* Красивый скроллбар */
    &::-webkit-scrollbar {
        height: 12px;
    }
    &::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 10px;
    }
    &::-webkit-scrollbar-thumb {
        background: #94a3b8;
        border-radius: 10px;
        &:hover {
            background: #64748b;
        }
    }
}

table {
    width: 100%;
    min-width: 1000px;
    border-collapse: separate;
    border-spacing: 0;
    background: white;
}

thead {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: sticky;
    top: 0;
    z-index: 10;
}

th {
    padding: 20px 24px;
    text-align: center;
    font-size: 17px;
    font-weight: 600;
    color: #ffffff;
    letter-spacing: 0.3px;
    white-space: nowrap;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);

    &:not(:last-child)::after {
        content: "";
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        height: 28px;
        width: 1px;
        background: rgba(255, 255, 255, 0.25);
    }
}

tbody tr {
    transition: all 0.22s ease;

    &:nth-child(even) {
        background: #f8fafc;
    }

    &:hover {
        background: #e0f2fe;
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
    }
}

td {
    padding: 16px 24px;
    font-size: 15.5px;
    color: #1e293b;
    text-align: center;
    border-bottom: 1px solid #e2e8f0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
}

tbody tr:last-child td {
    border-bottom: none;
}

.table-wrapper {
    border-radius: 20px;
    overflow: hidden;
}
</style>
