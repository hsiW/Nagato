const fs = require('fs'),
    path = require('path'),
    Logger = require('./Logger.js');

class CommandLoader {
    constructor(bot, commandsFolder) {
        if (!commandsFolder) {
            throw new Error('No Command Folder Set')
        }
        this.commandsFolder = path.resolve('/', commandsFolder);
        this.bot = bot;
        this.log = new Logger();
        this.commands = {};
        this.commandAliases = {};
    }

    load() {
        return new Promise((resolve, reject) => {
            fs.readdir(this.commandsFolder, (err, folders) => {
                if (err) reject(`Error reading commands directory: ${err}`);
                else if (folders) {
                    folders.forEach(folder => {
                        fs.readdir(`${this.commandsFolder}/${folder}/`, (error, loaded) => {
                            if (error) reject(`Error reading commands directory: ${error}`);
                            else if (loaded.length < 1) log.warn(`${folder} was empty and has been skipped.`);
                            else if (loaded) {
                                for (var name of loaded) {
                                    try {
                                        var command = new(require(`${this.commandsFolder}/${folder}/${name}`))(this.bot, folder);
                                        this.commands[command.name] = command;
                                    } catch (e) {
                                        this.log.warn(`${name} - ${e.stack}`);
                                    }
                                }
                                for (var command in this.commands) {
                                    if (this.commands[command].aliases) this.commands[command].aliases.forEach(alias => {
                                        this.commandAliases[alias] = command;
                                    })
                                }
                            }
                        });
                    });
                    resolve({
                        commands: this.commands,
                        commandAliases: this.commandAliases
                    });

                }
            })
        })
    }
}

module.exports = CommandLoader;