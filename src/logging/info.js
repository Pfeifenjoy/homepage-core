//@flow

import status from "./status"
import { blue } from "chalk"

export default function(text: string) {
	status("info", text, {
		out: console.log, //eslint-disable-line
		color: blue
	})
}
