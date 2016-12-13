class BaseEvent {
    constructor(bot) {
        if (this.constructor === BaseEvent) {
            throw new Error('Cannot instantiate abstract BaseEvent.')
        }

        this.bot = bot;
        this.eventHandler = null;


    }

    get event() {
        throw new Error('Must override Event.');
    }

    load() {
        if (this.eventHandler === null) {
            throw new Error('Must override eventHandler.')
        }
        this.bot.on(this.event, this.eventHandler)
    }

    remove() {
        this.bot.removeEventListener(this.event, this.eventHandler)
    }

}

module.exports = BaseEvent;