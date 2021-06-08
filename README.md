# CovaxinSlotFounderForDose2
Finds COVAXIN -dose2 slots in gurgaon/delhi area and telegrams me.


### Pre-requisites
- [Installed Node.js and NPM](https://nodejs.org/en/download/)
- A Telegram bot to recieve notifications
    - [Instructions to create bot](https://sendpulse.com/knowledge-base/chatbot/create-telegram-chatbot)
    - Do remember to send atleast one message on the bot. For it to have storage on telegram-servers.
### Instructions to configure search criteria
- Open index.mjs
- Go to configure section and update your search parameters 
    - vaccine, dose, mobile, email-addr, telegram-bot-token/key etc.
    - criteria function
    - districts to search etc.
### Instructions to run
- Clone the repo
- npm install
- node index.mjs


Currently this is configured to find slots for covaxin-dose-2 in delhi and gurgaon and mail to me.
To use it, one can configure config-portion of index.js file to do their required-search.