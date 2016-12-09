const Logger = require('./Logger.js');

class BaseCommand {
    constructor(bot, options) {
        if (this.constructor === BaseCommand) {
            throw new Error('Cannot instantiate abstract BaseCommand')
        }
        this.bot = bot;
        this.log = new Logger();
        this._currentCooldown = {};
    }

    process(message, content, options) {
        if (!message || !content) return;
        if (options.delete && message.channel.guild && message.channel.permissionsOf('bot.id').has('manageMessages')) {
            message.delete().catch(err => log.warn('Error Deleting Command Message', err));
        }
    }

    sendMessage(channel, content, options) {
        channel.createMessage(content, options.upload).then((msg) => {
            if (options.edit) msg.edit(options.edit(msg));
            if (options.deleteSent) msg.deleteSent(msg, options.deleteSent > 0 ? options.deleteSent : undefined);
        }).catch(err => log.warn('Error Sending Message', err))
    }

    deleteSent(message, time) {
        time ? time : 5000;
        setTimeout(() => {
            message.delete().catch(err => log.warn('Error Deleting Sent Message', err));
        }, time)
    }

    cooldownCheck(user, cooldown) {
        if (this._currentCooldown.hasOwnProperty(user))
            return true;
        else {
            this._currentCooldown[user] = Date.now();
            setTimeout(() => {
                delete this._currentCooldown[user];
            }, cooldown * 1000)
            return false;
        }
    }

    cooldownTime(user, cooldown) {
        return ((this._currentCooldown[user] + (cooldown * 1000)) - Date.now()) / 1000;
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