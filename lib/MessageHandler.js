class MessageHandler {
    constructor(bot) {

        this.options = bot.messageHandlerOptions;
        this.bot = bot;
        this.currentlyAwaiting = {};

        this.messageHandler = (message) => {
            if ((this.options.userRestricted && !this.options.userRestricted.includes(message.author.id)) ||
                (message.author.bot && !this.options.allowedBots.includes(message.author.id)))
                return;
            else if ((this.options.prefix === "mention" && message.content.replace(/<@!/, "<@").startsWith(this.bot.user.mention)) ||
                message.content.startsWith(this.options.prefix)) {
                if (this.options.prefix === "mention" && message.content.replace(/<@!/, "<@").startsWith(this.bot.user.mention)) {
                    message.content = message.content.replace(/<@!/g, "<@").replace(this.bot.user.mention + " ", "mention");
                    if ((message.content.match(new RegExp(this.bot.user.mention, "g")) || []).length === 0)
                        message.mentions.splice(message.mentions.indexOf(this.bot.user), 1);
                }
                var cmdTxt = message.content.substring(this.options.prefix.length, message.content.length).split(" ")[0].toLowerCase();
                var args = message.content.substring(this.options.prefix.length, message.content.length).split(" ").slice(1).join(" ");
                if (!this.bot.help.disable && this.bot.help.helpCommands.includes(cmdTxt))
                    this.help(message, cmdTxt, args);
                else if (this.bot.commandAliases.has(cmdTxt))
                    this.bot.commands.get(this.bot.commandAliases.get(cmdTxt)).process(message, args);
                else if (this.bot.commands.has(cmdTxt))
                    this.bot.commands.get(cmdTxt).process(message, args);
            } else {
                for (var id in this.currentlyAwaiting) {
                    if (this.currentlyAwaiting[id].input(message)) {
                        this.currentlyAwaiting[id].output(message);
                        delete this.currentlyAwaiting[id];
                    }
                }
            }
        }
    }

    awaitMessage(input, output, timeout, id) {
        if (typeof input !== 'function' || typeof output !== 'function')
            return new Error('Input and output must be functions.');
        this.currentlyAwaiting[id] = {
            input,
            output
        };
        setTimeout(() => {
            delete this.currentlyAwaiting[id];
        }, timeout ? timeout : 5000);
    }

    //This is all broke currently
    help(message, cmdTxt, args) {
        if (Object.keys(this.bot.commands).length === 0) {
            throw new Error("Commands must be created/loaded in order to use help.");
            return;
        }
        if (this.bot.commands[args])
            message.channel.createMessage(this.bot.commands[args].help);
        else {
            var help = {};
            for (var c in this.bot.commands) {
                var command = this.bot.commands[c];
                if ((!command.dm && !message.channel.guild) || ((command.adminOnly || !command.permissionsCheck(message)) && this.bot.admins && !this.bot.admins.includes(message.author.id)) || !command.privateGuildCheck(message))
                    continue;
                if (!help.hasOwnProperty(command.type))
                    help[command.type] = [];
                help[command.type].push(c);
            }
            var temp_array = []
            var sortedHelp = {};
            for (var key in help) {
                if (help.hasOwnProperty(key)) {
                    temp_array.push(key);
                }
            }
            temp_array.sort();
            for (var i = 0; i < temp_array.length; i++) {
                sortedHelp[temp_array[i]] = help[temp_array[i]];
            }
            if (this.bot.help.helpFormat === "embed") {
                var helpFields = [];
                for (let type in sortedHelp) {
                    if (sortedHelp[type].join(", ").length > 1024) {
                        throw new Error(`${type} had over 1024 characters for its field value so has been skipped.`);
                        continue;
                    }
                    helpFields.push({
                        name: type,
                        value: sortedHelp[type].sort().join(", "),
                        inline: true
                    });
                }
                message.channel.createMessage({
                    embed: {
                        title: `${this.bot.user.username}'s Commands`,
                        description: "Pass a specific command as a command argument to get addtional help with that specific command.",
                        color: 0xC081C0,
                        fields: helpFields
                    }
                })
            } else {
                var helpMessage = "";
                for (let type in sortedHelp) {
                    helpMessage += sortedHelp[type].length > 0 ? `\n**${type}:** ` + sortedHelp[type].sort().map(cmd => "`" + cmd + "`").join(", ") : "";
                }
                message.channel.createMessage(`
__**${this.bot.user.username}'s Commands**__

Pass a specific command as a command argument to get additonal help with that specific command.
${helpMessage}
                `);
            }
        }
        this.bot.log.command(message.channel.guild, message.channel.name, cmdTxt, message.author.username);
    }

    start() {
        this.bot.on("messageCreate", this.messageHandler);
    }

    stop() {
        this.bot.removeEventListener("messageCreate", this.messageHandler);
    }
}

module.exports = MessageHandler;