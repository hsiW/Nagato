class BaseCommand {
    constructor(bot, type) {
        if (this.constructor === BaseCommand)
            throw new Error("Cannot instantiate abstract BaseCommand.")
        this.bot = bot;
        this.type = type;

        this.dm = true;
        this.togglable = true;
        this.adminOnly = false;
        this.aliases = null;
        this.privateGuilds = null;
        this.permissions = null;

        this.execTimes = 0;
        this.currentCooldown = {};
    }

    get name() {
        throw new Error("Name must be overridden.");
    }

    get usage() {
        return this.name;
    }

    get help() {
        return `No Help Message Currently Created for \`${this.name}\`.`;
    }

    execute(message, content, options) {
        if(!options) options = {};
        if (!this.privateGuildCheck(message.channel.guild) || !this.permissionsCheck(message) || (!this.dm && !message.channel.guild) || !this.adminCheck(message.author.id) || !message || !content)
            return;
        if (this.cooldownCheck(message.author.id) && !this.bot.Admins.includes(message.author.id))
            this.sendMessage(message.channel, `\`${this.name}\` is currently on cooldown for ${this.cooldownTime(message.author.id).toFixed(1)}s`);
        if (options.delete && message.channel.guild && message.channel.permissionsOf("bot.id").has("manageMessages"))
            message.delete().catch(err => this.bot.log.warn("Error Deleting Command Message", err));
        this.execTimes++;
        this.bot.log.command(message.channel.guild, message.channel ? message.channel.name : undefined, this.name, message.author.username);
        if (options.editSent && message.author.id === this.bot.user.id)
            message.channel.editMessage(message.id, content);
        else this.sendMessage(message.channel, content, options);
    }

    sendMessage(channel, content, options) {
        channel.createMessage(content, options.upload ? options.upload : undefined).then((msg) => {
            if (options.edit)
                msg.edit(options.edit(msg));
            else if (options.deleteSent)
                this.deleteSent(msg, options.deleteSent);
        }).catch(err => this.bot.log.warn("Error Sending Message", err));
    }

    deleteSent(message, time) {
        setTimeout(() => {
            message.delete().catch(err => this.bot.log.warn("Error Deleting Sent Message", err));
        }, time)
    }

    cooldownCheck(user, cooldown) {
        if (this.currentCooldown.hasOwnProperty(user))
            return true;
        else {
            this.currentCooldown[user] = Date.now();
            setTimeout(() => {
                delete this.currentCooldown[user];
            }, cooldown ? cooldown : 5 * 1000)
            return false;
        }
    }

    cooldownTime(user, cooldown) {
        return ((this.currentCooldown[user] + cooldown) - Date.now()) / 1000;
    }

    privateGuildCheck(guild) {
        if (!this.privateGuilds)
            return true;
        else if (!guild)
            return false;
        else if (!this.privateGuilds.includes(guild.id))
            return false;
        else if (this.privateGuilds.includes(guild.id))
            return true;
    }

    adminCheck(author) {
        if (!this.adminOnly)
            return true;
        else if (!this.bot.Admins.includes(author))
            return false;
        else if (this.bot.Admins.includes(author))
            return true;
    }

    permissionsCheck(message) {
        var hasPermssion = true;
        if (this.permissions != null && message.channel.guild && !this.bot.Admins.includes(message.author.id)) {
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