class MessageHandler {
    constructor(bot, options) {
        this.bot = bot;

        this.messageHandler = (message) => {
            console.log(message.content)
        }
    }

    run() {
        this.bot.on('messageCreate', this.messageHandler);
    }
}

module.exports = MessageHandler;