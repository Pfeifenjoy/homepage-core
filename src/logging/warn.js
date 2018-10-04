//@flow

import status from "./status"
import { yellow } from "chalk"

export default function(text: string) {
	status("warning", text, {
		out: console.warn, //eslint-disable-line
		color: yellow
	})
}
