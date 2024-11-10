import "dotenv/config";

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
    apiKey: process.env.CLAUDE_KEY,
});

export const read_pdf = async (text) => {
    const message = await client.messages.create({
        max_tokens: 4096,
        model: "claude-3-haiku-20240307",
        messages: [
            {
                role: "user",
                content:
                    "Here is my resume. I want you to ask me from 1-3 questions if there is some data missing. Nothing beside it. Return only the questions separated by a new line.",
            },
            {
                role: "user",
                content: text,
            },
        ],
    });

    return message;
};

export const rate_jobs = async (jobs, person) => {
    const message = await client.messages.create({
        max_tokens: 4096,
        model: "claude-3-haiku-20240307",
        messages: [
            {
                role: "user",
                content: `
                Rate these jobs offers ${JSON.stringify(
                    jobs
                )} for a person with such characterstic: ${JSON.stringify(
                    person
                )}. The rating should be from 1-10. Return the ratings separated by a new line. Rate how the person fits the job and especcially a company. Return only an array of all objects with the company name, job title and a rating. Count if it is big company or startup, if there are benefits which would suit exact person etc. Example: [{company: "company name", job_title: "job_title", rating: 5}, {company: "company name", job_title: "job_title", rating: 3}]. Return all the job offers. Don't include any addition commments from your side at all - only JSON. Your response is readed by machine
            `,
            },
        ],
    });

    console.log(message.content[0].text);

    return message;
};
