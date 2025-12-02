import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";

axios.defaults.headers["Access-Control-Allow-Origin"] = "*";

axios.interceptors.request.use((config) => {
    const isAuthenticated = store.getters["auth/authorized"];
    if (isAuthenticated) {
        config.headers["Authorization"] =
            "Bearer " + store.getters["auth/getAccessToken"]();
        const userId = store.getters["auth/getUserId"];
        config.headers["user_id"] = userId;
    } else {
        config.headers["Authorization"] = null;
    }
    return config;
});

createApp(App).use(store).use(router).mount("#app");
