<template>
    <div>
        <div class="content_container">
            <div class="top_container">
                <h1>Почати легко!</h1>
            </div>
            <div class="middle_container">
                <p>
                    Швидка аналітика за допомогою зручного UX та інтегрованих
                    інструментів, які дозволять вашій компанії досліджувати дані
                    самостійно.
                </p>
                <button @click="start">Почати</button>
            </div>
            <div class="bottom_container">
                <img src="@/assets/images/dashboard_main.png" alt="" />
                <p>Довіряють більше 100.000 користувачів</p>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
    name: "HomePage",
    computed: {
        ...mapGetters("auth", ["authorized"]),
        isAuthorized() {
            return this.authorized;
        },
    },
    methods: {
        start() {
            if (this.isAuthorized) {
                this.$router.push({ name: "newReportPage" });
            } else {
                this.$router.push({ name: "loginPage" });
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.content_container {
    font-family: Lato, "Helvetica Neue", Helvetica, sans-serif;
    text-align: center;
    background: linear-gradient(0deg, #fff 0%, #fafbfe 100%);
}

.top_container {
    padding-top: 150px;
    h1 {
        font-size: 40px;
        font-weight: 700;
    }
}

.middle_container {
    max-width: 840px;
    margin: 24px auto;
    p {
        font-size: 26px;
        color: #5a6072;
        // font-size: 1.25rem;
        line-height: 1.4;
    }
    button {
        margin-top: 18px;
        font-size: 28px;
        padding: 12px 40px;
        color: #fff;
        background-color: #509ee3;
        border-color: #509ee3;
        border-radius: 10px;
        transition: background-color 0.3s ease, color 0.3s ease,
            border 0.3s ease;
        &:hover {
            background-color: #1c6bb0;
        }
    }
}

.bottom_container {
    margin-top: 80px;
    text-align: center;

    img {
        width: 850px;
        border-radius: 30px;
    }

    p {
        margin: 20px auto;
        font-size: 20px;
        font-weight: 500;
        max-width: 370px;

        padding-bottom: 3px;
        border-bottom: 1px solid #000; /* Линия под текстом */
    }
    padding-bottom: 20px;
}
</style>
