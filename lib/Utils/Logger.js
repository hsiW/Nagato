const chalk = new(require('chalk')).constructor({
    enabled: true
});

class Logger {
    constructor() {}

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