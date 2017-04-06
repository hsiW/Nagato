class EventCounter {
	constructor(bot) {
		this.bot = bot;

		this.eventCount = [];

		this.rawWSHandler = (packet, id) => {
			const event = packet.op !== 11 ? packet.t : 'HEARTBEAT';
			if (typeof this.eventCount[id] === 'undefined') {
				this.eventCount[id] = new Map();
				this.eventCount[id].set(event, 0);
			}
			const counter = this.eventCount[id].get(event);
			this.eventCount[id].set(event, counter ? counter + 1 : 1);
		}
	}

	start() {
		this.bot.on('rawWS', this.rawWSHandler);
	}

	stop() {
		this.bot.removeEventListener('rawWS', this.rawWSHandler);
	}
}

module.exports = EventCounter;
