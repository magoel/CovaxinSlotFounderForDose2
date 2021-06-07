import fetch from 'node-fetch'
import { sleep, checkResponseStatus } from './utils.mjs'

export default async function sendSlotOnTeleram(subject)
{
    const path = "https://api.telegram.org/bot1819640274:AAGKc7yXRN_EFdRXWG_f1iDyvpqBEOr3TWU/sendMessage";
    const params = new URLSearchParams();
    params.append('chat_id', 1898367952);
    params.append('text', subject);
    try {
        const res = await fetch(path, {method: 'POST', body: params });
        checkResponseStatus(res);
        const data = await res.json()
        return data;
    } catch(err)
    {
        console.log(err)
    }
}