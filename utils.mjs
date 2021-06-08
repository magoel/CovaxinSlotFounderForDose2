import fetch from 'node-fetch'
import smail from 'sendmail';
const sendmail = smail();

export function checkResponseStatus(res) {
    if(res.ok){
        return res
    } else {
        throw new Error(`The HTTP status of the reponse: ${res.status} (${res.statusText})`);
    }
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export function sendEmailMessage(emailaddr, subject) {
    msg = { 
        from: 'vaccineslotfinder@manishgoel.org',
        to: emailaddr
    };
    msg.subject = subject;
    sendmail(msg, function (err, reply) {
        console.log(err && err.stack)
        console.dir(reply)
    });
}

const cacheBotKeyVschatId = new Map();
async function getTelegramChatId(botKey)
{
    if (cacheBotKeyVschatId.has(botKey))
        return cacheBotKeyVschatId.get(botKey);
    const path = `https://api.telegram.org/${botKey}/getUpdates?offset=0`;
    try {
        const res = await fetch(path, {method: 'GET' });
        checkResponseStatus(res);
        const data = await res.json()
        if (data.ok)
            return data.result[0].message.chat.id;
        else
            throw new Error("telegram-bot getMe call failed");
    } catch(err)
    {
        console.log(err)
    }
}

export async function sendSlotOnTelegram(botkey, subject)
{
    const chat_id = await getTelegramChatId(botkey);
    const path = `https://api.telegram.org/${botkey}/sendMessage`;
    const params = new URLSearchParams();
    params.append('chat_id', chat_id);
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


// (async function(){
//     sendSlotOnTelegram('bot1819640274:AAGKc7yXRN_EFdRXWG_f1iDyvpqBEOr3TWU', "hello");
// })();