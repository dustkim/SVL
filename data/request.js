import OpenAI from 'openai';

export async function request(apiKey, request, language = 'English'){

    const openai = new OpenAI({
        apiKey: apiKey,
    });

    const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages : [{
            "role" : "user",
            "content" : `Translate the following korean text to ${language}: '${request}'`
        }]
    });

    return chatCompletion.choices[0].message;
}