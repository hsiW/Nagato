class MessageHandler {
    constructor(bot, commandsFolder) {
        this.options = bot.MessageHandler;
        this.bot = bot;

        this.messageHandler = (message) => {
            if (message.author.bot || (message.author.bot && options.allowedBots && !options.allowedBots.includes(message.author.id))) return;
            else if (message.content.startsWith(this.options.Prefix)) {
                var formatedMessage = message.content.substring(this.options.Prefix.length, message.content.length),
                    cmdTxt = formatedMessage.split(' ')[0].toLowerCase(),
                    args = formatedMessage.split(' ').slice(1).join(' ');
                if (this.bot.commandAliases.hasOwnProperty(cmdTxt)) cmdTxt = commandAliases[cmdTxt];
                if (this.bot.commands.hasOwnProperty(cmdTxt)) this.bot.commands[cmdTxt].process(message, args);
            }
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