const Eris = require('eris')
const reload = require('require-reload')(require).emptyCache

const EventCounter = require('./Utils/EventCounter')
const Logger = require('./Logger')
const MessageHandler = require('./MessageHandler')

class Nagato extends Eris.Client {
    constructor(options) {
        super(options.Token, options.Eris)

        this.admins = options.Admins

        this.messageHandlerOptions = Object.assign({
            prefixes: ['-'],
            userRestricted: [],
        }, options.MessageHandler)

        this.help = Object.assign({
            helpCommands: ['help'],
        }, options.Help)

        this.getUser = this.getUser

        this.eventCounter = new EventCounter(this)
        this.eventCounter.create()

        this.log = new Logger(options.Logger)
        this.messageHandler = new MessageHandler(this)

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
            this.log.error(`Error: Shard ${id} - ${error.stack}`)
        })

        this.on('debug', (message, id) => {
            this.log.debug(`Debug: ${id != null ? 'Shard ' + id + ' - ' : ''}${message}`)
        })

        this.on('shardReady', (id) => {
            this.log.info(`Shard ${id} is Now Ready`)
        })

        this.on('shardResume', (id) => {
            this.log.warn(`Shard ${id} has Resumed`)
        })

        this.on('shardDisconnect', (error, id) => {
            this.log.warn(`Shard ${id} has Disconnected` + (error ? ': ' + error.message : ''))
        })
    }

    getUsers(message, searchArgs) {
        const args = searchArgs.split(' ')

        let mention_index = 0;
        let users = [];

        for (let arg of args) {
            if (message.mentions.length > mention_index && arg.includes(message.mentions[mention_index].id)) {
                users.push(message.mentions[mention_index])

                mention_index++
            } else if (!arg || !message.channel.guild) {
                users.push(message.author)
            } else {
                const nameRegex = new RegExp(arg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
                const nick = message.channel.guild.members.find(m => {
                    if (m.nick) {
                        m.nick.match(nameRegex)
                    }
                })

                if (nick) {
                    users.push(nick.user)
                } else {
                    const user = message.channel.guild.members.find(m => m.user.username.match(nameRegex))

                    if (user || nick) {
                        users.push(user ? user.user : nick.user)
                    } else {
                        users.push(message.author)
                    }
                }
            }
        }
        return users
    }

    loadCommands(commandsFolder) {
        new(require('./Utils/CommandLoader'))(this, commandsFolder).load().then((response) => {
            this.commands = response.commands
            this.commandAliases = response.commandAliases
        }).catch(err => this.log.error(err))
    }

    reloadCommands(commandsFolder) {
        reload('./Utils/CommandLoader')

        this.commands = null
        this.commandAliases = null

        new(require('./Utils/CommandLoader'))(this, commandsFolder).load().then((response) => {
            this.commands = response.commands
            this.commandAliases = response.commandAliases
        }).catch(err => this.log.error(err))
    }

    loadEvents(eventsFolder) {
        new(require('./Utils/EventLoader'))(this, eventsFolder).load().then((response) => {
            this.events = response

            for (const event in this.events) {
                this.events[event].load()
            }
        }).catch(err => this.log.error(err))
    }

    reloadEvents(eventsFolder) {
        reload('./Utils/EventLoader')

        for (const event in this.events) {
            this.events[event].remove()
        }

        this.events = undefined

        new(require('./Utils/EventLoader'))(this, eventsFolder).load().then((response) => {
            this.events = response

            for (const event in this.events) {
                this.events[event].load()
            }
        }).catch(err => this.log.error(err))
    }
}

module.exports = Nagato