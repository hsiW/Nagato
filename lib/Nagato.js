const Eris = require('eris'),
    Logger = require('./utils/Logger');

class Nagato extends Eris.Client {
    constructor(options) {
        super(options.token, options.eris);

        this.logger = new Logger();

        this.on('ready', () => {
            this.logger.info('Bot is now Ready and Connected to Discord');
        });

        this.on('error', (error, shard) => {
            if (error) {
                this.logger.error(`Error: ${shard} - ${error}`)
            }
        });

        this.on('shardReady', (id) => {
            this.logger.info(`Shard ${id} is Now Ready`)
        });

        this.on('shardDisconnect', (error, id) => {
            this.logger.warn(`${id} disconnected` + (error ? ': ' + error.message : ''));
        });

        this.on('shardResume', (id) => {
            this.logger.warn(`${id} resumed`);
        });

        this.on('disconnect', () => {
            this.logger.error('Bot has now Disconnected from Discord');
        });
    }
}

module.exports = Nagato;