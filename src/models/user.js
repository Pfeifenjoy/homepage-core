//@flow

import Sequelize, { DataTypes } from "sequelize"
import crypto from "crypto"

const generate_salt = () => new Promise((resolve, reject) =>
	crypto.randomBytes(256, (error, salt) => {
		if(error) {
			reject(error)
		} else {
			resolve(salt)
		}
	}))

const generate_hash = (secret: Buffer) => (password: string) =>
	crypto.createHmac("sha256", secret)
		.update(password)
		.digest()

export default (sequelize: Sequelize) => {
	const User = sequelize.define("user", {
		name: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		timestamps: true,
		email: Sequelize.STRING,
		password_hash: {
			type: DataTypes.CHAR(256),
			allowNull: false
		},
		password_salt: {
			type: DataTypes.CHAR(256),
			allowNull: false
		},
		admin: {
			type: Sequelize.BOOLEAN,
			defaultValue: false
		}
	})

	User.prototype.check_password = function(password: string) {
		const salt = this.getDataValue("password_salt")
		const hash = this.getDataValue("password_hash")
		return hash.equals(generate_hash(salt)(password))
	}

	User.prototype.set_password = async function(password: string) {
		const salt = await generate_salt()
		this.setDataValue("password_salt", salt)
		const hash = await generate_hash(salt)(password)
		this.setDataValue("password_hash", hash)
	}
}
