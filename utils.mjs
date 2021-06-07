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

