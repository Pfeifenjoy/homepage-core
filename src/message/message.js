//@flow
import sanitize, { object, string, get_string } from "../sanitize"

export const Shape = sanitize(object({
	email: string(),
	name: string(),
	text: string()
}))

export type Message = {|
	email: string,
	name: string,
	text: string
|}

export const get_message = (raw: Object): Message => {
	const email = get_string(raw.email)
	const name = get_string(raw.name)
	const text = get_string(raw.text)

	return { email, name, text }
}
