//@flow
import { get_message } from "./message"
import type { Message } from "./message"
import MainCore from "../core"
import type { Core } from ".."

export default class MessageCore implements Core {
	core: MainCore

	constructor(core: MainCore) {
		this.core = core
	}

	get_model() {
		return this.core.get_model("message")
	}

	async initialize() {

	}

	async send(raw: Object) {
		const message = get_message(raw)
		await this.add(message)
		return Promise.all(this.core.config.notifiers.map(
			notifier => notifier.send(message)))
	}

	add(message: Message) {
		return this.get_model().create(message)
	}

	async list_messages(offset: number = 0, limit: number = 50): Promise<Array<*>> {
		const model = this.get_model()
		const results = await model.findAll({
			offset, limit,
			order: [ [ "createdAt", "DESC" ] ]
		})
		return results.map(({ name, email, text }) => ({ name, email, text }))
	}

	remove(uuid: string) {
		return this.get_model().remove(uuid)
	}

	async destroy() {

	}
}
