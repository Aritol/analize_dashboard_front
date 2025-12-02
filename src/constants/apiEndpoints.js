export default {
    user: {
        login: `${process.env.VUE_APP_API_URL}/users/login`,
        signup: `${process.env.VUE_APP_API_URL}/users/signup`,
        saveImage: `${process.env.VUE_APP_API_URL}/users/saveImage`,
        deleteImage: `${process.env.VUE_APP_API_URL}/users/deleteImage`,
        getUserData: `${process.env.VUE_APP_API_URL}/users/getUserData`,
    },
    admin: {
        callBack: `${process.env.VUE_APP_API_URL}/admin/callBack`,
    },
    reports: {
        saveReport: `${process.env.VUE_APP_API_URL}/reports/saveReport`,
        deleteReport: `${process.env.VUE_APP_API_URL}/reports/deleteReport`,
        getUserReports: `${process.env.VUE_APP_API_URL}/reports/getUserReports`,
        getReport: `${process.env.VUE_APP_API_URL}/reports/getReport`,
    },
};
