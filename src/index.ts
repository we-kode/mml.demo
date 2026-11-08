import express, { Request, Response } from 'express';
import fs from 'fs';
import https from 'https';
import { demoClient, regToken } from './demo_reg_data';
import { albums, artists, genres, languages, records } from './media_data';

type Record = typeof records[number];

// The app calls most routes without a version segment, e.g. /api/media/record/list.
const identity = (path: string) => `/api{/:version}/identity/${path}`;
const media = (path: string) => `/api{/:version}/media/${path}`;

const credentials = {
    key: fs.readFileSync(`/etc/ssl/certs/${process.env.CERT_NAME}.key`, 'utf8'),
    cert: fs.readFileSync(`/etc/ssl/certs/${process.env.CERT_NAME}.crt`, 'utf8'),
};

const app = express();
app.use(express.static('public'));
app.use(express.json());
https.createServer(credentials, app).listen(process.env.PORT || 3001);

const day = (date: string) => date.split('T')[0];
const flag = (value: unknown) => /^(true|1)$/i.test(value?.toString().trim() ?? '');
const page = <T>(items: T[]) => ({ items, totalCount: items.length });
const byFilter = <T>(items: T[], name: (item: T) => string, filter: unknown) =>
    filter ? items.filter(item => name(item).toLowerCase().includes(filter.toString().toLowerCase())) : items;

function namesOf<T>(source: T[], idOf: (item: T) => string, nameOf: (item: T) => string, ids?: string[], names?: string[]) {
    return [...source.filter(item => ids?.includes(idOf(item))).map(nameOf), ...(names ?? [])];
}

function filterRecords(request: Request): Record[] {
    const data = request.body ?? {};
    let items = byFilter(records, record => record.title, request.query.filter);
    const tags: [keyof Record, string[]][] = [
        ['artist', namesOf(artists, a => a.artistId, a => a.name, data.artists, data.artistNames)],
        ['album', namesOf(albums, a => a.albumId, a => a.albumName, data.albums, data.albumNames)],
        ['genre', namesOf(genres, g => g.genreId, g => g.name, data.genres, data.genreNames)],
        ['language', namesOf(languages, l => l.languageId, l => l.name, data.languages)],
    ];
    for (const [key, names] of tags) {
        if (names.length > 0) {
            items = items.filter(record => names.includes(record[key] as string));
        }
    }

    if (data.startDate && data.endDate) {
        items = items.filter(record => day(data.startDate) <= day(record.date) && day(record.date) <= day(data.endDate));
    }

    return items;
}

