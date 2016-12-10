const Logger = require('./Logger'),
    CommandLoader = require('./CommandLoader');


class MessageHandler {
    constructor(bot, options, commandsFolder) {
        this.log = new Logger();
        this.commandLoader = new CommandLoader(bot, commandsFolder);
        this.commandLoader.load().then((response) => {
            this.commands = response.commands;
            this.commandAliases = response.commandAliases;
        }).catch(err => this.log.error(err))
        this.options = options || {};
        this.bot = bot;

        this.messageHandler = (message) => {
            if (message.author.bot || (message.author.bot && options.allowedBots && !options.allowedBots.includes(message.author.id))) return;
            else if (message.content.startsWith(this.options.Prefix)) {
                var formatedMessage = message.content.substring(this.options.Prefix.length, message.content.length),
                    cmdTxt = formatedMessage.split(' ')[0].toLowerCase(),
                    args = formatedMessage.split(' ').slice(1).join(' ');
                if (this.commandAliases.hasOwnProperty(cmdTxt)) cmdTxt = commandAliases[cmdTxt];
                if (this.commands.hasOwnProperty(cmdTxt)) this.commands[cmdTxt].process(message, args);
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