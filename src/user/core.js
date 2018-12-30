//@flow
import MainCore from "../core"
import sanitize, {
	string,
	object,
	boolean,
	get_string,
	get_object,
	get_boolean,
	fallback
} from "../sanitize"
import { create, validate } from "./jwt"
import { Transaction } from "sequelize"

export type Credentials = {
	name: string,
	password: string
}
export type User = {|
	...Credentials,
	email: ?string
|}

const description = object({
	name: string(),
	password: string(),
	email: string({ optional: true }),
	admin: boolean({ optional: true })
})

const get_user = (raw: Object) => {
	const shape = get_object(sanitize(description)(raw))
	return {
		name: get_string(shape.name),
		password: get_string(shape.password),
		email: fallback(get_string)(undefined)(shape.email),
		admin: fallback(get_boolean)(false)(shape.admin)
	}
}

export class Core {
	core: MainCore

	constructor(core: MainCore) {
		this.core = core
	}

	get_model() {
		return this.core.get_model("user")
	}

	async initialize(transaction: ?Transaction) {
		const { admin } = this.core.config
		const { default_password, name } = admin
		const user = await this.find(name, transaction)
		if(user === null) {
			await this.create({ password: default_password, name, admin: true }, transaction)
		}
	}

	async create(raw: Object, transaction: ?Transaction) {
		const user = get_user(raw)
		const { password } = user
		delete user.password
		const instance = this.get_model()
			.build(get_user(raw), { transaction })
		await instance.set_password(password)
		return await instance.save({ transaction })
	}

	async find(name: string, transaction: ?Transaction) {
		return this.get_model().findOne({ where: { name } }, { transaction })
	}

	async authenticate(credentials: Credentials, transaction: ?Transaction) {
		const user = await this.find(credentials.name, transaction)

		if(await user.check_password(credentials.password)) {
			const secret = await this.core.config.get_secret()
			return create(secret)({
				name: user.name,
				expiration_date: Date.now() + this.core.config.expiration_duration,
				admin: user.admin
			})
		}
	}

	async validate_token(token: string) {
		const secret = await this.core.config.get_secret()
		return validate(secret)(token)
	}

	async remove(name: string, transaction: ?Transaction) {
		return await this.get_model().destroy({ where: { name } }, { transaction })
	}
}
