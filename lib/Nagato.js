const Eris = require('eris'),
    Logger = require('./Logger'),
    MessageHandler = require('./MessageHandler'),
    EventCounter = require('./Utils/EventCounter'),
    reload = require('require-reload')(require).emptyCache;

class Nagato extends Eris.Client {
    constructor(options) {
        super(options.Token, options.Eris);

        this.admins = options.Admins;

        this.messageHandlerOptions = options.MessageHandler;
        if (!this.messageHandlerOptions.allowedBots) this.messageHandlerOptions.allowedBots = [];

        this.getUser = this.getUser;

        this.help = options.Help;
        if (!this.help.helpCommands) this.help.helpCommands = ['help'];

        this.log = new Logger(options.Logger);
        this.messageHandler = new MessageHandler(this);
        this.eventCounter = new EventCounter(this);

        this.eventCounter.create();

        this.once('ready', () => {
            this.messageHandler.start();
            this.log.info('Bot is now Ready and Connected to Discord');
        });

        this.on('warn', (message, id) => {
            this.log.warn(`Warning: Shard ${id} - ${message}`);
        });

        this.on('error', (error, id) => {
            this.log.error(`Error: Shard ${id} - ${error.stack}`);
        });

        this.on('debug', (message, id) => {
            this.log.debug(`Debug: ${id != null ? 'Shard ' + id + ' - ' : ''}${message}`);
        })

        this.on('shardReady', (id) => {
            this.log.info(`Shard ${id} is Now Ready`)
        });

        this.on('shardDisconnect', (error, id) => {
            this.log.warn(`Shard ${id} has Disconnected` + (error ? ': ' + error.message : ''));
        });

        this.on('shardResume', (id) => {
            this.log.warn(`Shard ${id} has Resumed`);
        });

        this.on('disconnect', () => {
            this.log.error('Bot has now Disconnected from Discord');
        });
    }

    getUser(message, searchAgs) {
        if (message.mentions.length === 1)
            return message.mentions[0];
        else if (!searchAgs || !message.channel.guild)
            return message.author;
        else {
            const nameRegex = new RegExp(searchAgs.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
                nick = message.channel.guild.members.find(m => {
                    if (m.nick) m.nick.match(nameRegex)
                });
            if (nick)
                return nick.user;
            else {
                const user = message.channel.guild.members.find(m => m.user.username.match(nameRegex));
                if (user || nick)
                    return user ? user.user : nick.user;
                else
                    return message.author;
            }
        }

    }

    loadCommands(commandsFolder) {
        new(require('./Utils/CommandLoader'))(this, commandsFolder).load().then((response) => {
            this.commands = response.commands;
            this.commandAliases = response.commandAliases;
        }).catch(err => this.log.error(err));
    }

    reloadCommands(commandsFolder) {
        reload('./Utils/CommandLoader');
        this.commands = null;
        this.commandAliases = null;
        new(require('./Utils/CommandLoader'))(this, commandsFolder).load().then((response) => {
            this.commands = response.commands;
            this.commandAliases = response.commandAliases;
        }).catch(err => this.log.error(err));
    }

    loadEvents(eventsFolder) {
        new(require('./Utils/EventLoader'))(this, eventsFolder).load().then((response) => {
            this.events = response;
            for (var event in this.events)
                this.events[event].load();
        }).catch(err => this.log.error(err));
    }

    reloadEvents(eventsFolder) {
        reload('./Utils/EventLoader');
        for (var event in this.events)
            this.events[event].remove();
        this.events = undefined;
        new(require('./Utils/EventLoader'))(this, eventsFolder).load().then((response) => {
            this.events = response;
            for (var event in this.events)
                this.events[event].load();
        }).catch(err => this.log.error(err));
    }
}

module.exports = Nagato;