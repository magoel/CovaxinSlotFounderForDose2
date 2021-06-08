import getOtp from './otp.mjs';
import querystring from 'querystring';
import fetch from 'node-fetch';
import { createHash } from 'crypto';
import { checkResponseStatus } from './utils.mjs'


async function findByDistrict(district, date) {
    const parameters = {
        district_id: district,
        date: date
    };
    const path = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?' + querystring.stringify(parameters);
    const res = await fetch(path);
    checkResponseStatus(res);
    const data = await res.json()
    return data;
}

async function generateOtp(mobile)
{
    const path = "https://cdn-api.co-vin.in/api/v2/auth/generateMobileOTP";
    const params = {
        'mobile' : mobile,
        'secret' : "U2FsdGVkX19UDGcUEnH2W7S0jMGkF9jEhZQEHUVPNnFg2JQAj8tUgZP+qdODWsBkPqkI8dPWCMNG55Y3mmKcCQ==" // copied from cowin-site after inspecting its request-headers, may change potentially in future.
    };

    const headers = {
        "content-type": "application/json",
        "origin": "https://selfregistration.cowin.gov.in",
        "referer": "https://selfregistration.cowin.gov.in/",
        "user-agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
    };
    try {
        const res = await fetch(path, {method: 'POST', body: JSON.stringify(params), headers : headers });
        checkResponseStatus(res);
        const data = await res.json()
        console.log(data);
        return data;
    } catch(err)
    {
        console.log(err)
        throw err;
    }
}

async function confirmOtp(otp, genOtpResponse)
{
    const path = "https://cdn-api.co-vin.in/api/v2/auth/validateMobileOtp";
    const encOtp = createHash('sha256').update(otp).digest('hex');
    const params = {
        'otp' : encOtp,
        'txnId' : genOtpResponse.txnId
    };

    const headers = {
        // most likely, we don't need authorization header any longer, but I have not tested without it.
        // I copied it from request-headers from cowin-site to its servers.
        "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJhZWVkNThlOC01ODg1LTQ2MzktOThiMS0yZjYyYmE1YmE4Y2QiLCJ1c2VyX2lkIjoiYWVlZDU4ZTgtNTg4NS00NjM5LTk4YjEtMmY2MmJhNWJhOGNkIiwidXNlcl90eXBlIjoiQkVORUZJQ0lBUlkiLCJtb2JpbGVfbnVtYmVyIjo4ODI2NjY0MjIwLCJiZW5lZmljaWFyeV9yZWZlcmVuY2VfaWQiOjI3NjQ1NjgwNzk4MjUwLCJzZWNyZXRfa2V5IjoiYjVjYWIxNjctNzk3Ny00ZGYxLTgwMjctYTYzYWExNDRmMDRlIiwic291cmNlIjoiY293aW4iLCJ1YSI6Ik1vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS85MC4wLjQ0MzAuMjEyIFNhZmFyaS81MzcuMzYiLCJkYXRlX21vZGlmaWVkIjoiMjAyMS0wNi0wNlQwNjoxNDowOS44NTNaIiwiaWF0IjoxNjIyOTYwMDQ5LCJleHAiOjE2MjI5NjA5NDl9.4olQtPcsJAnF7QOdVApOpfCx_xX82bZxVuiCcvoK-vI",
        "content-type": "application/json",
        "origin": "https://selfregistration.cowin.gov.in",
        "referer": "https://selfregistration.cowin.gov.in/",
        "user-agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
    };

    try {
        const res = await fetch(path, {method: 'POST', body: JSON.stringify(params), headers : headers });
        checkResponseStatus(res);
        const data = await res.json()
        console.log(data);
        return data;
    } catch(err)
    {
        console.log(err)
        throw err;
    }
}

async function login(mobile)
{
    try {
        const otpRes = await generateOtp(mobile);
        const otp = await getOtp(mobile);
        const tokenObj = await confirmOtp(otp, otpRes);
        console.log(tokenObj);
        return tokenObj;
    }
    catch(err)
    {
        console.log(err);
        throw new Error(`Failed to login for ${mobile}`);
    }
}

async function getBeneficiary(token) {
    const headers = {
        "authorization": "Bearer " + token,
        "content-type": "application/json",
        "origin": "https://selfregistration.cowin.gov.in",
        "referer": "https://selfregistration.cowin.gov.in/",
        "user-agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
    };
    const path = 'https://cdn-api.co-vin.in/api/v2/appointment/beneficiaries';
    const res = await fetch(path, { method: 'GET',  headers: headers });
    checkResponseStatus(res);
    const data = await res.json()
    return data;
}

async function schedule(token, dose, session, slot, beneficiary) {
    const headers = {
        "authorization": "Bearer " + token,
        "content-type": "application/json",
        "origin": "https://selfregistration.cowin.gov.in",
        "referer": "https://selfregistration.cowin.gov.in/",
        "user-agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
    };
    const params = {
        'dose' : dose,
        'session_id' : session.session_id,
        'slot' : slot,
        'beneficiaries': [beneficiary.beneficiary_reference_id]
    };
    const path = 'https://cdn-api.co-vin.in/api/v2/appointment/schedule';
    const res = await fetch(path, { method: 'POST', body: JSON.stringify(params), headers: headers });
    if (res.status == 401)
        throw new Error('401'); // bad auth
    else if (res.status != 200)
    {
        console.log(`The HTTP status of the reponse: ${res.status} (${res.statusText})`);
        return null;
    }
    const data = await res.json()
    return data;
}

async function test()
{
    const tokenResponse = await login(8826664220);
    try {
        const benef = await getBeneficiary(tokenResponse.token);
        console.log(benef);
    }
    catch(err)
    {
        console.log(err);
        setTimeout(getBeneficiary(tokenResponse.token), 3000);
    }
}

export default { login, getBeneficiary, schedule, findByDistrict };

// test();