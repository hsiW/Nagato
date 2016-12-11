const Eris = require('eris'),
    Logger = require('./Utils/Logger'),
    MessageHandler = require('./Utils/MessageHandler'),
    CommandLoader = require('./Utils/CommandLoader'),
    InactivityChecker = require('./Utils/InactivityChecker');

class Nagato extends Eris.Client {
    constructor(options, commandsFolder) {
        super(options.Token, options.Eris);

        this.MessageHandler = options.MessageHandler;
        this.InactivityChecker = options.InactivityChecker;

        this.log = new Logger();
        this.messageHandler = new MessageHandler(this);

        this.on('ready', () => {
            this.messageHandler.start();
            this.log.info('Bot is now Ready and Connected to Discord');
        });

        this.on('error', (error, shard) => {
            this.log.error(`Error: Shard ${shard} - ${error.stack}`)
        });

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
       new CommandLoader(this, commandsFolder).load().then((response) => {
            this.commands = response.commands;
            this.commandAliases = response.commandAliases;
        }).catch(err => this.log.error(err))
    }
}

module.exports = Nagato;