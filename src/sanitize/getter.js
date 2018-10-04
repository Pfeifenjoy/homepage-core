//@flow

export const get_string = (x: any): string => {
	if(typeof x === "string") {
		return x
	} else {
		throw new TypeError(`Expected string not ${ typeof x }`)
	}
}

export const get_number = (x: any): number => {
	if(typeof x === "number") {
		return x
	} else {
		throw new TypeError(`Expected number not ${ typeof x }`)
	}
}

export const get_boolean = (x: any): boolean => {
	if(typeof x === "boolean") {
		return x
	} else {
		throw new TypeError(`Expected boolean not ${ typeof x }`)
	}
}

export const get_null = (x: any): null => {
	if(x === null) {
		return x
	} else {
		throw new TypeError(`Expected null not ${ typeof x }`)
	}
}

export const get_object = (x: any): Object => {
	if(typeof x === "object" && !(x instanceof Array) && x !== null) {
		return x
	} else {
		throw new TypeError(`Expected object not ${ typeof x }`)
	}
}

export const get_array = (x: any): Array<any> => {
	if(x instanceof Array) {
		return x
	} else {
		throw new TypeError(`Expected array not ${ typeof x }`)
	}
}

export const fallback = (getter: *) => (alternative: *) => (expected: any) => {
	try {
		return getter(expected)
	} catch(e) {
		return alternative
	}
}
