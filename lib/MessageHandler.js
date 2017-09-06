class MessageHandler {
  constructor(bot) {
    this._awaitID = 0
    this.currentButtons = new Map()
    this.currentlyAwaiting = new Map()

    this.bot = bot
    this.options = bot.messageHandlerOptions

    this.messageHandler = async msg => {
      if (msg.author.bot) {
        return
      }

      if (this.options.userRestricted && !this.options.userRestricted.includes(msg.author.id)) {
        return
      }

      const [prefix, newContent] = await this.prefix(msg)

      if (prefix) {
        if (await this.bot.middleware.checkGuild(msg.channel.guild)) {
          return
        }

        if (await this.bot.middleware.checkUser(msg.author.id)) {
          return
        }

        if (prefix === 'mention ') {
          if ((newContent.match(new RegExp(this.bot.user.mention, 'g')) || []).length) {
            msg.mentions.splice(msg.mentions.indexOf(this.bot.user), 1)
          }
        }

        const cmdTxt = newContent.substring(prefix.length, newContent.length).split(' ')[0].toLowerCase()
        const args = newContent.substring(prefix.length, newContent.length).split(' ').slice(1).join(' ')

        if (await this.bot.middleware.checkChannel(msg.channel, cmdTxt, args)) {
          // noinspection UnnecessaryReturnStatementJS
          return
        } else if (!this.bot.help.disable && this.bot.help.helpCommands.includes(cmdTxt)) {
          this.help(msg, cmdTxt, args)
        } else if (this.bot.commandAliases.has(cmdTxt) || this.bot.commands.has(cmdTxt)) {
          let command

          if (this.bot.commandAliases.has(cmdTxt)) {
            command = this.bot.commands.get(this.bot.commandAliases.get(cmdTxt))
          } else {
            command = this.bot.commands.get(cmdTxt)
          }
          if (await this.bot.middleware.checkCommand(msg.channel.guild, command.name)) {
            return
          } else if (this.permissionCheck(msg, command)) {
            return
          }

          command
            .process(msg, args)
            .catch(err => {
              if (err.stack) {
                this.bot.log.error(err.stack)
              } else {
                this.bot.log.error(err)
              }
            })
        }
      } else {
        for (const id of this.currentlyAwaiting.keys()) {
          if (this.currentlyAwaiting.get(id).input(msg)) {
            this.currentlyAwaiting.get(id).output(msg)
            this.currentlyAwaiting.delete(id)
          }
        }
      }
    }

    this.reactionAddHandler = (message, emoji, userID) => {
      if (userID === this.bot.user.id) {
        // noinspection UnnecessaryReturnStatementJS
        return
      } else if (this.currentButtons.has(message.id) &&
        this.currentButtons.get(message.id).emojis.includes(emoji.name)) {
        this.currentButtons.get(message.id).add(message, emoji, userID)
      }
    }

    this.reactionRemoveHandler = (message, emoji, userID) => {
      if (userID === this.bot.user.id) {
        // noinspection UnnecessaryReturnStatementJS
        return
      } else if (this.currentButtons.has(message.id) &&
        this.currentButtons.get(message.id).emojis.includes(emoji.name) &&
        this.currentButtons.get(message.id).remove) {
        this.currentButtons.get(message.id).remove(message, emoji, userID)
      }

    }
  }

  async prefix(msg) {
    const defaultPrefixes = this.options.defaultPrefixes
    let prefixes = this.options.prefixes

    const dbPrefix = await this.bot.middleware.checkPrefix(msg.channel.guild)

    if (dbPrefix) {
      prefixes = [dbPrefix]
    }

    let currentPrefix = null
    let currentContent = msg.content

    outerloop:
      for (const prefixType of[defaultPrefixes, prefixes]) {
        for (const p of prefixType) {
          if (p === 'mention') {
            if (currentContent.replace(/<@!/, '<@').startsWith(this.bot.user.mention)) {
              currentContent = msg.content
                .replace(/<@!/, '<@')
                .replace(this.bot.user.mention, 'mention')

              currentPrefix = 'mention '

              break outerloop
            }
          } else if (msg.content.startsWith(p)) {
            currentPrefix = p

            break outerloop
          }
        }
      }

    return [currentPrefix, currentContent]
  }

  awaitMessage(input, output, timeout) {
    return new Promise(resolve => {
      if (typeof input !== 'function' || typeof output !== 'function') {
        return new Error('Input and output must be functions.')
      }

      this.currentlyAwaiting.set(++this._awaitID, {
        input,
        output
      })

      setTimeout(() => {
        this.currentlyAwaiting.delete(this._awaitID)

        resolve()
      }, timeout ? timeout : 5000)
    })
  }

  reactionButton(emojis, add, remove, messageID, timeout) {
    return new Promise(resolve => {
      if (typeof add !== 'function' || (typeof remove !== 'function' && remove !== null)) {
        return new Error('Add must be a functions and Remove must be a function or null.')
      }

      this.currentButtons.set(messageID, {
        emojis,
        add,
        remove
      })

      setTimeout(() => {
        this.currentButtons.delete(messageID)

        resolve()
      }, timeout ? timeout : 300000)
    })
  }

  permissionCheck(msg, command) {
    if (command.ownerOnly && !this.bot.owners.includes(msg.author.id)) {
      return true
    } else if (!command.privateGuildCheck(msg.channel.guild)) {
      return true
    } else if (!command.dm && !msg.channel.guild) {
      command.sendMessage(msg.channel, 'This command may not be used in DM\'s')

      return true
    } else if (!command.permissionsCheck(msg)) {
      let permissionString = Object.keys(command.permissions).map(p => '`' + p + '`').join(', ') + ' permission'

      if (Object.keys(command.permissions).length > 1) {
        permissionString += 's'
      }

      command.sendMessage(msg.channel, `This command requires the user to have ${permissionString}`)

      return true
    }

    return false
  }

  /**
   * @param {Message} message
   * @param {string} cmdTxt
   * @param {string} args
   * @returns {void}
   */
  help(message, cmdTxt, args) {
    if (this.bot.commands['size'] === 0) {
      throw new Error('Commands must be created/loaded in order to use help.')
    } else if (this.bot.commands.get(args)) {
      message.channel.createMessage(this.bot.commands.get(args).help)
    } else if (this.bot.commandAliases.get(args)) {
      message.channel.createMessage(this.bot.commands.get(this.bot.commandAliases.get(args)).help)
    } else {
      const help = (func => {
        let commands = []

        for (const command of this.bot.commands.values()) {
          if (func(command)) {
            commands.push(command)
          }
        }

        return commands
      })(c => c.permissionsAll(message)).sort()

      const helpFields = help.map(c => c.category)
        .filter((elem, index, self) => index === self.indexOf(elem)).sort()
        .map(category => {
          return {
            name: category.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()),
            value: help.filter(c => c.category === category).map(c => c.name).join(', '),
            inline: true
          }
        })

      if (this.bot.help['helpFormat'] === 'embed') {
        message.channel.createMessage({
          embed: {
            author: {
              icon_url: this.bot.user.avatarURL,
              name: `${this.bot.user.username}'s Commands`
            },
            description: `Pass a specific command as a command argument` +
            ` to get additional help information with that specific command.\n` +
            `\n**Example:** \`${this.options.defaultPrefixes[0]}${cmdTxt}\``,
            color: 0xC081C0,
            fields: helpFields
          }
        })
      } else {
        message.channel.createMessage(`__**${this.bot.user.username}'s Commands**__
Pass a specific command as a command argument to get additional help information with that specific command.

**Example:** \`${this.options.defaultPrefixes[0]}${cmdTxt}\`

${helpFields.map(f => `**${f.name}**: ${f.value}`).join('\n')}`)
      }
    }
    this.bot.log.command(message, cmdTxt)
  }

  start() {
    this.bot.on('messageCreate', this.messageHandler)
    this.bot.on('messageReactionAdd', this.reactionAddHandler)
    this.bot.on('messageReactionRemove', this.reactionRemoveHandler)
  }
}

// noinspection JSUnresolvedVariable
module.exports = MessageHandler
