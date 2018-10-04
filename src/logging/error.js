//@flow

import status from "./status"
import { red } from "chalk"

export default function(text: string) {
	status("error", text, {
		out: console.error, //eslint-disable-line
		color: red
	})
}
