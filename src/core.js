//@flow

import { Config, load as load_config } from "./config"
import Sequelize from "sequelize"
import { Core as MessageSystem } from "./message"
import { Core as UserSystem } from "./user"
import { UndefinedModel } from "./exception/model"
import models from "./models"
import { existsSync, mkdirSync } from "fs"
import rmdir from "rmrf"
import { error } from "@arwed/logging"

export const create_core = async (): Promise<Core> => {
	const config = await load_config()
	const core = new Core(config)
	return core.initialize()
}

export default class Core {
	config: Config
	sequelize: Sequelize
	message_system: MessageSystem
	user: UserSystem

	constructor(config: Config) {
		this.config = config
		this.sequelize = config.db.get_instance()
		this.message_system = new MessageSystem(this)
		this.user = new UserSystem(this)
	}

	async initialize(): Promise<Core> {
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

		await user_p

		//end transaction
		try {
			await transaction.commit()
		} catch(e) {
			error("Could not initialize core.")
			await transaction.rollback()
			throw e
		}

		return this
	}

	async destroy_data() {
		const { base_path } = this.config
		await rmdir(base_path)
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
