import express, { Application, Request, Response } from 'express';
import fs from 'fs';
import { demoClient, regToken } from './demo_reg_data';
import { albums, artists, genres, languages, records } from './media_data';
var https = require('https');

const apiV = 'api/v1.0';
const identity = `${apiV}/identity`;
const record = `${apiV}/media/record`;
const stream = `${apiV}/media/stream`;

var privateKey = fs.readFileSync(`/etc/ssl/certs/${process.env.CERT_NAME}.key`, 'utf8');
var certificate = fs.readFileSync(`/etc/ssl/certs/${process.env.CERT_NAME}.crt`, 'utf8');

var credentials = { key: privateKey, cert: certificate };
const app: Application = express();
var httpsServer = https.createServer(credentials, app);
process.env.PWD = process.cwd();

httpsServer.listen(process.env.PORT || 3001);
app.use(express.static(process.env.PWD + '/public'));
app.use(express.json());

/// identity ///
app.post(`/${identity}/client/register/:token`, async (request: Request, response: Response) => {
    const token = request.params.token ?? '';
    if (token === regToken) {
        response.status(200)
            .send(demoClient);
        return;
    }
    response.sendStatus(403);
});

app.post(`/${identity}/connect/token`, async (request: Request, response: Response) => {
    response.status(200)
        .send({
            access_token: '142e3d7e-d8c3-48b2-b0b6-3e50eca7e704',
        });
});

app.post(`/${identity}/client/removeRegistration`, async (request: Request, response: Response) => {
    response.status(200)
        .send();
});

