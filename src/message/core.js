//@flow
import { get_message } from "./message"
import type { Message } from "./message"
import MainCore from "../core"

export class Core {
	core: MainCore

	constructor(core: MainCore) {
		this.core = core
	}

	get_model() {
		return this.core.get_model("message")
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

	list_messages(offset: number = 0, limit: number = 50): Promise<Array<*>> {
		const model = this.get_model()
		return model.findAll({
			offset, limit,
			order: [ [ "createdAt", "DESC" ] ]
		})
	}

	remove(uuid: string) {
		return this.get_model().remove(uuid)
	}
}
