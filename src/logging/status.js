//@flow

import assert from "assert"

const MAX_STATUS_SYMBOL_WIDTH = 7
const I = x => x

type Options = {
	color: Function,
	out: ?any
}

const default_options = {
	color: I,
	out: undefined
}

export default function(symbol: string, text: string, options: Options = default_options) {
	assert(symbol.length <= MAX_STATUS_SYMBOL_WIDTH)

	const { color } = options
	const out = options.out || console.log //eslint-disable-line

	const padding = new Array(1 + 1 + MAX_STATUS_SYMBOL_WIDTH - symbol.length).join(" ")

	const timestamp = new Date().toLocaleString("de-DE")

	const prefix = color(`${ timestamp } ${ symbol }`)

	out(`[${ prefix }]${ padding }${ text }`)
}
