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

export async function sendSlotOnTelegram(botkey, subject)
{
    const path = `https://api.telegram.org/${botkey}/sendMessage`;
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