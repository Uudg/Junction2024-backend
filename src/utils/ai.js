import 'dotenv/config';

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
    apiKey: process.env.CLAUDE_KEY
})

// import OpenAI from "openai";
// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_KEY
// })

const system_prompt = `
    Your task is to generate 6 job descriptions for a field provided. Use real companies names, job title, and job description. The job description should be at least 100 words long. Use local currency for salary. The job title should be at least 3 words long. Find real logo_url. For response return only array of json objects with the following keys: company, job_title, job_description, salary_range (monthly, only values + currency), work_type (On Site, Hybrid, Remote), logo_url. Dont return anything beside JSON array.

`

export const get_job = async (location, query) => {
    const message = await client.messages.create({
        max_tokens: 4096,
        model: 'claude-3-haiku-20240307',
        messages: [
            {
                role: "user",
                content: system_prompt
            },
            {
                role: "user",
                content: `
                    Location: ${location};
                    Field: ${query}.
                `
            }
        ]
    })

    try {
        return JSON.parse(message.content[0].text)
    } catch (error) {
        console.log(error);
        return null
    }
}

// export const get_job = async (location, query) => {
//     try {
//         const response = await openai.chat.completions.create({
//             model: "gpt-4-turbo",

//             temperature: 1,
//             messages: [
//                 {
//                     role: "system",
//                     content: system_prompt
//                 },
//                 {
//                     role: "user",
//                     content: `
//                         Location: ${location};
//                         Field: ${query}.
//                     `
//                 },
//             ]
//         })

//         return response.choices[0].message.content
//     } catch (error) {
//         console.log(error);
//         return null;
//     }
// }