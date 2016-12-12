class BaseEvent {
    constructor(bot, event) {
        if (this.constructor === BaseEvent) {
            throw new Error('Cannot instantiate abstract BaseEvent.')
        }
        this.bot = bot;
        this.eventHandler = null;
        if (this.eventHandler === null) {
            throw new Error('Must override eventHandler.')
        }
    }

    load() {
        this.bot.on(event, this.eventHandler)
    }

    remove() {
        this.bot.removeEventListener(event, this.eventHandler)
    }

}

module.exports = BaseEvent;