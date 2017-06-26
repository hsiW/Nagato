class MessageHandler {
	constructor(bot) {

		this.options = bot.messageHandlerOptions;
		this.bot = bot;
		this._awaitID = 0;
		this.currentlyAwaiting = new Map();
		this.currentButtons = new Map();

		this.messageHandler = msg => {
			if (msg.author.bot || !this.options.userRestricted.includes(msg.author.id))
				return
			const [prefix, newMsg] = this.prefix(msg)
			if (prefix) {
				const nContent = newMsg.content
				if (prefix === 'mention')
					if ((msg.content.match(new RegExp(this.bot.user.mention, 'g')) || []).length)
						newMsg.mentions.splice(msg.mentions.indexOf(this.bot.user), 1)

				const cmdTxt = nContent.substring(prefix.length, nContent.length).split(' ')[0].toLowerCase()
				const args = nContent.substring(prefix.length, nContent.length).split(' ').slice(1).join(' ')

				if (!this.bot.help.disable && this.bot.help.helpCommands.includes(cmdTxt))
					this.help(msg, cmdTxt, args)

				else if (this.bot.commandAliases.has(cmdTxt))
					this.bot.commands.get(this.bot.commandAliases.get(cmdTxt)).process(msg, args)

				else if (this.bot.commands.has(cmdTxt))
					this.bot.commands.get(cmdTxt).process(msg, args)
			} else {
				for (let id of this.currentlyAwaiting.keys())
					if (this.currentlyAwaiting.get(id).input(msg)) {
						this.currentlyAwaiting.get(id).output(msg)
						this.currentlyAwaiting.delete(id)
					}
			}
		}

		this.reactionAddHandler = (message, emoji, userID) => {
			if (userID === this.bot.user.id)
				return;
			if (this.currentButtons.has(message.id) &&
				this.currentButtons.get(message.id).emojis.includes(emoji.name)) {
				this.currentButtons.get(message.id).add(message, emoji, userID);
			}
		}

		this.reactionRemoveHandler = (message, emoji, userID) => {
			if (userID === this.bot.user.id)
				return;
			if (this.currentButtons.has(message.id) &&
				this.currentButtons.get(message.id).emojis.includes(emoji.name) &&
				this.currentButtons.get(message.id).remove) {
				this.currentButtons.get(message.id).remove(message, emoji, userID);
			}

		}
	}

	prefix(msg) {
		const prefixes = this.options.prefixes
		let currentPrefix = null;
		let currentMsg = msg;
		prefixes.forEach(p => {
			if (p === 'mention') {
				if (currentPrefix !== null) {
					return
				} else if (msg.content.replace(/<@!/, '<@').startsWith(this.bot.user.mention)) {
					currentMsg = msg.content
						.replace(/<@!/, '<@')
						.replace(this.bot.user.mention, 'mention ');
					currentPrefix = 'mention '
				}
			} else if (msg.content.startsWith(p)) {
				currentPrefix = p
			}
		})
		return [currentPrefix, currentMsg]
	}

	awaitMessage(input, output, timeout) {
		if (typeof input !== 'function' || typeof output !== 'function')
			return new Error('Input and output must be functions.');
		this._awaitID++;
		this.currentlyAwaiting.set(this._awaitID, {
			input,
			output
		});
		setTimeout(() => {
			this.currentlyAwaiting.delete(this._awaitID);
		}, timeout ? timeout : 5000);
	}

	reactionButton(emojis, add, remove, messageID, timeout) {
		if (typeof add !== 'function' || (typeof remove !== 'function' && remove !== null))
			return new Error('Add must be a functions and Remove must be a function or null.');
		this.currentButtons.set(messageID, {
			emojis,
			add,
			remove
		});
		setTimeout(() => {
			this.currentButtons.delete(messageID);
		}, timeout ? timeout : 300000);
	}

	help(message, cmdTxt, args) {
			if (this.bot.commands.size === 0)
				throw new Error('Commands must be created/loaded in order to use help.');
			else if (this.bot.commands.get(args))
				message.channel.createMessage(this.bot.commands.get(args).help);
			else if (this.bot.commandAliases.get(args))
				message.channel.createMessage(this.bot.commands.get(this.bot.commandAliases.get(args)).help);
			else {
				const help = this.bot.commands.filter(c => c.checkAllPermissions(message)).sort(),
					helpFields = help.map(c => c.type)
					.filter((elem, index, self) => index == self.indexOf(elem)).sort()
					.map(type => {
						return {
							name: type,
							value: help.filter(c => c.type === type).map(c => c.id).join(', '),
							inline: true
						}
					});
				if (this.bot.help.helpFormat === 'embed')
					message.channel.createMessage({
						embed: {
							author: {
								icon_url: this.bot.user.avatarURL,
								name: `${this.bot.user.username}'s Commands`
							},
							description: "Pass a specific command as a command argument to get addtional help information with that specific command.",
							color: 0xC081C0,
							fields: helpFields
						}
					});
				else
					message.channel.createMessage(`__**${this.bot.user.username}'s Commands**__
Pass a specific command as a command argument to get addtional help information with that specific command.

${helpFields.map(f => `**${f.name}**: ${f.value}`).join('\n')}`);
		}
		this.bot.log.command(message.channel.guild, message.channel.name, cmdTxt, message.author.username);
	}

	start() {
		this.bot.on('messageCreate', this.messageHandler);
		this.bot.on('messageReactionAdd', this.reactionAddHandler);
		this.bot.on('messageReactionRemove', this.reactionRemoveHandler);
	}

	stop() {
		this.bot.removeEventListener('messageCreate', this.messageHandler);
		this.bot.removeEventListener('messageReactionAdd', this.reactionAddHandler);
		this.bot.removeEventListener('messageReactionRemove', this.reactionRemoveHandler);
	}
}

module.exports = MessageHandler;