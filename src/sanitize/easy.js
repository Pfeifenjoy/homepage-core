//@flow

import type { Description, Children, Type } from "./sanitize"

type Config = $Rest<Description, {| type: Type |}>

const to_children = (o: *): Children => {
	const result = [ ]
	for(const key in o) {
		result.push([ key, o[key] ])
	}
	return new Map(result)
}

export const object = (children: Object, config: ?Config = { }): Description => ({
	type: "object",
	children: to_children(children),
	...config
})

export const array = (element_description: Description, config: ?Config = { }): Description => ({
	type: "array",
	element_description,
	...config
})


export const string = (config: ?Config = { }): Description => ({
	type: "string",
	...config
})

export const boolean = (config: ?Config = { }): Description => ({
	type: "boolean",
	...config
})

export const number = (config: ?Config = { }): Description => ({
	type: "number",
	...config
})

export const NULL: Description = { type: "null" }
