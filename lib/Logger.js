const chalk = new(require("chalk")).constructor({
    enabled: true
});

class Logger {
    constructor(options) {
        this.logCommands = !(options.logCommands === false);
        this.logInfo = !(options.logInfo === false);
        this.logError = !(options.logError === false);
        this.logWarn = !(options.logWarn === false);
        this.logDebug = options.logDebug || false;
    }

    command(guild, channel, cmd, author) {
        if (this.logCommands)
            console.log(chalk.grey.bold(`@${guild ? guild.name : "Private Message"}: `) + chalk.green.bold(channel ? `#${channel}: ` : "") + chalk.yellow.bold(cmd) + " was used by " + chalk.cyan.bold(author));
    }

    info() {
        if (this.logInfo)
            console.info(chalk.magenta.bold("Nagato: ") + chalk.cyan.bold(...arguments));
    }

    error() {
        if (this.logError)
            console.error(chalk.magenta.bold("Nagato: ") + chalk.red.bold(...arguments));
    }

    warn() {
        if (this.logWarn)
            console.warn(chalk.magenta.bold("Nagato: ") + chalk.yellow.bold(...arguments));
    }

    debug() {
        if (this.logDebug)
            console.info(chalk.magenta.bold("Nagato: ") + chalk.black.bold(...arguments));
    }
}

module.exports = Logger;