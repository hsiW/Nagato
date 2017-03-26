const chalk = new(require('chalk')).constructor({
    enabled: true
});

class Logger {
    constructor(options) {
        this.logCommands = !!options.logCommands;
        this.logInfo = !!options.logInfo;
        this.logWarn = !!options.logWarn;
        this.logError = !!options.logError;
        this.logDebug = options.logDebug || false;
        Logger.timeStamps = options.timeStamps || false;
    }

    command(guild, channel, cmd, author) {
        if (this.logCommands)
            console.log(`${Logger.timestamp}${chalk.magenta.bold(`@${guild ? guild.name : 'Private Message'}: `)}${chalk.green.bold(channel ? `#${channel}: ` : '')}${chalk.yellow.bold(cmd)} was used by ${chalk.cyan.bold(author)}`);
    }

    info() {
        if (this.logInfo)
            console.info(`${Logger.timestamp}${chalk.magenta.bold('Nagato: ')}${chalk.cyan.bold(...arguments)}`);
    }

    warn() {
        if (this.logWarn)
            console.warn(`${Logger.timestamp}${chalk.magenta.bold('Nagato: ')}${chalk.yellow.bold(...arguments)}`);
    }

    error() {
        if (this.logError)
            console.error(`${Logger.timestamp}${chalk.magenta.bold('Nagato: ')}${chalk.red.bold(...arguments)}`);
    }

    debug() {
        if (this.logDebug)
            console.info(`${Logger.timestamp}${chalk.magenta.bold('Nagato: ')}${chalk.black.bold(...arguments)}`);
    }

    static get timestamp() {
        if (Logger.timeStamps)
            return `[${('0'+new Date().getHours()).slice(-2)}:${('0'+new Date().getMinutes()).slice(-2)}:${('0'+new Date().getSeconds()).slice(-2)}]`;
        else
            return '';
    }
}

module.exports = Logger;