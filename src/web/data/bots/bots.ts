import Bot from "./bot";

class Bots {
    private bots: Map<number, Bot>;

    constructor() {
        this.bots = new Map<number, Bot>();
    }

    getBots() {
        return this.bots;
    }

    addBot(bot: Bot) {
        this.getBots().set(bot.getBotID(), bot);
    }
}

const bots = new Bots();
module.exports = bots;
