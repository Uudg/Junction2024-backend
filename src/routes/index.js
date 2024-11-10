import axios from "axios";
// import pdfParse from "pdf-parse";
import { read_pdf, rate_jobs } from "../utils/ai.js";

const url = process.env.API_URL;

export default async (app, opts) => {
    app.get("/questions", async (req, res) => {
        try {
            const { data } = await axios.get(`${url}/questions`);
            res.send(data);
        } catch (error) {
            res.send(error);
        }
    });

    app.post("/answers", async (req, res) => {
        try {
            const { data } = await axios.post(`${url}/assess`, req.body);
            res.send(data);
        } catch (error) {
            res.send(error);
        }
    });

    // app.post("/data", async (req, res) => {
    //     const data = await req.file();
    //     if (!data) {
    //         return res.status(400).send({ error: "File not found" });
    //     }

    //     try {
    //         const pdfBuffer = await data.toBuffer();
    //         const pdfData = await pdfParse(pdfBuffer);

    //         const text = pdfData.text;

    //         const aiResponse = await read_pdf(text);
    //         const messages = aiResponse.content[0].text.split("\n");
    //         return res.send(messages);
    //     } catch (error) {
    //         res.status(500).send({
    //             error: "Failed to parse PDF",
    //             details: error.message,
    //         });
    //     }
    // });

    app.post("/jobs", async (req, res) => {
        const { top_feedback, top_traits, top_jobs, provider, location } =
            req.body;

        try {
            let job_list = [];
            try {
                const jobPromises = top_jobs.map((el) => {
                    return axios.post(`${url}/find_jobs_${provider}`, {
                        country: location.country,
                        city: location.city,
                        role: el,
                        results_wanted: 2,
                    });
                });

                const jobResults = await Promise.all(jobPromises);
                jobResults.forEach((result) => {
                    job_list = job_list.concat(result.data);
                });
            } catch (error) {
                return res.status(500).send({ error: error.message });
            }

            if (job_list.length === 0) {
                return res.send([]);
            }

            const jobs = job_list.map((el) => {
                return {
                    title: el.title,
                    company: el.company,
                };
            });

            const rates = await rate_jobs(jobs, {
                top_feedback,
                top_traits,
                top_jobs,
            });

            try {
                let rated = JSON.parse(rates.content[0].text);
                rated.sort((a, b) => b.rating - a.rating);

                const rankedMap = new Map();
                rated.forEach((rankedJob) => {
                    const key = `${rankedJob.job_title}-${rankedJob.company}`;
                    rankedMap.set(key, rankedJob);
                });

                let updatedJobs = job_list.map((job) => {
                    const key = `${job.title}-${job.company}`;
                    const rankedJob = rankedMap.get(key);
                    if (rankedJob) {
                        return { ...job, rating: rankedJob.rating };
                    }
                    return job;
                });

                updatedJobs.sort((a, b) => b.rating - a.rating);

                res.send(updatedJobs);
            } catch (err) {
                return res.status(500).send({ error: err.message });
            }
        } catch (error) {
            res.send(error);
        }
    });

    app.post("/proxy", async (req, res) => {
        const url = req.query.url || req.body.url;
        if (!url) {
            return res.status(400).send("Missing url parameter");
        }
        try {
            const response = await axios.get(url);
            res.header("Content-Type", response.headers["content-type"]);
            res.send(response.data);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Proxy error");
        }
    });
};
