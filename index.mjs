import { sleep, checkResponseStatus } from './utils.mjs'
import dateNtime from 'date-and-time';
import smail from 'sendmail';
import cowin from './cowin.mjs';
import { exit } from 'process';
import sendSlotOnTeleram  from './sendOnTelegram.mjs'
const sendmail = smail();

//////////// Configuration below this line only ///////////////////////////////////////////////////////
// const vaccine = "COVISHIELD";
const emailaddr = "manish.dce@gmail.com";
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
                            sendSlotOnTeleram("Requesting otp ... look alive");
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
                                sendSlotOnTeleram("Appointment booked :-)");
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
        sendSlotOnTeleram(err.toString());
        console.log(err);
    }
    setTimeout(run, 3000);
}

(async function () {
    run();
    setInterval(()=> console.log("Alive"), 30000);
    setInterval(()=> sendSlotOnTeleram("Alive"), 600000);
})();


function sendSlot(subject) {
    sendSlotOnTeleram(subject);
    // sendEmailMessage(emailaddr, subject);
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
