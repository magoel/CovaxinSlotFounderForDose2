const fetch = require('node-fetch');
const querystring = require('querystring');
const dateNtime = require('date-and-time');
const sendmail = require('sendmail')();
//////////// Configuration below this line only ///////////////////////////////////////////////////////
const lookupDays = 2;
// const vaccine = "COVISHIELD";
const emailaddr = "manish.dce@gmail.com";
const vaccine = "COVAXIN";
// const vaccine = "COVISHIELD";
const districts = [
    188, /* Gurgaon */
    141, /* Central delhi */
    140, /* New delhi */
    149, /* South delhi */
    144, /* South east delhi */
    150, /* South west delhi */
    142, /* West delhi */
    // 145, /* East delhi */
    // 146, /* North delhi */
    // 147, /* North east delhi */
    // 143, /* North west delhi */
];
function criteria (session) {
    slots = session["available_capacity_dose2"];
    if (session["vaccine"] != vaccine)
        return 0;
    else if (session["min_age_limit"] != 18)
        return 0;
    return slots;
}
//////////// Configuration above this line only ///////////////////////////////////////////////////////

const today = new Date(Date.now());
const Days = (function (curr)
{
    curr.setDate(curr.getDate() + 1);
    let res = [];
    for (let index = 0; index < lookupDays; index++) {
        curr.setDate(curr.getDate() + index);
        const dateStr = dateNtime.format(curr, 'DD-MM-YYYY');
        res.push(dateStr);
    }
    return res;
})(today);

function checkResponseStatus(res) {
    if(res.ok){
        return res
    } else {
        throw new Error(`The HTTP status of the reponse: ${res.status} (${res.statusText})`);
    }
}

async function findByDistrict(district, date) {
    const parameters = {
        district_id: district,
        date: date
    };
    const path = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?' + querystring.stringify(parameters);
    const res = await fetch(path);
    checkResponseStatus(res);
    const data = await res.json()
    return data;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    try {
        for (const day of Days) {
            for (const district of districts) {
                const data = await findByDistrict(district, day);
                data.sessions.forEach(element => {
                    const slots = criteria(element);
                    if (slots) {
                        // send email
                        subject = `Found ${slots} ${vaccine} slots available on ${element.date} @ ${element.name}, ${element.address} Pin-${element.pincode}`;
                        sendSlot(subject);
                        console.log(subject);
                    }
                });
                await sleep(3000);
            }
        }
    }
    catch(err)
    {
        sendSlotOnTeleram(err.toString());
        console.log(err);
    }
    setTimeout(run, 3000);
}
run();

setInterval(()=> console.log("Alive"), 5000);


function sendSlot(subject) {
    sendSlotOnTeleram(subject);
    sendEmailMessage(emailaddr, subject);
}

function sendEmailMessage(emailaddr, subject) {
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

async function sendSlotOnTeleram(subject)
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