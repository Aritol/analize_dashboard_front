<template>
    <div class="preview_table">
        <h2>Попередній перегляд даних</h2>

        <table v-if="normalizedTable.length">
            <thead>
                <tr>
                    <th v-for="col in normalizedTable[0]" :key="col">
                        {{ col }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="(row, rowIndex) in normalizedTable.slice(1)"
                    :key="rowIndex"
                >
                    <td v-for="(cell, colIndex) in row" :key="colIndex">
                        {{ cell }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
    name: "dataPreviewTable",
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
                    ...data.map((obj) => headers.map((k) => obj[k])),
                ];
            }

            if (fileType === "csv") {
                const headers = data.headers;
                const rows = data.data.map((obj) => headers.map((h) => obj[h]));
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
        margin-bottom: 30px;
        font-weight: 600;
        color: #2c3e50;
        letter-spacing: -0.5px;
    }

    table {
        margin: 0 auto;
        width: 95%;
        max-width: 1400px;
        border-collapse: separate;
        border-spacing: 0;
        background: #fff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        font-family: "Roboto", "Segoe UI", sans-serif;
    }

    thead {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    th {
        padding: 20px 24px;
        text-align: center;
        font-size: 18px;
        font-weight: 600;
        color: #ffffff;
        letter-spacing: 0.3px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        position: relative;

        &:not(:last-child)::after {
            content: "";
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            height: 24px;
            width: 1px;
            background: rgba(255, 255, 255, 0.2);
        }
    }

    tbody tr {
        transition: all 0.25s ease;

        &:nth-child(even) {
            background: #f8fafc;
        }
        &:hover {
            background: #e6f0ff;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
    }

    td {
        padding: 16px 24px;
        font-size: 16px;
        color: #2d3748;
        text-align: center;
        border-bottom: 1px solid #edf2f7;
    }

    tbody tr:last-child td {
        border-bottom: none;
    }

    thead th:first-child {
        border-top-left-radius: 16px;
    }
    thead th:last-child {
        border-top-right-radius: 16px;
    }
    tbody tr:last-child td:first-child {
        border-bottom-left-radius: 16px;
    }
    tbody tr:last-child td:last-child {
        border-bottom-right-radius: 16px;
    }
}
</style>
