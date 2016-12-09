class MessageHandler {
    constructor(bot, options) {
        this.bot = bot;

        this.messageHandler = (message) => {
            if (message.author.bot && !options.allowedBots.includes(message.author.id)) return;
            //Command/message handling will go here
        }
    }

    start() {
        this.bot.on('messageCreate', this.messageHandler);
    }

    stop() {
        this.bot.removeEventListener('messageCreate', this.messageHandler);
    }
}

module.exports = MessageHandler;