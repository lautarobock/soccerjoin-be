const axios = require('axios');

axios.defaults.baseURL = 'https://api.mobile.endomondo.com/mobile';

exports.auth = function(params) {
    return axios.get(`/auth?${params}`).then(response => {
        let data = {};
        response.data.split('\n').forEach(value => data[value.split('=')[0]]=value.split('=')[1]);
        return data;
    });
}

exports.getAccount = function (authToken) {
    return axios.get(`/api/profile/account/get?authToken=${authToken}`).then(response => response.data.data);
}

exports.workoutList = function(authToken) {
    return axios.get(`/api/workout/list?authToken=${authToken}`).then(response => response.data.data);
}

exports.workoutDetail = function(authToken, id) {
    return axios.get(`/api/workout/get?authToken=${authToken}&workoutId=${id}&fields=device,simple,basic,motivation,interval,hr_zones,weather,polyline_encoded_small,points,lcp_count,tagged_users,pictures,feed`).then(response => response.data);
}