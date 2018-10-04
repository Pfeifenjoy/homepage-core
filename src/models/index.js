//@flow

import Sequelize from "sequelize"
import Message from "./message"

export type model_definition = Sequelize => void

const add_model_to_core = (sequelize: Sequelize) =>
	(model: model_definition) => model(sequelize)

export default (sequelize: Sequelize) => {
	const add_model = add_model_to_core(sequelize)

	// List all default models here
	add_model(Message)
}
