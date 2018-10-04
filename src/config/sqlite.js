//@flow

import type { Environment } from "./database"
import { object, string, get_string, fallback } from "../sanitize"

export class Config implements Environment {
	path: string

	constructor({ path }: Object) {
		//keep path for reference
		this.path = fallback(get_string)("~/.homepage/db.sqlite")(path)
	}

	get_config(): Object {
		return {
			dialect: "sqlite",
			storage: this.path
		}
	}
}

export const load = (settings: Object): Config => {
	return new Config(settings)
}

export const description = object({
	path: string({ optional: true })
})

