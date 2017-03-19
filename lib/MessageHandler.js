class MessageHandler {
	constructor(bot) {

		this.options = bot.messageHandlerOptions;
		this.bot = bot;
		this._awaitID = 0;
		this.currentlyAwaiting = new Map();

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
			} else
				for (var id of this.currentlyAwaiting.keys()) {
					if (this.currentlyAwaiting.get(id).input(message)) {
						this.currentlyAwaiting.get(id).output(message);
						this.currentlyAwaiting.delete(id);
					}
				}
		}
	}

	awaitMessage(input, output, timeout) {
		if (typeof input !== "function" || typeof output !== "function")
			return new Error('Input and output must be functions.');
		this._awaitID++;
		this.currentlyAwaiting.set(this._awaitID, {
			input,
			output
		});
		setTimeout(() => {
			this.currentlyAwaiting.delete(id);
		}, timeout ? timeout : 5000);
	}

	help(message, cmdTxt, args) {
		if (this.bot.commands.size === 0)
			throw new Error("Commands must be created/loaded in order to use help.");
		else if (this.bot.commands.get(args))
			message.channel.createMessage(this.bot.commands.get(args).help);
		else {
			var help = this.bot.commands.filter(c => c.checkAllPermissions(message)).sort();
			var helpTypes = help.map(c => c.type).filter((elem, index, self) => index == self.indexOf(elem)).sort();
			var commandList = helpTypes.map(type => help.map(c => {
				if (c.type === type)
					return c.id;
			}).filter(c => c !== undefined));
			this.bot.log.command(message.channel.guild, message.channel.name, cmdTxt, message.author.username);
		}
	}

	start() {
		this.bot.on("messageCreate", this.messageHandler);
	}

	stop() {
		this.bot.removeEventListener("messageCreate", this.messageHandler);
	}
}

module.exports = MessageHandler;


