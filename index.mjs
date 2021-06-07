import { sleep, sendEmailMessage, sendSlotOnTelegram } from './utils.mjs'
import dateNtime from 'date-and-time';
import cowin from './cowin.mjs';
import { exit } from 'process';

//////////// Configuration below this line only ///////////////////////////////////////////////////////
// const vaccine = "COVISHIELD";
const emailaddr = "manish.dce@gmail.com";
const botkey = 'bot1819640274:AAGKc7yXRN_EFdRXWG_f1iDyvpqBEOr3TWU'; // telegram bot-key
const vaccine = "COVAXIN";
const mobile = 8826664220;
const dose = 2;
// const vaccine = "COVISHIELD";
const districts = [
    188, /* Gurgaon */
    141, /* Central delhi */
    140, /* New delhi */
    149, /* South delhi */
    144, /* South east delhi */
    150, /* South west delhi */
    142, /* West delhi */
    145, /* East delhi */
    146, /* North delhi */
    147, /* North east delhi */
    143, /* North west delhi */
];
function criteria (session) {
    const slots = session["available_capacity_dose2"];
    if (session["vaccine"] != vaccine)
        return 0;
    else if (session["min_age_limit"] != 18)
        return 0;
    return slots;
}
//////////// Configuration above this line only ///////////////////////////////////////////////////////
const telegram = function(msg) {
    return sendSlotOnTelegram(botkey, msg);
};

function sendSlot(subject) {
    telegram(subject);
    // sendEmailMessage(emailaddr, subject);
}

async function run() {
    let beneficiary = null;
    let tokenResponse = null;
    try 
    {
        let tomorrow = new Date(Date.now());
        tomorrow.setDate(tomorrow.getDate()+1);
        tomorrow = dateNtime.format(tomorrow, "DD-MM-YYYY");
        for (const district of districts)
        {
            const data = await cowin.findByDistrict(district, tomorrow);
            for (const center of data.centers)
            {
                for (const session of center.sessions)
                {
                    const slots = criteria(session);
                    if (slots)
                    {
                        // send message
                        const subject = `Found ${slots} ${vaccine} slots available on ${session.date} @ ${center.name}, ${center.address} Pin-${center.pincode}`;
                        sendSlot(subject);
                        console.log(subject);
                        if (!tokenResponse)
                        {
                            telegram("Requesting otp ... look alive");
                            tokenResponse = await cowin.login(mobile);
                            setTimeout(() => { tokenResponse = null; }, 300000);
                        }
                        if (!beneficiary)
                            beneficiary = await cowin.getBeneficiary(tokenResponse.token);
                        session.slots.forEach(async s => {
                            try {
                                const appointment = await cowin.schedule(tokenResponse.token, dose, session, s, beneficiary.beneficiaries[0]);
                                if (!appointment)
                                    return;
                                console.log(appointment);
                                telegram("Appointment booked :-)");
                                exit(0);
                            }
                            catch(err)
                            {
                                console.log(err);
                                tokenResponse = null;
                                throw err;
                            }
                        });
                    }
                }
            }
            await sleep(3000);
        }
    }
    catch(err)
    {
        telegram(err.toString());
        console.log(err);
    }
    setTimeout(run, 3000);
}

(async function () {
    run();
    setInterval(()=> console.log("Alive"), 30000);
    setInterval(()=> telegram("Alive"), 600000);
})();