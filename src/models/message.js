//@flow

import Sequelize, { DataTypes } from "sequelize"

export default (sequelize: Sequelize) => {
	sequelize.define("message", {
		uuid: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true
		},
		timestamps: true,
		name: Sequelize.STRING(50),
		email: Sequelize.STRING(100),
		text: Sequelize.TEXT
	})
}