/// records ///
app.post(`/${record}/list`, async (request: Request, response: Response) => {
    const data = request.body;

    const filter = request.query['filter'] ?? '';
    let items = records;
    if (filter) {
        items = items.filter(value => value.title.toLowerCase().includes(filter.toString().toLowerCase()))
    }


    if (data.artists && data.artists.length > 0) {
        const far = artists.filter(artist => data.artists.includes(artist.artistId)).map(artist => artist.name);
        items = items.filter(value => value.artist && far.includes(value.artist));
    }

    if (data.albums && data.albums.length > 0) {
        const fal = albums.filter(album => data.albums.includes(album.albumId)).map(album => album.albumName);
        items = items.filter(value => value.album && fal.includes(value.album));
    }

    if (data.genres && data.genres.length > 0) {
        const fge = genres.filter(genre => data.genres.includes(genre.genreId)).map(genre => genre.name);
        items = items.filter(value => value.genre && fge.includes(value.genre));
    }

    if (data.languages && data.languages.length > 0) {
        const fge = languages.filter(language => data.languages.includes(language.languageId)).map(language => language.name);
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
});

app.post(`/${record}/listFolder`, async (request: Request, response: Response) => {
    const data = request.body;

    const filter = request.query['filter'] ?? '';
    let items = records;
    if (filter) {
        items = items.filter(value => value.title.toLowerCase().includes(filter.toString().toLowerCase()))
    }


    if (data.artists && data.artists.length > 0) {
        const far = artists.filter(artist => data.artists.includes(artist.artistId)).map(artist => artist.name);
        items = items.filter(value => value.artist && far.includes(value.artist));
    }

    if (data.albums && data.albums.length > 0) {
        const fal = albums.filter(album => data.albums.includes(album.albumId)).map(album => album.albumName);
        items = items.filter(value => value.album && fal.includes(value.album));
    }

    if (data.genres && data.genres.length > 0) {
        const fge = genres.filter(genre => data.genres.includes(genre.genreId)).map(genre => genre.name);
        items = items.filter(value => value.genre && fge.includes(value.genre));
    }

    if (data.languages && data.languages.length > 0) {
        const fge = languages.filter(language => data.languages.includes(language.languageId)).map(language => language.name);
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
});

app.get(`/${record}/artists`, async (request: Request, response: Response) => {
    const filter = request.query['filter'] ?? '';
    let items = artists;
    if (filter) {
        items = items.filter(value => value.name.toLowerCase().includes(filter.toString().toLowerCase()))
    }
    response.status(200)
        .send({
            items: items,
            totalCount: items.length
        });
});

app.get(`/${record}/albums`, async (request: Request, response: Response) => {
    const filter = request.query['filter'] ?? '';
    let items = albums;
    if (filter) {
        items = items.filter(value => value.albumName.toLowerCase().includes(filter.toString().toLowerCase()))
    }
    response.status(200)
        .send({
            items: items,
            totalCount: items.length
        });
});

app.get(`/${record}/genres`, async (request: Request, response: Response) => {
    const filter = request.query['filter'] ?? '';
    let items = genres;
    if (filter) {
        items = items.filter(value => value.name.toLowerCase().includes(filter.toString().toLowerCase()))
    }
    response.status(200)
        .send({
            items: items,
            totalCount: items.length
        });
});

app.get(`/${record}/languages`, async (request: Request, response: Response) => {
    const filter = request.query['filter'] ?? '';
    let items = languages;
    if (filter) {
        items = items.filter(value => value.name.toLowerCase().includes(filter.toString().toLowerCase()))
    }
    response.status(200)
        .send({
            items: items,
            totalCount: items.length
        });
});

/// stream ///
app.get(`/${stream}/:recordId`, async (request: Request, response: Response) => {
    const record = request.params.recordId ?? '';
    const hash = records.find(elem => elem.recordId === record)?.checksum;
    if (!hash) {
        response.status(404);
        return;
    }
    response.status(200)
        .contentType('audio/mpeg')
        .sendFile(`public/songs/${hash}`, { root: '.' });
});

app.post(`/${stream}/next/:recordId`, async (request: Request, response: Response) => {
    const record = request.params.recordId ?? '';
    const data = request.body;

    const filter = request.query['filter'] ?? '';
    const shuffle = Boolean(((request.query['shuffle']?.toString() ?? false) || "").replace(/\s*(false|null|undefined|0)\s*/i, ""));
    const repeat = Boolean(((request.query['repeat']?.toString() ?? false) || "").replace(/\s*(false|null|undefined|0)\s*/i, ""));

    let items = records;
    if (filter) {
        items = items.filter(value => value.title.toLowerCase().includes(filter.toString().toLowerCase()))
    }

    if (data.artists && data.artists.length > 0) {
        const far = artists.filter(artist => data.artists.includes(artist.artistId)).map(artist => artist.name);
        items = items.filter(value => value.artist && far.includes(value.artist));
    }

    if (data.albums && data.albums.length > 0) {
        const fal = albums.filter(album => data.albums.includes(album.albumId)).map(album => album.albumName);
        items = items.filter(value => value.album && fal.includes(value.album));
    }

    if (data.genres && data.genres.length > 0) {
        const fge = genres.filter(genre => data.genres.includes(genre.genreId)).map(genre => genre.name);
        items = items.filter(value => value.genre && fge.includes(value.genre));
    }

    if (data.languages && data.languages.length > 0) {
        const fge = languages.filter(language => data.languages.includes(language.languageId)).map(language => language.name);
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

});

app.post(`/${stream}/previous/:recordId`, async (request: Request, response: Response) => {
    const record = request.params.recordId ?? '';
    const data = request.body;

    const filter = request.query['filter'] ?? '';
    const shuffle = Boolean(((request.query['shuffle']?.toString() ?? false) || "").replace(/\s*(false|null|undefined|0)\s*/i, ""));
    const repeat = Boolean(((request.query['repeat']?.toString() ?? false) || "").replace(/\s*(false|null|undefined|0)\s*/i, ""));
    let items = records;
    if (filter) {
        items = items.filter(value => value.title.toLowerCase().includes(filter.toString().toLowerCase()))
    }

    if (data.artists && data.artists.length > 0) {
        const far = artists.filter(artist => data.artists.includes(artist.artistId)).map(artist => artist.name);
        items = items.filter(value => value.artist && far.includes(value.artist));
    }

    if (data.albums && data.albums.length > 0) {
        const fal = albums.filter(album => data.albums.includes(album.albumId)).map(album => album.albumName);
        items = items.filter(value => value.album && fal.includes(value.album));
    }

    if (data.genres && data.genres.length > 0) {
        const fge = genres.filter(genre => data.genres.includes(genre.genreId)).map(genre => genre.name);
        items = items.filter(value => value.genre && fge.includes(value.genre));
    }

    if (data.languages && data.languages.length > 0) {
        const fge = languages.filter(language => data.languages.includes(language.languageId)).map(language => language.name);
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
});

/// register homepage ///
app.get('/register', (req: Request, res: Response): void => {
    res.sendFile('./static/register.html', { root: __dirname });
});