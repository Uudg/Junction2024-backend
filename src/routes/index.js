import { get_job } from "../utils/ai.js";
import { parseGlassdor } from "../utils/index.js";
import httpProxy from 'http-proxy';

export default async (app, opts) => {

    // app.addHook('onSend', (request, reply, payload, done) => {
    //     reply.header('X-Frame-Options', 'ALLOWALL');
    //     done();
    // });

    const proxy = httpProxy.createProxyServer();

    app.get('/proxy', (req, reply) => {
        const url = req.query.url;
        if (!url) {
            return reply.status(400).send('URL is required');
        }

        proxy.web(req.raw, reply.raw, { target: url }, (err) => {
            reply.status(500).send({ error: err.message });
        });
    });

    app.post('/glassdoor', async (req, res) => {
        const { location, query } = req.body;

        try {
            const jobs = await parseGlassdor(location, query);
            res.send(jobs);
        } catch (e) {
            res.send({ error: e.message });
        }
    });

    app.post('/jobs', async (req, res) => {
        const { location, query } = req.body;

        try {
            const job = await get_job(location, query);
            res.send(job);
        } catch (e) {
            res.send({ error: e.message });
        }
    });

}