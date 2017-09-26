const fs = require('fs');
const path = require('path');

class CommandLoader {
  /**
   * @param {Nagato} bot
   * @param {string} commandsFolder
   */
  constructor(bot, commandsFolder) {
    if (!commandsFolder) {
      throw new Error('No Command Folder Set.');
    }

    this.bot = bot;

    this.commands = new Map();
    this.commandAliases = new Map();
    this.commandsFolder = path.resolve('/', commandsFolder);
  }

  async load() {
    const paths = await this._paths(this.commandsFolder);

    for (const path of paths) {
      if (!path.endsWith('.js') || path.includes(' ')) {
        continue;
      }

      this.addCommand(path);
    }

    return [this.commands, this.commandAliases];
  }

  /**
   * @param {string} path
   */
  addCommand(path) {
    try {
      delete require.cache[require.resolve(path)];

      let f = require(path);

      if (!(f.prototype && f.prototype.hasOwnProperty('constructor'))) {
        return;
      }

      // eslint-disable-next-line new-cap
      const command = new (f)(this.bot);

      if (this.commands.has(command.name)) {
        this.bot['log'].warn(`${command.name} was already created in the ` +
          `commands object so it has been skipped.`);
      } else {
        if (command.aliases) {
          command.aliases.forEach(alias => {
            if (this.commands.has(alias)) {
              this.bot['log'].warn(`${alias} has already been mapped to the ` +
                `command, ${this.commands.get(alias).name}, so it has been skipped.`);
            } else if (this.commandAliases.has(alias)) {
              this.bot['log'].warn(`${alias} has already been mapped to the ` +
                `alias, ${this.commandAliases.get(alias)}, so it has been skipped.`);
            } else {
              this.commandAliases.set(alias, command.name);
            }
          });
        }

        this.commands.set(command.name, command);
      }
    } catch (e) {
      this.bot['log'].warn(`${path} - ${e.stack}`);
    }
  }

  /**
   * @returns {Promise<Array.<string>>}
   * @private
   */
  async _paths(directory) {
    let paths = [];
    let list = await new Promise((resolve, reject) => {
      fs.readdir(directory, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });

    for (const item of list) {
      const path = `${directory}/${item}`;
      const stat = await new Promise((resolve, reject) => {
        fs.stat(path, (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        });
      });

      if (stat && stat.isDirectory()) {
        paths = paths.concat(await this._paths(path));
      } else {
        paths.push(path);
      }
    }

    return paths;
  }
}

module.exports = CommandLoader;
