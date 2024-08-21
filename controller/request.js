import { config } from "../config.js";
import * as requestRepository from "../data/request.js"

export async function requestData(req, res){
    const request = req.query.request;
    const language = req.query.language;

    const data = await requestRepository.request(config.openai.api, request, language);

    return res.json(data);
}