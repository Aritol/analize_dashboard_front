import { createStore } from "vuex";

// import products from "./products";
import auth from "./auth";
import charts from "./charts";

const store = createStore({
    modules: {
        auth,
        charts,
        // message,
        // orders,
    },
});

export default store;
