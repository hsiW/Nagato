const fs = require('fs'),
    path = require('path');

class CommandLoader {
    constructor(bot, commandsFolder) {
        if (!commandsFolder) {
            throw new Error('No Command Folder Set')
        }
        this.commandsFolder = path.resolve('/', commandsFolder);
        this.bot = bot;
        this.commands = {};
        this.commandAliases = {};
    }

    load() {
        return new Promise((resolve, reject) => {
            fs.readdir(this.commandsFolder, (err, files) => {
                if (err) reject(`Error reading commands directory: ${err}`);
                else if (files) {
                    files.forEach(file => {
                        if (file.endsWith('.js')) {
                            try {
                                var command = new(require(`${this.commandsFolder}/${file}`))(this.bot, 'General');
                                if (this.commands.hasOwnProperty(command.name)) return;
                                this.commands[command.name] = command;
                            } catch (e) {
                                this.bot.log.warn(`${name} - ${e.stack}`);
                            }
                        } else {
                            fs.readdir(`${this.commandsFolder}/${file}/`, (error, loaded) => {
                                if (error) reject(`Error reading commands directory: ${error}`);
                                else if (loaded.length < 1) this.bot.log.warn(`${file} was empty and has been skipped.`);
                                else if (loaded) {
                                    for (var name of loaded) {
                                        try {
                                            var command = new(require(`${this.commandsFolder}/${file}/${name}`))(this.bot, file);
                                            if (this.commands.hasOwnProperty(command.name)) continue;
                                            this.commands[command.name] = command;
                                        } catch (e) {
                                            this.bot.log.warn(`${name} - ${e.stack}`);
                                        }
                                    }
                                }
                            });
                        }
                        for (var command in this.commands) {
                            if (this.commands[command].aliases) this.commands[command].aliases.forEach(alias => {
                                this.commandAliases[alias] = command;
                            })
                        }
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