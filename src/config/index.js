//@flow

import { read_file } from "../util"
import sanitize, {
	object,
	array,
	string,
	number,
	get_object,
	get_array,
	get_string,
	get_number,
	fallback
} from "../sanitize"
import { warn } from "@arwed/logging"
import { Config as Database } from "./database"
import { load as load_db, description as db_description } from "./database"
import { load as load_notifiers, description as notifier_description } from "./notifier"
import {
	load as load_security,
	description as security_description,
	default_config as default_security_config
} from "./security"
import type { Config as SecurityConfig } from "./security"
import type { Notifier } from "./notifier"
import { homedir } from "os"
import { join } from "path"
import crypto from "crypto"

type Admin = {| name: string, default_password: string |}

const default_expiration_duration = (new Date(0)).setHours(2)

export class Config {
	db: Database
	notifiers: Array<Notifier>
	base_path: string
	admin: Admin
	secret: string
	expiration_duration: number
	security: SecurityConfig

	constructor(
		db: Database,
		notifiers: Array<Notifier> = [ ],
		base_path: string = join(homedir(), ".homepage"),
		admin: Admin = { name: "admin", default_password: "admin" },
		secret: string = "top secret",
		expiration_duration: number = default_expiration_duration,
		security: SecurityConfig = default_security_config(join(homedir(), ".homepage"))
	) {
		this.db = db
		this.notifiers = notifiers
		this.base_path = base_path
		this.admin = admin
		this.secret = secret
		this.expiration_duration = expiration_duration
		this.security = security
	}

	async get_secret() {
		return new Promise((resolve, reject) => {
			const hash = crypto.createHash("sha256")
			hash.on("readable", () => {
				const data = hash.read()
				if(data) {
					resolve(data)
				}
				reject()
			})
			hash.on("error", reject)
			hash.write(this.secret)
			hash.end()
		})
	}
}

export const description = object({
	db: { optional: true, ...db_description },
	notifiers: { optional: true, ...array(notifier_description) },
	base_path: string({ optional: true }),
	admin: { optional: true, ...object({
		name: string({ optional: true }),
		default_password: string({ optional: true })
	})},
	secret: string({ optional: true }),
	expiration_duration: number({ optional: true }),
	security: { optional: true, ...security_description }
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
	const admin = (() => {
		const o = fallback(get_object)({ })(data.admin)
		const name = fallback(get_string)("admin")(o.name)
		const default_password = fallback(get_string)("admin")(o.default_password)
		return { name, default_password }
	})()
	const secret = fallback(get_string)("")(data.secret)
	const expiration_duration = fallback(get_number)(
		default_expiration_duration)(data.expiration_duration)
	const security = load_security(base_path)(data.security)

	return new Config(
		db, notifiers, base_path,
		admin, secret, expiration_duration,
		security
	)
}
