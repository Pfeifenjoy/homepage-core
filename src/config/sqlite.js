//@flow

import type { Environment } from "./database"
import { object, string, get_string, fallback } from "../sanitize"
import path from "path"

export class Config implements Environment {
	path: string

	constructor(base_path: string, settings: Object) {
		const relative_path = fallback(get_string)("db.sqlite")(settings.path)
		if(relative_path !== ":memory:") {
			this.path = path.join(base_path, relative_path)
		} else {
			this.path = relative_path
		}
	}

	get_config(): Object {
		return {
			dialect: "sqlite",
			storage: this.path
		}
	}
}

export const load = (base_path: string) => (settings: Object): Config => {
	return new Config(base_path, settings)
}

export const description = object({
	path: string({ optional: true })
})

