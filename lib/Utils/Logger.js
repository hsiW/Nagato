const chalk = new(require('chalk')).constructor({
    enabled: true
});

class Logger {
    constructor(options) {

    }

    command(guild, channel, cmd, author) {
        if (!guild) guild = 'Private Message';
        console.log(chalk.grey.bold(`@${guild}: `) + chalk.green.bold(`#${channel}: `) + chalk.yellow.bold(cmd) + ' was used by ' + chalk.cyan.bold(author))
    }

    info() {
        console.info(chalk.magenta.bold('Nagato: ') + chalk.cyan.bold(...arguments))
    }

    warn() {
        console.info(chalk.magenta.bold('Nagato: ') + chalk.yellow.bold(...arguments))
    }

    error() {
        console.error(chalk.magenta.bold('Nagato: ') + chalk.red.bold(...arguments))
    }
}

module.exports = Logger;