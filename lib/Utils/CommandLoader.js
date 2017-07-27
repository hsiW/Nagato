const fs = require('fs')
const path = require('path')

class CommandLoader {
  /**
   * @param {Nagato} bot
   * @param {string} commandsFolder
   */
  constructor(bot, commandsFolder) {
    if (!commandsFolder) {
      throw new Error('No Command Folder Set.')
    }

    this.bot = bot

    this.commands = new Map()
    this.commandAliases = new Map()
    this.commandsFolder = path.resolve('/', commandsFolder)
  }

  async load() {
    let folders

    try {
      folders = await this.readDir(this.commandsFolder)
    } catch(e) {
      throw new Error`Error reading commands directory: ${e}`
    }

    folders.forEach(async file => {
      if (file.endsWith('.js')) {
        this.addCommand(`${this.commandsFolder}/${file}`, file, 'General')
      } else {
        let files

        try {
          files = await this.readDir(this.commandsFolder + `/${file}/`)
        } catch(e) {
          throw new Error`Error reading commands directory: ${error}`
        }
        if (files.length < 1) {
          this.bot['log'].warn(`${file} was empty and has been skipped.`)
        } else {
          for (const name of files) {
            try {
              this.addCommand(`${this.commandsFolder}/${file}/${name}`, name, file)
            } catch (e) {
            }
          }
        }
      }
    })
    return [this.commands, this.commandAliases]
  }

  // noinspection JSMethodCanBeStatic
  /**
   * @param {string} directory
   * @returns {Promise.<Array>}
   */
  async readDir(directory) {
    return fs.readdirSync(directory)
  }

  /**
   * @param {string} directory
   * @param {string} name
   * @param {string} type
   */
  addCommand(directory, name, type) {
    if (!name.endsWith('.js')) {
      this.bot['log'].warn(`${name} was skipped because it is not a js file.`)
    } else if (name.includes(' ')) {
      this.bot['log'].warn(`${name} was skipped because the file name contains a space.`)
    } else {
      try {
        let f = require(directory)

        if (!(f.prototype && f.prototype.hasOwnProperty('constructor'))) {
          return
        }

        const command = new(f)(this.bot, type)

        if (this.commands.has(command.name)) {
          this.bot['log'].warn(`${command.name} was already created in the ` +
            `commands object so it has been skipped.`)
        } else {
          if (command.aliases) {
            command.aliases.forEach(alias => {
              if (this.commands.has(alias)) {
                this.bot['log'].warn(`${alias} has already been mapped to the ` +
                  `command, ${this.commands.get(alias).name}, so it has been skipped.`)
              } else if (this.commandAliases.has(alias)) {
                this.bot['log'].warn(`${alias} has already been mapped to the ` +
                  `alias, ${this.commandAliases.get(alias)}, so it has been skipped.`)
              } else {
                this.commandAliases.set(alias, command.name)
              }
            })
          }

          this.commands.set(command.name, command)
        }
      } catch (e) {
        this.bot['log'].warn(`${name} - ${e.stack}`)
      }
    }
  }
}

module.exports = CommandLoader
