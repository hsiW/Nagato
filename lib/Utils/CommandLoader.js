const fs = require('fs'),
    Logger = require('./Logger');

class CommandLoader {
    constructor(bot) {
        this.bot = bot;
        this.log = new Logger();
        this.commands = {};
        this.aliases = {};
    }

    load() {
        return new Promise((resolve, reject) => {
                fs.readdir(`${__dirname}/commands/`, (err, folders) => {
                        if (err) reject(`Error reading commands directory: ${err}`);
                        else if (folders) {
                            folders.forEach(folder => {
                                fs.readdir(`${__dirname}/commands/${folder}/`, (error, loaded) => {
                                    if (error) reject(`Error reading commands directory: ${error}`);
                                    else if (loaded.length < 1) log.warn(`${folder} was empty and has been skipped.`);
                                    else if (loaded) {
                                        for (var name of loaded) {
                                            if (!name.endsWith('.js')) continue;
                                            try {
                                                var command = new(require(`${__dirname}/commands/${folder}/${name}`));
                                                this.commands[command.name] = command;
                                            } catch (e) {
                                                log.warn(`${name} - ${e.stack}`);
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
                            resolve();

                        }
                    }
                })
        }