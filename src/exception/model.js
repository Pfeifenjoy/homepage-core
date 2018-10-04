//@flow

import Base from "./base"

export class UndefinedModel extends Base {
	name: string

	constructor(name: string) {
		super()
		this.name = name
	}

	get_message(): string {
		return `Undefined Model: ${ this.name }`
	}
}
