class BaseCommand {
    constructor(bot, type) {
        if (this.constructor === BaseCommand)
            throw new Error("Cannot instantiate abstract BaseCommand.")

        this.bot = bot;
        this.type = type;

        this.dm = true;
        this.adminOnly = false;
        this.aliases = [];
        this.privateGuilds = null;
        this.permission = null;

        this.cooldown = 5000;
        this.execTimes = 0;
        this.currentlyOnCooldown = {};
    }

    get name() {
        throw new Error("Name must be overridden.");
    }

    get usage() {
        return `No Usage Message Currently Created for \`${this.name}\`.`;
    }

    get help() {
        return `No Help Message Currently Created for \`${this.name}\`.`;
    }

    execute(message, content, options = {}) {
        if (!message || !content ||
            !this.privateGuildCheck(message.channel.guild) ||
            !this.permissionsCheck(message) ||
            (!this.dm && !message.channel.guild) ||
            !this.adminCheck(message.author.id))
            return;
        if (this.cooldownCheck(message.author.id) && !this.bot.admins.includes(message.author.id))
            this.sendMessage(message.channel, `\`${this.name}\` is currently on cooldown for ${this.cooldownTime(message.author.id).toFixed(1)}s`);
        if (options.delete && message.channel.guild && message.channel.permissionsOf("bot.id").has("manageMessages"))
            message.delete().catch(err => this.bot.log.warn("Error Deleting Command Message", err));
        this.execTimes++;
        this.bot.log.command(message.channel.guild, message.channel.name, this.name, message.author.username);
        if (options.editSent && message.author.id === this.bot.user.id)
            message.channel.editMessage(message.id, content);
        else this.sendMessage(message.channel, content, options);
    }

    sendMessage(channel, content, options = {}) {
        channel.createMessage(content, options.upload ? options.upload : undefined).then((msg) => {
            if (options.edit)
                msg.edit(options.edit(msg));
            else if (options.deleteSent)
                this.deleteSent(msg, options.deleteSent);
        }).catch(err => this.bot.log.warn("Error Sending Message", err));
    }

    awaitMessage(input, output, timeout, messageTimestamp) {
        return this.bot.messageHandler.awaitMessage(input, output, timeout, messageTimestamp);
    }

    deleteSent(message, time) {
        setTimeout(() => {
            message.delete().catch(err => this.bot.log.warn("Error Deleting Sent Message", err));
        }, time)
    }

    cooldownCheck(user) {
        if (this.currentlyOnCooldown.hasOwnProperty(user))
            return true;
        else {
            this.currentlyOnCooldown[user] = Date.now();
            setTimeout(() => {
                delete this.currentlyOnCooldown[user];
            }, this.cooldown)
            return false;
        }
    }

    cooldownTime(user) {
        return ((this.currentlyOnCooldown[user] + this.cooldown) - Date.now()) / 1000;
    }

    privateGuildCheck(guild) {
        if (!this.privateGuilds || this.privateGuilds.includes(guild.id))
            return true;
        else if (!guild || !this.privateGuilds.includes(guild.id))
            return false;
    }

    adminCheck(author) {
        if (!this.adminOnly || this.bot.admins.includes(author))
            return true;
        else if (!this.bot.admins.includes(author))
            return false;
    }

    permissionsCheck(message) {
        var hasPermssion = true;
        if (this.permissions != null && message.channel.guild && !this.bot.admins.includes(message.author.id)) {
            var permissionKeys = Object.keys(this.permissions),
                userPermissions = message.channel.permissionsOf(message.author.id).json;
            for (var key of permissionKeys) {
                if (this.permissions[key] !== userPermissions[key]) {
                    hasPermssion = false;
                    break;
                }
            }
        }
        return hasPermssion;
    }
}

module.exports = BaseCommand;