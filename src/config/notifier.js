//@flow
import { object, string, get_string } from "../sanitize"
import type { Message } from "../message"
import fetch from "node-fetch"
import { UnknownNotifierType } from "../exception/config"

export const description = object({
	token: string(),
	name: string()
})

export interface Notifier {
	send(message: Message): Promise<void>
}

export class PushoverNotifier implements Notifier {
	token: string
	user: string

	constructor(token: string, user: string) {
		this.token = token
		this.user = user
	}

	async send(message: Message): Promise<void> {
		await fetch("https://api.pushover.net/1/messages.json", {
			method: "POST",
			cache: "no-cache",
			headers: {
				"Content-Type": "application/json; charset=utf-8"
			},
			body: {
				token: this.token,
				user: this.user,
				message: "From: " + message.name + ", " + message.email + "\n"
					+ "Message: " + message.text
			}
		})
	}
}

export const load = (settings: Array<Object>): Array<Notifier> => {
	return settings.map(setting => {
		const type = get_string(setting.type)
		switch(type) {
		case "pushover": {
			const token = get_string(setting.token)
			const name = get_string(setting.name)
			return new PushoverNotifier(token, name)
		}
		default:
			throw new UnknownNotifierType(type)
		}
	})
}
