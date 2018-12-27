//@flow

import Sequelize from "sequelize"
import {
	object,
	string,
	boolean,
	get_string,
	get_object,
	get_boolean,
	fallback
} from "../sanitize"
import { load as load_sqlite, description as sqlite_description } from "./sqlite"
import { UnknownDatabaseType } from "../exception/config"

export interface Environment {
	get_config(): Object;
}

export class Config {
	type: string
	logging: boolean
	environment: Environment

	constructor(type: string, logging: boolean, environment: Environment) {
		this.type = type
		this.logging = logging
		this.environment = environment
	}

	/**
	 * Proxy to environment
	 */
	get_instance(): Sequelize {
		return new Sequelize({
			logging: this.logging,
			...this.environment.get_config()
		})
	}
}

export const load = (base_path: string) => async (settings: Object): Promise<Config> => {
	const type = fallback(get_string)("sqlite")(settings.type)
	const environment_settings = fallback(get_object)({ })(settings.environment)

	const environment: Environment = (() => {
		switch(type) {
		case "sqlite": return load_sqlite(base_path)(environment_settings)
		case "postgresql": //TODO
		default: throw new UnknownDatabaseType(type)
		}
	})()

	const logging = fallback(get_boolean)(false)(settings.logging)

	return new Config(type, logging, environment)
}

export const description = object({
	type: string({ optional: true }),
	environment: { optional: true, ...sqlite_description },
	logging: boolean({ optional: true })
})