function mostCommon(values: (string | undefined)[]) {
    const counts = new Map<string, number>();
    values.forEach(value => value && counts.set(value, (counts.get(value) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([value]) => value);
}

/// identity ///
app.post(identity('client/register/:token'), (request: Request, response: Response) => {
    if (request.params.token === regToken) {
        response.status(200).send(demoClient);
        return;
    }
    response.sendStatus(403);
});

app.post(identity('connect/token'), (_request: Request, response: Response) => {
    response.status(200).send({ access_token: '142e3d7e-d8c3-48b2-b0b6-3e50eca7e704' });
});

app.post(identity('client/removeRegistration'), (_request: Request, response: Response) => {
    response.sendStatus(200);
});

/// records ///
app.post(media('record/list'), (request: Request, response: Response) => {
    response.status(200).send(page(filterRecords(request)));
});

app.post(media('record/listFolder'), (request: Request, response: Response) => {
    const data = request.body ?? {};
    const items = filterRecords(request);
    const dateFilterSet = data.startDate && data.endDate;
    const isMonthFilter = dateFilterSet && data.startDate.split('-')[0] == data.endDate.split('-')[0] && data.startDate.split('-')[1] != data.endDate.split('-')[1];
    const isDayFilter = dateFilterSet && data.startDate.split('-')[1] == data.endDate.split('-')[1];

    const folder = [...new Set(items.map(item => day(item.date)))].map(item => ({
        year: dateFilterSet ? +(data.startDate.split('-')[0]) : +(item.split('-')[0]),
        month: isMonthFilter ? +(item.split('-')[1]) : isDayFilter ? +(data.startDate.split('-')[1]) : null,
        day: isDayFilter ? +(item.split('-')[2]) : null,
    }));

    response.status(200).send(page(folder));
});

app.post(media('record/check'), (request: Request, response: Response) => {
    const checksums: string[] = Array.isArray(request.body) ? request.body : [];
    response.status(200).send(records.filter(record => checksums.includes(record.checksum)));
});

app.get(media('record/cover/:fileName'), (request: Request, response: Response) => {
    const fileName = request.params.fileName as string;
    if (!/^[A-Za-z0-9_-]{16}\.jpg$/.test(fileName) || !records.some(record => record.cover === fileName)) {
        response.sendStatus(404);
        return;
    }
    response.status(200).contentType('image/jpeg').sendFile(`public/covers/${fileName}`, { root: '.' });
});

app.get(media('record/:recordId'), (request: Request, response: Response) => {
    const record = records.find(record => record.recordId === request.params.recordId);
    if (!record) {
        response.sendStatus(404);
        return;
    }
    response.status(200).send(record);
});

/// tags ///
app.get(media('artist/artists'), (request: Request, response: Response) => {
    response.status(200).send(page(byFilter(artists, artist => artist.name, request.query.filter)));
});

app.get(media('artist/newestArtists'), (_request: Request, response: Response) => {
    const newest = [...new Set(records.toSorted((a, b) => b.date.localeCompare(a.date)).map(record => record.artist))];
    response.status(200).send(page(artists.filter(artist => newest.includes(artist.name))
        .sort((a, b) => newest.indexOf(a.name) - newest.indexOf(b.name))));
});

app.get(media('artist/commonArtists'), (_request: Request, response: Response) => {
    const common = mostCommon(records.map(record => record.artist));
    response.status(200).send(page(common.map(name => artists.find(artist => artist.name === name)).filter(artist => artist)));
});

app.get(media('album/albums'), (request: Request, response: Response) => {
    response.status(200).send(page(byFilter(albums, album => album.albumName, request.query.filter)));
});

app.get(media('genre/genres'), (request: Request, response: Response) => {
    response.status(200).send(page(byFilter(genres, genre => genre.name, request.query.filter)));
});

app.get(media('genre/commonGenres'), (_request: Request, response: Response) => {
    const common = mostCommon(records.map(record => record.genre));
    response.status(200).send(page(common.map(name => genres.find(genre => genre.name === name)).filter(genre => genre)));
});

app.get(media('language/languages'), (request: Request, response: Response) => {
    response.status(200).send(page(byFilter(languages, language => language.name, request.query.filter)));
});

/// stream ///
app.get(media('stream/:recordId'), (request: Request, response: Response) => {
    const recordId = (request.params.recordId as string).replace(/\.[^.]*$/, '');
    const hash = records.find(record => record.recordId === recordId)?.checksum;
    if (!hash) {
        response.sendStatus(404);
        return;
    }
    response.status(200).contentType('audio/mpeg').sendFile(`public/songs/${hash}`, { root: '.' });
});

app.post(media('stream/:direction/:recordId'), (request: Request, response: Response) => {
    const next = request.params.direction === 'next';
    if (!next && request.params.direction !== 'previous') {
        response.sendStatus(404);
        return;
    }

    const items = filterRecords(request);
    if (items.length == 0) {
        response.status(200).send(null);
        return;
    }

    if (flag(request.query.shuffle)) {
        response.status(200).send(items[Math.floor(Math.random() * items.length)]);
        return;
    }

    // If the actual record is not in the result, the filter has changed, so start from the beginning.
    const actualIndex = items.findIndex(record => record.recordId === request.params.recordId);
    if (actualIndex === -1) {
        response.status(200).send(items[0]);
        return;
    }

    const index = actualIndex + (next ? 1 : -1);
    if (index < 0 || index >= items.length) {
        const repeat = flag(request.query.repeat);
        response.status(200).send(repeat ? items.at(next ? 0 : -1) : null);
        return;
    }

    response.status(200).send(items[index]);
});

/// register homepage ///
app.get('/register', (_request: Request, response: Response) => {
    response.sendFile('src/static/register.html', { root: '.' });
});
