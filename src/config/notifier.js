//@flow
import { object, string, get_string } from "../sanitize"
import type { Message } from "../message"
import fetch from "node-fetch"
import { UnknownNotifierType } from "../exception/config"

export const description = object({
	type: string(),
	token: string(),
	name: { optional: true, ...string() }
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
		return await fetch("https://api.pushover.net/1/messages.json", {
			method: "POST",
			cache: "no-cache",
			headers: {
				"Content-Type": "application/json; charset=utf-8"
			},
			body: JSON.stringify({
				token: this.token,
				user: this.user,
				message: "From: " + message.name + ", " + message.email + "\n"
					+ "Message: " + message.text
			})
		})
	}
}

export class PushbulletNotifer implements Notifier {
	token: string

	constructor(token: string) {
		this.token = token
	}

	async send(message: Message): Promise<void> {
		return await fetch("https://api.pushbullet.com/v2/pushes", {
			method: "POST",
			cache: "no-cache",
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				"Authorization": `Basic ${ Buffer.from(`${ this.token }:`).toString("base64") }`
			},
			body: JSON.stringify({
				type: "note",
				title: `Homepage Message - from ${ message.name }`,
				body: "From: " + message.name + ", " + message.email + "\n"
					+ "Message: " + message.text
			})
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
		case "pushbullet": {
			const token = get_string(setting.token)
			return new PushbulletNotifer(token)
		}
		default:
			throw new UnknownNotifierType(type)
		}
	})
}
