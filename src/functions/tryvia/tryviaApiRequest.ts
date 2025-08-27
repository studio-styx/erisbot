import { redis } from "#database";
import { TryviaApiResponseData } from "#types/tryviaApiResponse.js";
import axios from "axios";

export async function tryviaApiRequest(amount: number = 10) {
    try {
        let token = await redis.get("tryviaApiSessionToken");

        if (!token) {
            type ResponseData = {
                response_code: number,
                response_message: string
                token: string | null
            };
            try {
                const tokenResponse = await axios.get('https://tryvia.ptr.red/api_token.php?command=request');
    
                const tokenData = tokenResponse.data as ResponseData;
                token = tokenData.token;
                if (!token) {
                    console.warn("OpenTDB API returned null token.");
                    token = null;
                } else {
                    await redis.setex("tryviaOpenTdbSessionToken", 60 * 60 * 6, token); // 6 horas
                }
            } catch (error) {
                console.error("Error fetching session token from OpenTDB API:", error);
            }
        }

        const response = await axios.get(`https://tryvia.ptr.red/api.php?amount=${amount}&type=multiple${token ? `&token=${token}` : ''}`);

        return response.data as TryviaApiResponseData;
    } catch (error) {
        console.error("Error fetching data from Tryvia API:", error);
        throw error;
    }
}

export async function tryviaOpenTdbRequest(amount: number = 10) {
    try {
        let token = await redis.get("tryviaOpenTdbSessionToken");
        if (!token) {
            type ResponseData = {
                response_code: number,
                response_message: string
                token: string
            };
            try {
                const tokenResponse = await axios.get('https://opentdb.com/api_token.php?command=request');
    
                const tokenData = tokenResponse.data as ResponseData;
                token = tokenData.token;
                await redis.setex("tryviaOpenTdbSessionToken", 60 * 60 * 6, token); // 6 horas
            } catch (error) {
                console.error("Error fetching session token from OpenTDB API:", error);
            }
        }
        const response = await axios.get(`https://opentdb.com/api.php?amount=${amount}&type=multiple${token ? `&token=${token}` : ''}`);
        return response.data as TryviaApiResponseData;
    } catch (error) {
        console.error("Error fetching data from OpenTDB API:", error);
        throw error;
    }
}