"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const demo_reg_data_1 = require("./demo_reg_data");
const media_data_1 = require("./media_data");
var https = require('https');
const apiV = 'api/v';
const identity = `${apiV}1.0/identity`;
const record = `${apiV}2.0/media/record`;
const mediaC = `${apiV}2.0/media`;
const stream = `${apiV}2.0/media/stream`;
// var privateKey = fs.readFileSync(`/etc/ssl/certs/${process.env.CERT_NAME}.key`, 'utf8');
// var certificate = fs.readFileSync(`/etc/ssl/certs/${process.env.CERT_NAME}.crt`, 'utf8');
var privateKey = fs_1.default.readFileSync(`D:\\certs\\dev.key`, 'utf8');
var certificate = fs_1.default.readFileSync(`D:\\certs\\dev.crt`, 'utf8');
var credentials = { key: privateKey, cert: certificate };
const app = (0, express_1.default)();
var httpsServer = https.createServer(credentials, app);
process.env.PWD = process.cwd();
httpsServer.listen(process.env.PORT || 3001);
app.use(express_1.default.static(process.env.PWD + '/public'));
app.use(express_1.default.json());
/// identity ///
app.post(`/${identity}/client/register/:token`, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = request.params.token) !== null && _a !== void 0 ? _a : '';
    if (token === demo_reg_data_1.regToken) {
        response.status(200)
            .send(demo_reg_data_1.demoClient);
        return;
    }
    response.sendStatus(403);
}));
app.post(`/${identity}/connect/token`, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    response.status(200)
        .send({
        access_token: '142e3d7e-d8c3-48b2-b0b6-3e50eca7e704',
    });
}));
app.post(`/${identity}/client/removeRegistration`, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    response.status(200)
        .send();
}));
/// records ///
app.post(`/${record}/list`, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const data = request.body;
    const filter = (_b = request.query['filter']) !== null && _b !== void 0 ? _b : '';
    let items = media_data_1.records;
    if (filter) {
        items = items.filter(value => value.title.toLowerCase().includes(filter.toString().toLowerCase()));
    }
    if (data.artists && data.artists.length > 0) {
        const far = media_data_1.artists.filter(artist => data.artists.includes(artist.artistId)).map(artist => artist.name);
        items = items.filter(value => value.artist && far.includes(value.artist));
    }
    if (data.albums && data.albums.length > 0) {
        const fal = media_data_1.albums.filter(album => data.albums.includes(album.albumId)).map(album => album.albumName);
        items = items.filter(value => value.album && fal.includes(value.album));
    }
    if (data.genres && data.genres.length > 0) {
        const fge = media_data_1.genres.filter(genre => data.genres.includes(genre.genreId)).map(genre => genre.name);
        items = items.filter(value => value.genre && fge.includes(value.genre));
    }
    if (data.languages && data.languages.length > 0) {
        const fge = media_data_1.languages.filter(language => data.languages.includes(language.languageId)).map(language => language.name);
        items = items.filter(value => value.language && fge.includes(value.language));
    }
    if (data.startDate && data.endDate) {
        items = items.filter(value => data.startDate.split('T')[0] <= value.date.split('T')[0] && value.date.split('T')[0] <= data.endDate.split('T')[0]);
    }
    response.status(200)
        .send({
        items: items,
        totalCount: items.length
    });
}));
app.post(`/${record}/listFolder`, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const data = request.body;
    const filter = (_c = request.query['filter']) !== null && _c !== void 0 ? _c : '';
    let items = media_data_1.records;
    if (filter) {
        items = items.filter(value => value.title.toLowerCase().includes(filter.toString().toLowerCase()));
    }
    if (data.artists && data.artists.length > 0) {
        const far = media_data_1.artists.filter(artist => data.artists.includes(artist.artistId)).map(artist => artist.name);
        items = items.filter(value => value.artist && far.includes(value.artist));
    }
    if (data.albums && data.albums.length > 0) {
        const fal = media_data_1.albums.filter(album => data.albums.includes(album.albumId)).map(album => album.albumName);
        items = items.filter(value => value.album && fal.includes(value.album));
    }
    if (data.genres && data.genres.length > 0) {
        const fge = media_data_1.genres.filter(genre => data.genres.includes(genre.genreId)).map(genre => genre.name);
        items = items.filter(value => value.genre && fge.includes(value.genre));
    }
    if (data.languages && data.languages.length > 0) {
        const fge = media_data_1.languages.filter(language => data.languages.includes(language.languageId)).map(language => language.name);
        items = items.filter(value => value.language && fge.includes(value.language));
    }
    if (data.startDate && data.endDate) {
        items = items.filter(value => data.startDate.split('T')[0] <= value.date.split('T')[0] && value.date.split('T')[0] <= data.endDate.split('T')[0]);
    }
    const dateFilterSet = data.startDate && data.endDate;
    const isYearFilter = !dateFilterSet;
    const isMonthFilter = dateFilterSet && data.startDate.split('-')[0] == data.endDate.split('-')[0] && data.startDate.split('-')[1] != data.endDate.split('-')[1];
    const isDayFilter = dateFilterSet && data.startDate.split('-')[1] == data.endDate.split('-')[1];
    const unique = [...new Set(items.map(item => item.date.split('T')[0]))];
    const folder = unique.map(item => ({
        year: isYearFilter ? +(item.split('-')[0]) : +(data.startDate.split('-')[0]),
        month: isMonthFilter ? +(item.split('-')[1]) : isDayFilter ? +(data.startDate.split('-')[1]) : null,
        day: isDayFilter ? +(item.split('-')[2]) : null
    }));
    response.status(200)
        .send({
        items: folder,
        totalCount: folder.length
    });
}));
app.get(`/${mediaC}/artist/artists`, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const filter = (_d = request.query['filter']) !== null && _d !== void 0 ? _d : '';
    let items = media_data_1.artists;
    if (filter) {
        items = items.filter(value => value.name.toLowerCase().includes(filter.toString().toLowerCase()));
    }
    response.status(200)
        .send({
        items: items,
        totalCount: items.length
    });
}));
app.get(`/${mediaC}/album/albums`, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const filter = (_e = request.query['filter']) !== null && _e !== void 0 ? _e : '';
    let items = media_data_1.albums;
    if (filter) {
        items = items.filter(value => value.albumName.toLowerCase().includes(filter.toString().toLowerCase()));
    }
    response.status(200)
        .send({
        items: items,
        totalCount: items.length
    });
}));
app.get(`/${mediaC}/genre/genres`, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    const filter = (_f = request.query['filter']) !== null && _f !== void 0 ? _f : '';
    let items = media_data_1.genres;
    if (filter) {
        items = items.filter(value => value.name.toLowerCase().includes(filter.toString().toLowerCase()));
    }
    response.status(200)
        .send({
        items: items,
        totalCount: items.length
    });
}));
app.get(`/${mediaC}/language/languages`, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    const filter = (_g = request.query['filter']) !== null && _g !== void 0 ? _g : '';
    let items = media_data_1.languages;
    if (filter) {
        items = items.filter(value => value.name.toLowerCase().includes(filter.toString().toLowerCase()));
    }
    response.status(200)
        .send({
        items: items,
        totalCount: items.length
    });
}));
/// stream ///
app.get(`/${stream}/:recordId`, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _h, _j, _k;
    const record = (_j = (_h = request.params.recordId) === null || _h === void 0 ? void 0 : _h.split('.').slice(0, -1).join('.')) !== null && _j !== void 0 ? _j : '';
    console.log(record);
    const hash = (_k = media_data_1.records.find(elem => elem.recordId === record)) === null || _k === void 0 ? void 0 : _k.checksum;
    if (!hash) {
        response.status(404);
        return;
    }
    response.status(200)
        .contentType('audio/mpeg')
        .sendFile(`public/songs/${hash}`, { root: '.' });
}));
app.post(`/${stream}/next/:recordId`, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _l, _m, _o, _p, _q, _r;
    const record = (_l = request.params.recordId) !== null && _l !== void 0 ? _l : '';
    const data = request.body;
    const filter = (_m = request.query['filter']) !== null && _m !== void 0 ? _m : '';
    const shuffle = Boolean((((_p = (_o = request.query['shuffle']) === null || _o === void 0 ? void 0 : _o.toString()) !== null && _p !== void 0 ? _p : false) || "").replace(/\s*(false|null|undefined|0)\s*/i, ""));
    const repeat = Boolean((((_r = (_q = request.query['repeat']) === null || _q === void 0 ? void 0 : _q.toString()) !== null && _r !== void 0 ? _r : false) || "").replace(/\s*(false|null|undefined|0)\s*/i, ""));
    let items = media_data_1.records;
    if (filter) {
        items = items.filter(value => value.title.toLowerCase().includes(filter.toString().toLowerCase()));
    }
    if (data.artists && data.artists.length > 0) {
        const far = media_data_1.artists.filter(artist => data.artists.includes(artist.artistId)).map(artist => artist.name);
        items = items.filter(value => value.artist && far.includes(value.artist));
    }
    if (data.albums && data.albums.length > 0) {
        const fal = media_data_1.albums.filter(album => data.albums.includes(album.albumId)).map(album => album.albumName);
        items = items.filter(value => value.album && fal.includes(value.album));
    }
    if (data.genres && data.genres.length > 0) {
        const fge = media_data_1.genres.filter(genre => data.genres.includes(genre.genreId)).map(genre => genre.name);
        items = items.filter(value => value.genre && fge.includes(value.genre));
    }
    if (data.languages && data.languages.length > 0) {
        const fge = media_data_1.languages.filter(language => data.languages.includes(language.languageId)).map(language => language.name);
        items = items.filter(value => value.language && fge.includes(value.language));
    }
    if (data.startDate && data.endDate) {
        items = items.filter(value => data.startDate.split('T')[0] <= value.date.split('T')[0] && value.date.split('T')[0] <= data.endDate.split('T')[0]);
    }
    var count = items.length;
    if (count == 0) {
        response.status(200).send(null);
        return;
    }
    // If shuffle, then the result is randomized take one random value from list
    if (shuffle) {
        response.status(200).send(items[Math.floor(Math.random() * items.length)]);
        return;
    }
    // If actual record is not in result, then filter has changed, start from beginning.
    if (items.find(value => value.recordId === record) == null) {
        response.status(200).send(items.pop());
        return;
    }
    // Skip all elements until id reached. Take the expected value. If previous is expected the query will be reversed.
    // If only the actualId is in result, the end or beginning has been reached.
    // Return null if no repeat is set, else return the first elemtn if we want to get tjhe next value, else get the last element.
    var actualIndex = items.findIndex(value => value.recordId === record);
    if (actualIndex === -1) {
        response.status(200).send(null);
        return;
    }
    if (actualIndex === (items.length - 1)) {
        response.status(200).send(repeat ? items[0] : null);
        return;
    }
    response.status(200).send(items[actualIndex + 1]);
}));
app.post(`/${stream}/previous/:recordId`, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _s, _t, _u, _v, _w, _x;
    const record = (_s = request.params.recordId) !== null && _s !== void 0 ? _s : '';
    const data = request.body;
    const filter = (_t = request.query['filter']) !== null && _t !== void 0 ? _t : '';
    const shuffle = Boolean((((_v = (_u = request.query['shuffle']) === null || _u === void 0 ? void 0 : _u.toString()) !== null && _v !== void 0 ? _v : false) || "").replace(/\s*(false|null|undefined|0)\s*/i, ""));
    const repeat = Boolean((((_x = (_w = request.query['repeat']) === null || _w === void 0 ? void 0 : _w.toString()) !== null && _x !== void 0 ? _x : false) || "").replace(/\s*(false|null|undefined|0)\s*/i, ""));
    let items = media_data_1.records;
    if (filter) {
        items = items.filter(value => value.title.toLowerCase().includes(filter.toString().toLowerCase()));
    }
    if (data.artists && data.artists.length > 0) {
        const far = media_data_1.artists.filter(artist => data.artists.includes(artist.artistId)).map(artist => artist.name);
        items = items.filter(value => value.artist && far.includes(value.artist));
    }
    if (data.albums && data.albums.length > 0) {
        const fal = media_data_1.albums.filter(album => data.albums.includes(album.albumId)).map(album => album.albumName);
        items = items.filter(value => value.album && fal.includes(value.album));
    }
    if (data.genres && data.genres.length > 0) {
        const fge = media_data_1.genres.filter(genre => data.genres.includes(genre.genreId)).map(genre => genre.name);
        items = items.filter(value => value.genre && fge.includes(value.genre));
    }
    if (data.languages && data.languages.length > 0) {
        const fge = media_data_1.languages.filter(language => data.languages.includes(language.languageId)).map(language => language.name);
        items = items.filter(value => value.language && fge.includes(value.language));
    }
    if (data.startDate && data.endDate) {
        items = items.filter(value => data.startDate.split('T')[0] <= value.date.split('T')[0] && value.date.split('T')[0] <= data.endDate.split('T')[0]);
    }
    var count = items.length;
    if (count == 0) {
        response.status(200).send(null);
        return;
    }
    // If shuffle, then the result is randomized take one random value from list
    if (shuffle) {
        response.status(200).send(items[Math.floor(Math.random() * items.length)]);
        return;
    }
    // If actual record is not in result, then filter has changed, start from beginning.
    if (items.find(value => value.recordId === record) == null) {
        response.status(200).send(items.pop());
        return;
    }
    // Skip all elements until id reached. Take the expected value. If previous is expected the query will be reversed.
    // If only the actualId is in result, the end or beginning has been reached.
    // Return null if no repeat is set, else return the first elemtn if we want to get tjhe next value, else get the last element.
    var actualIndex = items.findIndex(value => value.recordId === record);
    if (actualIndex === -1) {
        response.status(200).send(null);
        return;
    }
    if (actualIndex === 0) {
        response.status(200).send(repeat ? items[items.length - 1] : null);
        return;
    }
    response.status(200).send(items[actualIndex - 1]);
}));
/// register homepage ///
app.get('/register', (req, res) => {
    res.sendFile('./static/register.html', { root: __dirname });
});
