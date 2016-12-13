const Eris = require('eris'),
    Logger = require('./Logger'),
    MessageHandler = require('./MessageHandler'),
    InactivityChecker = require('./Utils/InactivityChecker'),
    reload = require('require-reload')(require);

class Nagato extends Eris.Client {
    constructor(options) {
        super(options.Token, options.Eris);

        this.Admins = options.Admins;
        this.MessageHandler = options.MessageHandler;
        this.InactivityChecker = options.InactivityChecker;

        this.log = new Logger(options.Logger);
        this.messageHandler = new MessageHandler(this);

        this.on('ready', () => {
            this.messageHandler.start();
            this.log.info('Bot is now Ready and Connected to Discord');
        });

        this.on('error', (error, id) => {
            this.log.error(`Error: Shard ${id} - ${error.stack}`)
        });

        this.on('warn', (message, id) => {
            this.log.warn(`Warning: Shard ${id} - ${message}`)
        });

        this.on('debug', (message, id) => {
            this.log.debug(`Debug: ${id != null ? 'Shard ' + id + ' - ' : ''}${message}`)
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

    loadCommands(commandsFolder) {
        new(reload('./Utils/CommandLoader'))(this, commandsFolder).load().then((response) => {
            this.commands = response.commands;
            this.commandAliases = response.commandAliases;
        }).catch(err => this.log.error(err));
    }

    reloadCommands(commandsFolder) {
        this.commands = undefined;
        this.commandAliases = undefined;
        reload.emptyCache('./Utils/CommandLoader')
        this.loadCommands;
    }

    loadEvents(eventsFolder) {
        new(reload('./Utils/EventLoader'))(this, eventsFolder).load().then((response) => {
            this.events = response;
            for (var event in this.events) {
                this.events[event].load();
            }
        }).catch(err => this.log.error(err));
    }

    reloadEvents(eventsFolder) {
        for (var event in this.events) {
            this.events[event].remove();
        }
        this.events = undefined;
        reload.emptyCache('./Utils/EventLoader');
        this.loadEvents;
    }
}

module.exports = Nagato;