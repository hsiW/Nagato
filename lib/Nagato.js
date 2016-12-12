const Eris = require('eris'),
    Logger = require('./Utils/Logger'),
    MessageHandler = require('./Utils/MessageHandler'),
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
        new(reload('./Utils/CommandLoader'))(this, commandsFolder).load().then((response) => {
            this.commands = response.commands;
            this.commandAliases = response.commandAliases;
        }).catch(err => this.log.error(err));
    }
}

module.exports = Nagato;