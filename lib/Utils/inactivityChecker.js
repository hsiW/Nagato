const fs = require('fs'),
    utils = require('./utils.js');

class inactivityChecker {
    constructor(file, inactiveTime) {
        this._data = require(file);
        this._fileLocation = file;
        this._inactiveGuilds = [];
        this.inactiveTime = inactiveTime;
    }

    get inactive() {
        return this._inactiveGuilds;
    }

    addToUsageCheck(guild) {
        if (!guild) return;
        if (!this._data.hasOwnProperty(guild.id)) {
            this._data[guild.id] = Date.now();
        }
    }

    removeFromUsageCheck(guild) {
        if (!guild) return;
        if (this._data.hasOwnProperty(guild.id)) {
            delete this._data[guild.id];
        }
    }

    updateTimeStamp(guild) {
        if (!guild) return;
        if (this._data.hasOwnProperty(guild.id)) {
            this._data[guild.id] = Date.now();
        }
        if (this._inactiveGuilds.indexOf(guild.id) > -1) {
            this._inactiveGuilds.splice(this._inactiveGuilds.indexOf(guild.id), 1);
        }
    }

    checkInactivity(bot) {
        let now = Date.now();
        Object.keys(this._data).map(id => {
            if (!bot.guilds.get(id)) {
                delete this._data[id];
            }
        });
        bot.guilds.forEach(guild => {
            if (!this._data.hasOwnProperty(guild.id)) {
                this._data[guild.id] = now;
            } else if ((now - this._data[guild.id]) >= this.inactiveTime) {
                this._inactiveGuilds.push(guild.id);
            }
        })
    }

    removeInactive(bot) {
        this.checkInactivity(bot)
        if (this._inactiveGuilds.length === 0) return;
        else {
            let count = 0,
                guildCount = 0;
            var removalInterval = setInterval(() => {
                let guild = bot.guilds.get(this._inactiveGuilds[guildCount]);
                if (count >= this._inactiveGuilds.length) {
                    usageUpdated = true;
                    clearInterval(removalInterval);
                    return;
                } else if (guild) {
                    guild.leave().catch(console.log);
                    if (this._data.hasOwnProperty(guild.id)) delete this._data[guild.id];
                    count++;
                } else delete _data[this._inactiveGuilds[guildCount]];
                guildCount++;
            }, 200)
        }
    }

    saveFile() {
        utils.saveFile(this._fileLocation, this._data)
    }
}