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
                if (this.bot.Help.helpCommand.includes(cmdTxt)) this.help(message, cmdTxt, args)
                if (this.bot.commandAliases.hasOwnProperty(cmdTxt)) cmdTxt = this.bot.commandAliases[cmdTxt];
                if (this.bot.commands.hasOwnProperty(cmdTxt)) {
                    var command = this.bot.commands[cmdTxt];
                    if (command.privateGuildCheck(message.channel.guild) || command.permissionsCheck(message) || (!command.dm && !message.channel.guild) || command.adminCheck(message.author.id))
                        return;
                    else if (command.cooldownCheck(message.author.id) && !this.bot.Admins.includes(message.author.id))
                        command.sendMessage(message.channel, `\`${command.name}\` is currently on cooldown for ${command.cooldownTime(message.author.id).toFixed(1)}s`);
                    else
                        command.process(message, args);
                }
            }
        }
    }

    help(message, cmdTxt, args) {
        if (Object.keys(this.bot.commands).length === 0) {
            throw new Error('Commands must be created/loaded in order to use help.');
            return;
        }
        message.channel.createMessage('**Commands:** ' + Object.keys(this.bot.commands).map(c => '`' + c + '`').join(' ,'))
        this.bot.log.command(message.channel.guild, message.channel ? message.channel.name : undefined, cmdTxt, message.author.username);
    }

    start() {
        this.bot.on('messageCreate', this.messageHandler);
    }

    stop() {
        this.bot.removeEventListener('messageCreate', this.messageHandler);
    }
}

module.exports = MessageHandler;