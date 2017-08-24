const Eris = require('eris')

const EventCounter = require('./Utils/EventCounter')
const Logger = require('./Logger')
const MessageHandler = require('./MessageHandler')
const Middleware = require('./Middleware')

class Nagato extends Eris['Client'] {
  constructor(options) {
    super(options['Token'], options['Eris'])

    // noinspection JSUnusedGlobalSymbols
    this.owners = options['Owners'] || []

    this.messageHandlerOptions = Object.assign({
      defaultPrefixes: [],
      prefixes: ['-'],
    }, options['MessageHandler'])

    this.help = Object.assign({
      helpCommands: ['help'],
    }, options['Help'])

    this.eventCounter = new EventCounter(this)
    this.eventCounter.create()

    this.log = new Logger(options['Logger'])
    this.messageHandler = new MessageHandler(this)
    this.middleware = new Middleware(this)

    this.commandUsage = new Map()

    this.once('ready', () => {
      this.messageHandler.start()
      this.log.info('Bot is now Ready and Connected to Discord')
    })

    this.on('disconnect', () => {
      this.log.error('Bot has now Disconnected from Discord')
    })

    this.on('warn', (message, id) => {
      this.log.warn(`Warning: Shard ${id} - ${message}`)
    })

    this.on('error', (error, id) => {
      this.log.error(`Error: Shard ${id} - ${error['stack']}`)
    })

    this.on('debug', (message, id) => {
      this.log.debug(`Debug: ${id !== undefined ? 'Shard ' + id + ' - ' : ''}${message}`)
    })

    this.on('shardReady', id => {
      this.log.info(`Shard ${id} is Now Ready`)
    })

    this.on('shardResume', id => {
      this.log.warn(`Shard ${id} has Resumed`)
    })

    this.on('shardDisconnect', (error, id) => {
      this.log.warn(`Shard ${id} has Disconnected` + (error ? ': ' + error.message : ''))
    })
  }

  /**
   * @param {Message} message
   * @param {string} searchArgs
   * @returns {User}
   */
  getUser(message, searchArgs) {
    if (message.mentions.length === 1) {
      return message['mentions'][0]
    } else if (!searchArgs || !message.channel.guild) {
      return message.author
    } else {
      const nameRegex = new RegExp(searchArgs.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      const nick = message.channel.guild.members.find(m => {
        if (m['nick']) {
          m['nick'].match(nameRegex)
        }
      })
      if (nick) {
        return nick['user']
      } else {
        const user = message.channel.guild.members.find(m => m.user.username.match(nameRegex))
        if (user || nick) {
          return user ? user['user'] : nick['user']
        } else {
          return message['author']
        }
      }
    }
  }

  /**
   * @param {string} commandsFolder
   */
  async loadCommands(commandsFolder) {
    const CommandLoader = require('./Utils/CommandLoader')
    const loader = new CommandLoader(this, commandsFolder)

    try {
      [this.commands, this.commandAliases] = await loader.load()
    } catch(e) {
      this.log.error(e)
    }
  }

  /**
   * @param {string} commandsFolder
   */
  async reloadCommands(commandsFolder) {
    delete require.cache[require.resolve('./Utils/CommandLoader')]

    this.commands.clear()
    this.commandAliases.clear()

    await this.loadCommands(commandsFolder)
  }

  async loadEvents(eventsFolder) {
    const EventLoader = require('./Utils/EventLoader')
    const loader = new EventLoader(this, eventsFolder)

    try {
      this.events = await loader.load()
    } catch(e) {
      return this.log.error(e)
    }

    for (const event in this.events) {
      // noinspection JSUnfilteredForInLoop
      this.events[event].load()
    }
  }

  /**
   * @param {string} eventsFolder
   */
  async reloadEvents(eventsFolder) {
    delete require.cache[require.resolve('./Utils/EventLoader')]

    for (const event in this.events) {
      // noinspection JSUnfilteredForInLoop
      this.events[event].remove()
    }
    this.events = {}

    await this.loadEvents(eventsFolder)
  }

  /**
   * @param {Middleware} middleware
   */
  loadMiddleware(middleware) {
    if (!(middleware.prototype instanceof Middleware)) {
      throw new Error('Must be an instance of Middleware')
    }

    this.middleware = new middleware(this)
  }
}

module.exports = Nagato
