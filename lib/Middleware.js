class Middleware {
  constructor(bot) {
    this.bot = bot
  }

  // noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
  /**
   * @param {Channel} channel
   * @param {string} cmd
   * @param {string} args
   * @returns {boolean}
   */
  checkChannel(channel, cmd, args) {
    return false
  }

  // noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
  /**
   * @param {Guild} guild
   * @param {string} cmd
   * @returns {boolean}
   */
  checkCommand(guild, cmd) {
    return false
  }

  // noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
  /**
   * @param {Guild} guild
   * @returns {?string}
   */
  checkPrefix(guild) {
    return null
  }

  // noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
  /**
   * @param {string} userID
   * @returns {boolean}
   */
  checkUser(userID) {
    return false
  }

  // noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
  /**
   * @param {Guild} guild
   * @returns {boolean}
   */
  checkGuild(guild) {
    return false
  }
}

// noinspection JSUnresolvedVariable
module.exports = Middleware
