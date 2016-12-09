const Eris = require('eris'),
    Logger = require('./Utils/Logger'),
    MessageHandler = require('./Utils/MessageHandler');

class Nagato extends Eris.Client {
    constructor(options) {
        super(options.Token, options.Eris);

        this.log = new Logger();
        this.messageHandler = new MessageHandler(this, options.MessageHandler);

        this.on('ready', () => {
            this.messageHandler.start();
            this.log.info('Bot is now Ready and Connected to Discord');
        });

        this.on('error', (error, shard) => {
            if (error) {
                this.log.error(`Error: Shard ${shard} - ${error.stack}`)
            }
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
}

module.exports = Nagato;