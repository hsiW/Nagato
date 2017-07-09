class Middleware {
	constructor(bot) {
		this.bot = bot
	}
	checkChannel(channel, cmd, args) {
		return false
	}

	checkCommand(guildID, cmd) {
		return false
	}

	checkPrefix(guildID) {
		return null
	}
}

module.exports = Middleware