class MessageHandler {
    constructor(bot, commandsFolder) {
        this.options = bot.MessageHandler;
        this.bot = bot;

        this.messageHandler = (message) => {
            if ((this.options.userRestricted && !this.options.userRestricted.includes(message.author.id)) || (message.author.bot && this.options.allowedBots && !this.options.allowedBots.includes(message.author.id))) return;
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
        if (this.bot.commands[args]) {
            message.channel.createMessage(this.bot.commands[args].help);
            return;
        }
        var help = {};
        for (let command in this.bot.commands) {
            if ((this.bot.commands[command].dm === false && !message.channel.guild) || ((this.bot.commands[command].adminOnly === 'admin' || !this.bot.commands[command].permissionsCheck(message)) && !this.bot.Admins.includes(message.author.id)) || this.bot.commands[command].privateGuildCheck(message)) continue;
            if (!help.hasOwnProperty(this.bot.commands[command].type)) help[this.bot.commands[command].type] = [];
            help[this.bot.commands[command].type].push(command);
        }
        var temp_array = [],
            temp_obj = {};
        for (var key in help) {
            if (help.hasOwnProperty(key)) {
                temp_array.push(key);
            }
        }
        temp_array.sort();
        for (var i = 0; i < temp_array.length; i++) {
            temp_obj[temp_array[i]] = help[temp_array[i]];
        }
        if (!this.bot.Help.helpFormat || this.bot.Help.helpFormat === 'basic') {
            var helpMessage = "";
            for (let type in help) {
                helpMessage += help[type].length > 0 ? `\n**${type}:** ` + help[type].sort().map(cmd => '`' + cmd + '`').join(", ") : '';
            }
            message.channel.createMessage(`
__**${this.bot.user.username}'s Commands**__

Pass a specific command as a command argument to get additonal help with that specific command.
${helpMessage}
                `)
        } else if (this.bot.Help.helpFormat === 'embed') {
            var helpFields = [];
            for (let type in help) {
                if (!help[type].length > 0) continue;
                if (help[type].join(", ").length > 1024) {
                    throw new Error(`${type} had over 1024 characters for its field value so has been skipped.`)
                    continue;
                }
                helpFields.push({
                    name: type,
                    value: help[type].sort().join(", "),
                    inline: true
                });
            }
            message.channel.createMessage({
                embed: {
                    title: `${this.bot.user.username}'s Commands`,
                    description: 'Pass a specific command as a command argument to get addtional help with that specific command.',
                    color: 0x800080,
                    fields: helpFields
                }
            })
        }
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