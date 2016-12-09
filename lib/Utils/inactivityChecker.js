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
        return _inactiveGuilds;
    }

    addToUsageCheck(guild) {
        if (!guild) return;
        if (!_data.hasOwnProperty(guild.id)) {
            _data[guild.id] = Date.now();
        }
    }

    removeFromUsageCheck(guild) {
        if (!guild) return;
        if (usageCheck.hasOwnProperty(guild.id)) {
            delete _data[guild.id];
        }
    }

    updateTimeStamp(guild) {
        if (!guild) return;
        if (_data.hasOwnProperty(guild.id)) {
            _data[guild.id] = Date.now();
        }
        if (_inactiveGuilds.indexOf(guild.id) > -1) {
            _inactiveGuilds.splice(_inactiveGuilds.indexOf(guild.id), 1);
        }
    }

    checkInactivity(bot) {
        let now = Date.now();
        Object.keys(_data).map(id => {
            if (!bot.guilds.get(id)) {
                delete _data[id];
            }
        });
        bot.guilds.forEach(guild => {
            if (!_data.hasOwnProperty(guild.id)) {
                _data[guild.id] = now;
            } else if ((now - _data[guild.id]) >= 1.21e+9) {
                _inactiveGuilds.push(guild.id);
            }
        })
    }

    removeInactive(bot) {
        this.checkInactivity(bot)
        if (_inactiveGuilds.length === 0) return;
        else {
            let count = 0,
                guildCount = 0;
            var removalInterval = setInterval(() => {
                let guild = bot.guilds.get(_inactiveGuilds[guildCount]);
                if (count >= _inactiveGuilds.length) {
                    usageUpdated = true;
                    clearInterval(removalInterval);
                    return;
                } else if (guild) {
                    guild.leave().catch(console.log);
                    if (_data.hasOwnProperty(guild.id)) delete _data[guild.id];
                    count++;
                } else delete _data[_inactiveGuilds[guildCount]];
                guildCount++;
            }, 200)
        }
    }

    saveFile() {
        utils.saveFile(_fileLocation, _data)
    }
}