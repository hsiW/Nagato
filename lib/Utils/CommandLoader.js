const fs = require('fs'),
    path = require('path');

class CommandLoader {
    constructor(bot, commandsFolder) {
        if (!commandsFolder) {
            throw new Error('No Command Folder Set.')
        }
        this.bot = bot;
        this.commandsFolder = path.resolve('/', commandsFolder);
        this.commands = {};
        this.commandAliases = {};
    }

    load() {
        return new Promise((resolve, reject) => {
            fs.readdir(this.commandsFolder, (err, files) => {
                if (err) reject(`Error reading commands directory: ${err}`);
                else if (files) {
                    files.forEach(file => {
                        if (file.includes(' ')) this.bot.log.warn(`${file} contains a space and has been skipped.`);
                        else if (file.endsWith('.js')) {
                            try {
                                var command = new(require(`${this.commandsFolder}/${file}`))(this.bot, 'General');
                                if (this.commands.hasOwnProperty(command.name)) {
                                    this.bot.log.warn(`${command.name} is already created in the commands object.`);
                                    return;
                                }
                                if (command.aliases) command.aliases.forEach(alias => {
                                    this.commandAliases[alias] = command.name;
                                })
                                this.commands[command.name] = command;
                            } catch (e) {
                                this.bot.log.warn(`${file} - ${e.stack}`);
                            }
                        } else {
                            fs.readdir(`${this.commandsFolder}/${file}/`, (error, loaded) => {
                                if (error) reject(`Error reading commands directory: ${error}`);
                                else if (loaded.length < 1) this.bot.log.warn(`${file} was empty and has been skipped.`);
                                else if (loaded) {
                                    for (var name of loaded) {
                                        if (name.includes(' ')) {
                                            this.bot.log.warn(`${name} contains a space and has been skipped.`);
                                            continue;
                                        }
                                        if (!name.endsWith('.js')) {
                                            this.bot.log.warn(`${name} is not a js file and has been skipped.`);
                                            continue;
                                        }
                                        try {
                                            var command = new(require(`${this.commandsFolder}/${file}/${name}`))(this.bot, file);
                                            if (this.commands.hasOwnProperty(command.name)) {
                                                this.bot.log.warn(`${command.name} is already created in the commands object.`);
                                                continue;
                                            }
                                            if (command.aliases) command.aliases.forEach(alias => {
                                                this.commandAliases[alias] = command.name;
                                            })
                                            this.commands[command.name] = command;
                                        } catch (e) {
                                            this.bot.log.warn(`${name} - ${e.stack}`);
                                        }
                                    }
                                }
                            });
                        }
                    });

                }
            })
            resolve({
                commands: this.commands,
                commandAliases: this.commandAliases
            });
        })
    }
}

module.exports = CommandLoader;