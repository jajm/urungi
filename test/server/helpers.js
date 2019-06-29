const setCookieParser = require('set-cookie-parser');
const request = require('supertest');

async function login (app, username = 'administrator', password = 'urungi') {
    const res = await request(app).get('/login');
    const cookiesString = res.headers['set-cookie'][0];
    const setCookieHeader = setCookieParser.splitCookiesString(cookiesString);
    const cookies = setCookieParser.parse(setCookieHeader, { map: true });
    const cookie = Object.values(cookies).map(c => c.name + '=' + c.value).join('; ');
    const xsrfToken = cookies['XSRF-TOKEN'].value;
    const headers = {
        'X-XSRF-TOKEN': xsrfToken,
        'Cookie': cookie,
    };

    await request(app).post('/api/login')
        .set(headers)
        .send({ userName: username, password: password });

    return headers;
}

module.exports = {
    login: login,
};
