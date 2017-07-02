class BaseEvent {
  constructor(bot) {
    if (this.constructor === BaseEvent) {
      throw new Error('Cannot instantiate abstract BaseEvent.')
    }
    if (typeof this.event === 'string') {
      throw new Error('Must override Event.')
    }

    this.bot = bot
    this.once = false
  }

  load() {
    if (this.eventHandler === null) {
      throw new Error('Must override eventHandler.')
    } else if (this.once) {
      this.bot.once(this.event, this.eventHandler)
    } else {
      this.bot.on(this.event, this.eventHandler)
    }
  }

  remove() {
    this.bot.removeListener(this.event, this.eventHandler)
  }

}

module.exports = BaseEvent