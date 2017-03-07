const fs = require("fs"),
    path = require("path"),
    Eris = require("eris");

class CommandLoader {
    constructor(bot, commandsFolder) {
        this.bot = bot;

        if (!commandsFolder)
            throw new Error("No Command Folder Set.")
        this.commandsFolder = path.resolve("/", commandsFolder);

        this.commands = new Eris.Collection(Object);
        this.commandAliases = new Map();
    }

    load() {
        return new Promise((resolve, reject) => {
            fs.readdir(this.commandsFolder, (err, files) => {
                if (err) reject(`Error reading commands directory: ${err}`);
                else if (files) {
                    files.forEach(file => {
                        if (file.includes(" ")) this.bot.log.warn(`${file} contains a space and has been skipped.`);
                        else if (file.endsWith(".js")) {
                            try {
                                var command = new(require(`${this.commandsFolder}/${file}`))(this.bot, "General");
                                if (this.commands.has(command.id))
                                    this.bot.log.warn(`${command.id} is already created in the commands object.`);
                                else {
                                    if (command.aliases)
                                        command.aliases.forEach(alias => {
                                            if (this.commands.has(alias))
                                                this.bot.log.warn(`${alias} has already been mapped to ${this.commands.get(alias).name} so it has been skipped.`);
                                            else if (this.commandAliases.has(alias))
                                                this.bot.log.warn(`${alias} has already been mapped to ${this.commandAliases.get(alias)} so it has been skipped.`);
                                            else
                                                this.commandAliases.set(alias, command.id);
                                        });
                                    this.commands.add(command);
                                }
                            } catch (e) {
                                this.bot.log.warn(`${file} - ${e.stack}`);
                            }
                        } else {
                            fs.readdir(`${this.commandsFolder}/${file}/`, (error, loaded) => {
                                if (error) reject(`Error reading commands directory: ${error}`);
                                else if (loaded.length < 1) this.bot.log.warn(`${file} was empty and has been skipped.`);
                                else if (loaded) {
                                    for (var name of loaded) {
                                        if (name.includes(" "))
                                            this.bot.log.warn(`${name} contained a space and has been skipped.`);
                                        else if (!name.endsWith(".js"))
                                            this.bot.log.warn(`${name} is not a js file and has been skipped.`);
                                        else {
                                            try {
                                                var command = new(require(`${this.commandsFolder}/${file}/${name}`))(this.bot, file);
                                                if (this.commands.has(command.id))
                                                    this.bot.log.warn(`${command.id} was already created in the commands object.`);
                                                else {
                                                    if (command.aliases)
                                                        command.aliases.forEach(alias => {
                                                            if (this.commands.has(alias))
                                                                this.bot.log.warn(`${alias} has already been mapped to ${this.commands.get(alias).name} so it has been skipped.`);
                                                            else if (this.commandAliases.has(alias))
                                                                this.bot.log.warn(`${alias} has already been mapped to ${this.commandAliases.get(alias)} so it has been skipped.`);
                                                            else
                                                                this.commandAliases.set(alias, command.id);
                                                        });
                                                    this.commands.add(command);
                                                }
                                            } catch (e) {
                                                this.bot.log.warn(`${name} - ${e.stack}`);
                                            }
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