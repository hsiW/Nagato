class BaseEvent {
  /**
   * @param {Client} bot
   */
  constructor(bot) {
    if (this.constructor === BaseEvent) {
      throw new Error('Cannot instantiate abstract BaseEvent.')
    }
    if (typeof this['event'] !== 'string') {
      throw new Error('Must override Event.')
    }

    this.bot = bot
    this.once = false
  }

  load() {
    // noinspection JSUnresolvedVariable
    if (this.eventHandler === null || this.eventHandler === undefined) {
      throw new Error('Must override eventHandler.')
    } else if (this.once) {
      // noinspection JSUnresolvedFunction
      this.bot.once(this['event'], this['eventHandler'])
    } else {
      // noinspection JSUnresolvedFunction
      this.bot.on(this['event'], this['eventHandler'])
    }
  }

  remove() {
    // noinspection JSUnresolvedFunction
    this.bot.removeListener(this['event'], this['eventHandler'])
  }
}

module.exports = BaseEvent
