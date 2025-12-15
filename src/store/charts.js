const store = {
    namespaced: true,

    state: {
        chartData: [],
        fileType: "",
        error: false,
        columnTypes: {},

        currentMetric: null,
        highlightedRows: [],
        problematicMode: false,
    },

    getters: {
        getChartData: (state) => state.chartData,
        getFileType: (state) => state.fileType,
        getCharErrors: (state) => state.error,

        getColumnTypes: (state) => state.columnTypes,
        currentMetric: (state) => state.currentMetric,
        highlightedRows: (state) => state.highlightedRows,
        isProblematicMode: (state) => state.problematicMode,
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

        SET_COLUMN_TYPES(state, types) {
            state.columnTypes = types;
        },

        SET_CURRENT_METRIC(state, metric) {
            state.currentMetric = metric;
        },
        SET_HIGHLIGHTED_ROWS(state, payload) {
            state.highlightedRows = payload;
        },
        CLEAR_PROBLEMATIC_MODE(state) {
            state.currentMetric = null;
            state.highlightedRows = [];
            state.problematicMode = false;
        },
        SET_PROBLEMATIC_MODE(state, value) {
            state.problematicMode = value;
        },
    },

    actions: {
        setChartDataAction({ commit }, data) {
            commit("setChartData", data);
        },
        setFileTypeAction({ commit }, fileType = "") {
            commit("setFileType", fileType);
        },

        setColumnTypesAction({ commit }, types) {
            commit("SET_COLUMN_TYPES", types);
        },

        resetChartData({ commit }) {
            commit("setChartData", []);
            commit("setFileType", "");
            commit("SET_COLUMN_TYPES", {});
        },

        setCurrentMetric({ commit }, metric) {
            commit("SET_CURRENT_METRIC", metric);
            commit("SET_PROBLEMATIC_MODE", true);
        },

        setHighlightedRows({ commit }, payload) {
            commit("SET_HIGHLIGHTED_ROWS", payload);
        },

        clearProblematicMode({ commit }) {
            commit("CLEAR_PROBLEMATIC_MODE");
        },
        fullReset({ commit }) {
            commit("setChartData", []);
            commit("setFileType", "");
            commit("SET_COLUMN_TYPES", {});
            commit("SET_CURRENT_METRIC", null);
            commit("SET_HIGHLIGHTED_ROWS", []);
            commit("SET_PROBLEMATIC_MODE", false);
        },
    },
};

export default store;
