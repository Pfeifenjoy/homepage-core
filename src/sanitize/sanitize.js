//@flow
import assert from "assert"
import { implies, iff } from "../util"
import {
	SanitizeError,
	UndefinedAttribute,
	UnexpectedType,
	ConstraintError
} from "../exception/sanitize"
import { Base as Exception } from "../exception"


export type Type = "string" | "number" | "boolean" | "null" | "array" | "object"
export type Property = string | number | boolean | Array<*> | null
export type Children = Map<string, Description>
export type Description = {
	type: Type,
	optional?: boolean,
	constraint?: Property => boolean,
	default?: Property,
	children?: Children,
	element_description?: Description
}

const is_object = ({ type }: Description): boolean => type === "object"
const is_attribute = ({ type }: Description): boolean =>
	type === "string" || type === "number" || type === "boolean" || type === "null"
		|| type === "array"

/**
 * Basic test for a description.
 */
const assert_description = (description: Description) => {
	assert(is_object(description) || is_attribute(description),
		`Unknown description type: ${ description.type }`)
	assert(implies(!is_object(description))(description.children === undefined),
		"Ill formed description: Only Objects can have children.")
	assert(implies(is_object(description))(description.children !== undefined),
		"Object description must always have children.")
	assert(description.type === typeof description.default || description.default === undefined,
		`Wrong type of default value: ${ description.type } != ${ typeof description.default }`)
	assert(implies(description.type === "array")(description.element_description !== undefined),
		"You must provide an element type.")
}

const check = (description: Description) => (property: any): Property | typeof undefined => {
	if(property === undefined && description.default === undefined && !description.optional) {
		throw new UndefinedAttribute(description, property)
	}
	if(property === undefined && description.optional) {
		return undefined
	}
	if(property === undefined && description.default !== undefined) {
		property = description.default
	}

	if(
		!(property instanceof Array) && typeof property !== description.type
		|| !iff(property instanceof Array)(description.type === "array")
	) {
		throw new UnexpectedType(description, property)
	} else if(description.constraint !== undefined && description.constraint(property)) {
		throw new ConstraintError(description, property)
	}

	//check elements of array for description
	if(property instanceof Array && description.element_description !== undefined) {
		const result = []
		for(const element of property) {
			result.push(check(description.element_description)(element))
		}
		return result
	}

	return property
}

const sanitize = (description: Description) => (object: any) => {
	assert_description(description)

	//Notice the difference between the typing of descriptions and
	//real attributes / variables.
	//
	//typeof null === "object"
	//typeof [] === "object"
	//
	//This is very disturbing therefore the description types ar as follows
	//
	//array : "array"
	//null: "null"
	//
	//In essence an array may be an object, however here a distinction is made
	//because of the useage in json.
	//Also null is not really an object, it is more like a special reference.

	if(is_attribute(description)) {
		//run checks on attribute
		return check(description)(object)
	} else if(is_object(description)) {
		//run checks on object
		object = check(description)(object)

		//if object is optional
		if(object === undefined) {
			return undefined
		}

		//copy values of object
		//We don`t want to modify the actual object!!!
		//We want to create a sanitized copy.
		if(typeof object === "object" && !(object instanceof Array) && object !== null) {
			//populate result by given description
			const result = { }

			for(const [ child_key, child_description ] of description.children || new Map) {
				try {
					result[child_key] = sanitize(child_description)(object[child_key])
				} catch(e) {
					//catch errors and set path and original object
					const sanitize_exception = e instanceof SanitizeError ?
						e.object = object : new SanitizeError(object, e)
					sanitize_exception.add_key(child_key)
					throw sanitize_exception
				}
			}
			return result
		} else {
			throw new Exception
		}
	}
}

export default sanitize
