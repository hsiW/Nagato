// noinspection JSPotentiallyInvalidConstructorUsage
const chalk = new (require('chalk')).constructor({
  enabled: true,
});

class Logger {
  constructor(options) {
    this.logCommands = !!options.logCommands;
    this.logInfo = !!options.logInfo;
    this.logWarn = !!options.logWarn;
    this.logError = !!options.logError;
    this.logDebug = options.logDebug || false;
    this.logColour = !!options.logColour;

    Logger.timeStamps = options.timeStamps || false;
  }

  /**
   * @param {Message} msg
   * @param {string} cmd
   */
  command(msg, cmd) {
    if (this.logCommands) {
      const channel = msg.channel.name;
      const author = msg.author.username;
      const guild = msg.channel.guild;

      if (this.logColour) {
        console.log(`${Logger.timestamp}[CMMD]` +
          `${chalk['magenta'].bold(`@${guild ? guild.name : 'Private Message'}: `)}` +
          `${chalk['green'].bold(channel ? `#${channel}: ` : '')}` +
          `${chalk['yellow'].bold(cmd)} was used by ${chalk['cyan'].bold(author)}`);
      } else {
        console.log(`${Logger.timestamp}[CMMD]${`@${guild ? guild.name : 'Private Message'}: `}${channel ? `#${channel}: ` : ''}${cmd} was used by ${author}`);
      }
    }
  }

  /**
   * @param {string|Array} arguments
   */
  info() {
    if (this.logInfo) {
      if (this.logColour) {
        console.info(`${Logger.timestamp}[INFO]` +
          `${chalk['magenta'].bold('Nagato: ')}` +
          `${chalk['cyan'].bold(...arguments)}`);
      } else {
        console.info(`${Logger.timestamp}[INFO]Nagato: ${[...arguments]}`);
      }
    }
  }

  /**
   * @param {string|Array} arguments
   */
  warn() {
    if (this.logWarn) {
      if (this.logColour) {
        console.warn(`${Logger.timestamp}[WARN]` +
          `${chalk['magenta'].bold('Nagato: ')}${chalk['yellow'].bold(...arguments)}`);
      } else {
        console.warn(`${Logger.timestamp}[WARN]Nagato: ${[...arguments]}`);
      }
    }
  }
  /**
   * @param {string|Array} arguments
   */
  error() {
    if (this.logError) {
      if (this.logColour) {
        console.error(`${Logger.timestamp}[EROR]` +
          `${chalk['magenta'].bold('Nagato: ')}${chalk['red'].bold(...arguments)}`);
      } else {
        console.error(`${Logger.timestamp}[EROR]Nagato: ${[...arguments]}`);
      }
    }
  }
  /**
   * @param {string|Array} arguments
   */
  debug() {
    if (this.logDebug) {
      if (this.logColour) {
        console.info(`${Logger.timestamp}[DBUG]` +
          `${chalk['magenta'].bold('Nagato: ')}${chalk['black'].bold(...arguments)}`);
      } else {
        console.info(`${Logger.timestamp}[DBUG]Nagato: ${[...arguments]}`);
      }
    }
  }

  /**
   * @returns {string}
   */
  static get timestamp() {
    if (Logger.timeStamps) {
      return `[${('0' + new Date().getHours()).slice(-2)}:` +
        `${('0' + new Date().getMinutes()).slice(-2)}:` +
        `${('0' + new Date().getSeconds()).slice(-2)}]`;
    } else {
      return '';
    }
  }
}

module.exports = Logger;
