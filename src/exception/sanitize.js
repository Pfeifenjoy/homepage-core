//@flow
import Base from "./base"
import type { Description } from "../sanitize"

export default class DescriptionError extends Base {
	description: Description
	property: any

	constructor(description: Description, property: any) {
		super()
		this.description = description
		this.property = property
	}

	get_message() {
		return "Description Error"
	}
}

export class SanitizeError extends Base {
	key_chain: Array<string>
	object: any
	error: DescriptionError

	constructor(object: any, error: DescriptionError) {
		super()
		this.object = object
		this.error = error
		this.key_chain = [ ]
	}

	add_key(key: string) {
		this.key_chain.push(key)
	}

	get_message() {
		let message = `Sanitize Error in ${ this.key_chain.join(".") }:\n`
		message += " - " + this.error.get_message() + "\n"
		message += "Object:\n" + JSON.stringify(this.object)
		return message
	}
}

export class UndefinedAttribute extends DescriptionError {
	get_message() {
		return `Undefined Attribute -> Expected "${ this.description.type }"`
	}
}

export class UnexpectedType extends DescriptionError {
	get_message() {
		return `Unexpected Type "${ typeof this.property }" -> Expected "${ this.description.type }"`
	}
}

export class ConstraintError extends DescriptionError {
	get_message() {
		return `ConstraintError on property "${ this.property }"`
	}
}
