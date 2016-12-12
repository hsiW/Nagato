class BaseEvent {
    constructor(bot) {
        if (this.constructor === BaseEvent) {
            throw new Error('Cannot instantiate abstract BaseEvent.')
        }

        this.bot = bot;

        this.event = null
        this.eventHandler = null;

        if (this.event === null) {
            throw new Error('Must override Event.')
        }
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