const store = {
    namespaced: true,

    state: {
        chartData: [], // данные из файла
        fileType: "", // "csv", "xlsx", "json"
        error: false, // ошибки загрузки
        columnTypes: {}, // ← НОВОЕ: { "Вік": "number", "Місто": "category", ... }
    },

    getters: {
        getChartData: (state) => state.chartData,
        getFileType: (state) => state.fileType,
        getCharErrors: (state) => state.error,

        // ← Новый геттер
        getColumnTypes: (state) => state.columnTypes,
    },

    mutations: {
        setChartData: (state, data) => {
            state.chartData = data;
        },
        setFileType: (state, fileType) => {
            state.fileType = fileType;
        },
        setError: (state, error) => {
            state.error = error;
        },

        // ← Новая мутация
        SET_COLUMN_TYPES(state, types) {
            state.columnTypes = types;
        },
    },

    actions: {
        setChartDataAction({ commit }, data) {
            commit("setChartData", data);
        },
        setFileTypeAction({ commit }, fileType = "") {
            commit("setFileType", fileType);
        },

        // ← Новый action — используем именно его в ColumnSettings
        setColumnTypesAction({ commit }, types) {
            commit("SET_COLUMN_TYPES", types);
        },

        // Опционально: сброс при новой загрузке файла
        resetChartData({ commit }) {
            commit("setChartData", []);
            commit("setFileType", "");
            commit("SET_COLUMN_TYPES", {}); // очищаем типы при новой загрузке
        },
    },
};

export default store;
