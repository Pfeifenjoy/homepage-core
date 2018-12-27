//@flow

import { read_file } from "../util"
import sanitize, {
	object,
	array,
	string,
	get_object,
	get_array,
	get_string,
	fallback
} from "../sanitize"
import { warn } from "../logging"
import { Config as Database } from "./database"
import { load as load_db, description as db_description } from "./database"
import { load as load_notifiers, description as notifier_description } from "./notifier"
import type { Notifier } from "./notifier"
import { homedir } from "os"
import { join } from "path"

export class Config {
	db: Database
	notifiers: Array<Notifier>
	base_path: string

	constructor(db: Database, notifiers: Array<Notifier>, base_path: string) {
		this.db = db
		this.notifiers = notifiers
		this.base_path = base_path
	}
}

export const description = object({
	db: { optional: true, ...db_description },
	notifiers: { optional: true, ...array(notifier_description) },
	base_path: string({ optional: true })
})

export const load = async (default_path: ?string): Promise<Config> => {
	const search_paths = default_path === undefined || default_path === null ? [
		"./homepagerc.json",
		join(homedir(), ".homepagerc.json"),
		join(homedir(), ".config/homepage/homepagerc.json"),
		join(homedir(), ".config/homepage/.homepagerc.json"),
		"/etc/homepage/homepagerc.json",
		"/etc/homepage/.homepagerc.json"
	] : [ default_path ]

	const raw = await (async () => {
		//search for config in filesystem
		for(const path of search_paths) {
			try {
				return await read_file(path)
			} catch(e) {
				//try next
			}
		}

		warn("No configuration file was given. Using default configuration.")

		//default configuration -> let sub configurations handle this
		return ""
	})()

	const raw_data = JSON.parse(/^[ \n\t]*$/.test(raw) ? "{ }" : raw)
	const data = fallback(get_object)({ })(sanitize(description)(raw_data))

	const base_path = fallback(get_string)("~/.homepage")(data.base_path)
		.replace("~", homedir())
	const db_settings = fallback(get_object)({ })(data.db)
	const db = await load_db(base_path)(db_settings)
	const notifiers_settings = fallback(get_array)([ ])(data.notifiers)
	const notifiers = load_notifiers(notifiers_settings)

	return new Config(db, notifiers, base_path)
}
