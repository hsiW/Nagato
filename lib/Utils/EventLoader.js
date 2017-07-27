const fs = require('fs')
const path = require('path')

class EventLoader {
  /**
   * @param {Nagato} bot
   * @param {string} eventsFolder
   */
  constructor(bot, eventsFolder) {
    if (!eventsFolder) {
      throw new Error('No Event Folder Set.')
    }

    this.bot = bot

    this.events = {}
    this.eventsFolder = path.resolve('/', eventsFolder)
  }

  async load() {
    let files

    try {
      files = await this.readDir(this.eventsFolder)
    } catch(e) {
      throw new Error`Error reading events directory: ${e}`
    }
      files.forEach(file => {
        if (!file.endsWith('.js')) {
          this.bot['log'].warn(`${file} was skipped because it is not a js file.`)
        } else if (file.includes(' ')) {
          this.bot['log'].warn(`${file} was skipped because the file name contains a space.`)
        } else {
          const path = `${this.eventsFolder}/${file}`
          delete require.cache[require.resolve(path)]
          let f = require(path)

          if (!(f.prototype && f.prototype.hasOwnProperty('constructor'))) {
            return
          }

          try {
            const event = new(f)(this.bot)

            if (this.events.hasOwnProperty(event.event)) {
              this.bot['log'].warn(`${event.event} was skipped because it is ` +
                `already created in events object.`)
            } else {
              this.events[event.event] = event;
            }
          } catch (e) {
            this.bot['log'].warn(`${file} - ${e.stack}`)
          }
        }
      })
      return this.events
    }

  // noinspection JSMethodCanBeStatic
  /**
   * @param {string} directory
   * @returns {Promise.<Array>}
   */
  async readDir(directory) {
    return fs.readdirSync(directory)
  }
}

module.exports = EventLoader
