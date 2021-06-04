const fetch = require('node-fetch');
const querystring = require('querystring');
const datelib = require('date-and-time');

//////////// Configuration below this line only ///////////////////////////////////////////////////////
const lookupDays = 3;
const vaccine = "COVISHIELD";
const emailaddr = "manish.dce@gmail.com";
// const vaccine = "COVAXIN";
const districts = [
    188, /* Gurgaon */
    141, /* Central delhi */
    145, /* East delhi */
    146, /* North delhi */
    147, /* North east delhi */
    143, /* North west delhi */
    149, /* South delhi */
    144, /* South east delhi */
    150  /* South west delhi */
];
function criteria (session) {
    if (session["available_capacity_dose2"] <= 0)
        return false;
    else if (session["vaccine"] == vaccine)
        return true;
    else
        return false;
}
//////////// Configuration above this line only ///////////////////////////////////////////////////////

const today = new Date(Date.now());
function Days(today)
{
    let res = [];
    for (let index = 0; index < lookupDays; index++) {
        today.setDate(today.getDate() + index);
        const dateStr = datelib.format(today, 'DD-MM-YYYY');
        res.push(dateStr);
    }
    return res;
}

function checkResponseStatus(res) {
    if(res.ok){
        return res
    } else {
        throw new Error(`The HTTP status of the reponse: ${res.status} (${res.statusText})`);
    }
}

async function findByDistrict(district, date) {
    const parameters = {
        district_id : district,
        date : date
    };
    const path = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?' + querystring.stringify(parameters);
    try {
        const res = await fetch(path);
        checkResponseStatus(res);
        const data = await res.json()
        return data;
    } catch(err)
    {
        console.log(err)
    }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async function () {
    for (const district of districts) {
        for (const day of Days(today)) {
            const data = await findByDistrict(district, day);
            data.sessions.forEach(element => {
                if (criteria(element))
                {
                    // send email
                    console.log("FOUND");
                }
            });
            await sleep(3000);
        }
    }
})();