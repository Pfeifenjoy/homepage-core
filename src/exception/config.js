//@flow
import Base from "./base"

export class UnknownDatabaseType extends Base {
	type: string

	constructor(type: string) {
		super()
		this.type = type
	}

	get_message(): string {
		return `Unknown database type: ${ this.type }`
	}
}

export class UnknownNotifierType extends Base {
	type: string

	constructor(type: string) {
		super()
		this.type = type
	}

	get_message(): string {
		return `Unknown notifier type: ${ this.type }`
	}
}
