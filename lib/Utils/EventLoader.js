const fs = require('fs'),
    path = require('path');

class EventLoader {
    constructor(bot, eventsFolder) {
        if (!eventsFolder) {
            throw new Error('No Event Folder Set.')
        }

        this.bot = bot;
        this.eventsFolder = path.resolve('/', eventsFolder);
        this.events = {};
    }

    load() {
        return new Promise((resolve, reject) => {
            fs.readdir(this.eventsFolder, (err, files) => {
                if (err) reject(`Error reading events directory: ${err}`)
                else if (files) {
                    files.forEach(file => {
                        if (!file.endsWith('.js')) this.bot.log.warn(`${file} was skipped because it is not a js file.`);
                        else if (file.includes(' ')) this.bot.log.warn(`${file} contains a space and has been skipped.`);
                        else {
                            try {
                                var event = new(require(`${this.eventsFolder}/${file}`))(this.bot);
                                if (this.events.hasOwnProperty(event.event)) {
                                    this.bot.log.warn(`${event.event} is already created in events object.`);
                                    return;
                                }
                                this.events[event.event] = event;
                            } catch (e) {
                                this.bot.log.warn(`${file} - ${e.stack}`);
                            }
                        }
                    })
                    resolve(this.events);
                }
            })
        })
    }
}

module.exports = EventLoader;