const fs = require('fs')
const path = require('path')
const Eris = require('eris')

class CommandLoader {
  constructor(bot, commandsFolder) {
    if (!commandsFolder) {
      throw new Error('No Command Folder Set.')
    }

    this.bot = bot

    this.commands = new Eris.Collection(Object)
    this.commandAliases = new Map()
    this.commandsFolder = path.resolve('/', commandsFolder)
  }

  load() {
    return new Promise((resolve, reject) => {
      fs.readdir(this.commandsFolder, (err, files) => {
        if (err) {
          reject(`Error reading commands directory: ${err}`)
        } else if (files) {
          files.forEach(file => {
            if (file.endsWith('.js')) {
              this.addCommand(`${this.commandsFolder}/${file}`, file, 'General')
            } else {
              fs.readdir(`${this.commandsFolder}/${file}/`, (error, loaded) => {
                if (error) {
                  reject(`Error reading commands directory: ${error}`)
                } else if (loaded.length < 1) {
                  this.bot.log.warn(`${file} was empty and has been skipped.`)
                } else if (loaded) {
                  for (const name of loaded) {
                    try {
                      this.addCommand(`${this.commandsFolder}/${file}/${name}`, name, file)
                    } catch (e) {
                    }
                  }
                }
              })
            }
          })
        }
      })

      resolve({
        commands: this.commands,
        commandAliases: this.commandAliases
      })
    })
  }

  addCommand(directory, name, type) {
    if (!name.endsWith('.js')) {
      this.bot.log.warn(`${name} was skipped because it is not a js file.`)
    } else if (name.includes(' ')) {
      this.bot.log.warn(`${name} was skipped because the file name contains a space.`)
    } else {
      try {
        let f = require(directory)

        if (!(f.prototype && f.prototype.hasOwnProperty('constructor'))) {
          return
        }

        const command = new(f)(this.bot, type)

        if (this.commands.has(command.id)) {
          this.bot.log.warn(`${command.id} was already created in the commands object so it has been skipped.`)
        } else {
          if (command.aliases) {
            command.aliases.forEach(alias => {
              if (this.commands.has(alias)) {
                this.bot.log.warn(`${alias} has already been mapped to the command, ${this.commands.get(alias).name}, so it has been skipped.`)
              } else if (this.commandAliases.has(alias)) {
                this.bot.log.warn(`${alias} has already been mapped to the alias, ${this.commandAliases.get(alias)}, so it has been skipped.`)
              } else {
                this.commandAliases.set(alias, command.id)
              }
            })
          }

          this.commands.add(command)
        }
      } catch (e) {
        this.bot.log.warn(`${name} - ${e.stack}`)
      }
    }
  }
}

module.exports = CommandLoader
