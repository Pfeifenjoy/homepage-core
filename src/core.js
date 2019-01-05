//@flow

import { Config, load as load_config } from "./config"
import Sequelize from "sequelize"
import MessageSystem from "./message"
import UserSystem from "./user"
import SecuritySystem from "./security"
import { UndefinedModel } from "./exception/model"
import models from "./models"
import { existsSync, mkdirSync } from "fs"
import rmdir from "rmrf"
import { info, error } from "@arwed/logging"

export const create_core = async (path: ?string): Promise<MainCore> => {
	const config = await load_config(path)
	const core = new MainCore(config)
	await core.initialize()
	return core
}

export interface Core {
	core: MainCore;
	initialize(): Promise<void>;
	destroy(): Promise<void>;
}

export default class MainCore {
	config: Config
	sequelize: Sequelize
	message: MessageSystem
	user: UserSystem
	security: SecuritySystem

	constructor(config: Config) {
		this.config = config
		this.sequelize = config.db.get_instance()
		this.message = new MessageSystem(this)
		this.user = new UserSystem(this)
		this.security = new SecuritySystem(this)
	}

	async initialize(): Promise<void> {
		info("Starting core")

		//create base folder if it does not exist
		const { base_path } = this.config
		if(!existsSync(base_path)) {
			mkdirSync(base_path)
		}

		//initialize sequelize
		models(this.sequelize)
		await this.sequelize.sync()

		//start transaction
		const transaction = await this.sequelize.transaction()

		//initialize sub systems
		const user_p = this.user.initialize(transaction)
		const security_p = this.security.initialize()

		await user_p
		await security_p

		//end transaction
		try {
			await transaction.commit()
		} catch(e) {
			error("Could not initialize core.")
			await transaction.rollback()
			throw e
		}
	}

	async destroy_data() {
		const { base_path } = this.config
		await rmdir(base_path)
	}

	async destroy() {
		await Promise.all([
			this.message.destroy(),
			this.user.destroy()
		])
	}

	get_model(key: string) {
		const model = this.sequelize.models[key]
		if(model !== undefined) {
			return model
		} else {
			throw new UndefinedModel(key)
		}
	}
}
