class BaseCommand {
  /**
   * @param {Client} bot
   */
  constructor(bot) {
    if (this.constructor === BaseCommand) {
      throw new Error('Cannot instantiate abstract BaseCommand.')
    }

    this.bot = bot

    this.aliases = []

    this.dm = true
    this.maxMessage = 'The content of this command exceeded the maximum length of 2k characters.'
    this.ownerOnly = false
    this.permissions = null
    this.privateGuilds = null
  }

  // noinspection JSMethodCanBeStatic
  /**
   * @returns {string}
   */
  get category() {
    throw new Error('Category must be overridden.')
  }

  // noinspection JSMethodCanBeStatic
  /**
   * @returns {string}
   */
  get name() {
    throw new Error('Name must be overridden.')
  }

  /**
   * @returns {string}
   */
  get help() {
    return `No Help Message Currently Created for \`${this.name}\`.`
  }

  /**
   * @param {Message} message
   * @param {object|string} content
   * @param {object} options
   * @returns {Promise.<?Message>}
   */
  async execute(message, content, options = {}) {
    if (!message || !content) {
      return null
    } else {
      this.increaseUsage()
      this.bot.log.command(message, this.name)

      if ((content instanceof Object && content['content'] && content['content'].length > 2000)) {
        content = this.maxMessage
      } else if (content.length > 2000) {
        content = this.maxMessage
      }

      return await this.sendMessage(message.channel, content, options)
    }
  }

  /**
   * @param {Channel} channel
   * @param {object|string} content
   * @param {object} options
   * @returns {Promise.<Message>}
   */
  sendMessage(channel, content, options = {}) {
    return new Promise(resolve => {
      channel.createMessage(content, options.upload ? options.upload : undefined).then(msg => {
        if (options.edit) {
          msg.edit(options.edit(msg))
        }

        resolve(msg)
      }).catch(err => this.bot.log.warn(`${this.name} - Error Sending Message: ${err}`))
    })
  }

  increaseUsage() {
    if (this.bot.commandUsage.has(this.name)) {
      const usage = this.bot.commandUsage.get(this.name) + 1

      this.bot.commandUsage.set(this.name, usage)
    } else {
      this.bot.commandUsage.set(this.name, 1)
    }
  }

  /**
   * @param {function} input
   * @param {function} output
   * @param {number} timeout
   * @returns {function}
   */
  async awaitMessage(input, output, timeout) {
    return await this.bot.messageHandler.awaitMessage(input, output, timeout)
  }

  /**
   * @param {Array} emojis
   * @param {function} add
   * @param {function} remove
   * @param {string} messageID
   * @param {number} timeout
   * @returns {function}
   */
  async reactionButton(emojis, add, remove, messageID, timeout) {
    return await this.bot.messageHandler.reactionButton(emojis, add, remove, messageID, timeout)
  }

  /**
   * @param {Message} message
   * @returns {boolean}
   */
  permissionsAll(message) {
    if (!this.privateGuildCheck(message.channel.guild)) {
      return false
    } else if (!this.permissionsCheck(message)) {
      return false
    } else {
      return !(!this.dm && !message.channel.guild)
    }
  }

  /**
   * @param {Guild} guild
   * @returns {boolean}
   */
  privateGuildCheck(guild) {
    if (!this.privateGuilds) {
      return true
    } else return !(!guild || !this.privateGuilds.includes(guild.id));
  }

  /**
   * @param {Message} message
   * @returns {boolean}
   */
  permissionsCheck(message) {
    let hasPermission = true

    if (this.permissions !== null && message.channel.guild) {
      const permissionKeys = Object.keys(this.permissions)
      const userPermissions = message.channel.permissionsOf(message.author.id).json

      for (const key of permissionKeys)
        if (this.permissions[key] !== userPermissions[key]) {
          hasPermission = false

          break
        }
    }

    return hasPermission
  }
}

module.exports = BaseCommand
