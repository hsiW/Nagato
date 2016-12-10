const Logger = require('./Logger.js');

class BaseCommand {
    constructor(bot, type) {
        if (this.constructor === BaseCommand) {
            throw new Error('Cannot instantiate abstract BaseCommand')
        }
        this.type = type;
        this.execTimes = 0;
        this.bot = bot;
        this.log = new Logger();
        this.currentCooldown = {};
    }

    get name() {
        throw new Error('Name must be changed.')
    }

    get usage() {
        return 'No Usage Currently Set.'
    }

    execute(message, content, options) {
        if (!message || !content) return;
        if (options && options.delete && message.channel.guild && message.channel.permissionsOf('bot.id').has('manageMessages')) {
            message.delete().catch(err => log.warn('Error Deleting Command Message', err));
        }
        this.log.command(message.channel.guild, message.channel ? message.channel.name : undefined, this.name, message.author.username);
        this.sendMessage(message.channel, content, options);
    }

    sendMessage(channel, content, options) {
        channel.createMessage(content, options && options.upload ? options.upload : undefined).then((msg) => {
            if (options && options.edit) msg.edit(options.edit(msg));
            if (options && options.deleteSent) msg.deleteSent(msg, options.deleteSent > 0 ? options.deleteSent : undefined);
        }).catch(err => log.warn('Error Sending Message', err))
    }

    deleteSent(message, time) {
        time = time ? time : 5000;
        setTimeout(() => {
            message.delete().catch(err => log.warn('Error Deleting Sent Message', err));
        }, time)
    }

    cooldownCheck(user, cooldown) {
        cooldown = cooldown ? cooldown : 5;
        if (this.currentCooldown.hasOwnProperty(user))
            return true;
        else {
            this.currentCooldown[user] = Date.now();
            setTimeout(() => {
                delete this.currentCooldown[user];
            }, cooldown * 1000)
            return false;
        }
    }

    cooldownTime(user, cooldown) {
        return ((this.currentCooldown[user] + (cooldown ? cooldown : 5 * 1000)) - Date.now()) / 1000;
    }

    privateCheck(guild, privateGuilds) {
        if (!privateGuilds)
            return false;
        else if (!guild)
            return true;
        else if (privateGuilds.indexOf(guild.id) > -1)
            return false;
        else
            return true;
    }

    permissionsCheck(msg) {
        var hasPermssion = true;
        if (this.permissions != null && msg.channel.guild) {
            var permissionKeys = Object.keys(this.permissions),
                userPermissions = msg.channel.permissionsOf(msg.author.id).json;
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