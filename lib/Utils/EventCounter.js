class EventCounter {
  /**
   * @param {Client} bot
   */
  constructor(bot) {
    this.bot = bot

    this.eventCount = []

    this.rawWSHandler = (packet, id) => {
      if (packet.op !== 0) {
        return
      }

      const event = packet.t

      if (typeof this.eventCount[id] === 'undefined') {
        this.eventCount[id] = new Map()
        this.eventCount[id].set(event, 0)
      }

      const counter = this.eventCount[id].get(event)
      this.eventCount[id].set(event, counter ? counter + 1 : 1)
    }
  }

  create() {
    // noinspection JSUnresolvedFunction
    this.bot.on('rawWS', this.rawWSHandler)
  }
}

module.exports = EventCounter
