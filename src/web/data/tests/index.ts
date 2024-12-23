const Bot = require("../bots/bot");
const Bots = require("../bots/bots");

const statusIntervalTimeout = 1000;
const statusURL = "http://localhost:40001/jaia/v0/status";

const statusInterval = setInterval(async () => {
    try {
        const response = await fetch(statusURL);
        if (!response.ok) {
            console.error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        updateBots(json.bots);
    } catch (error) {
        console.error(error);
    }
}, statusIntervalTimeout);

function updateBots(botStatuses: string) {}
