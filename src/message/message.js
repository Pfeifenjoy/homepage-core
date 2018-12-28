//@flow
import sanitize, {
	object,
	string,
	get_string,
	get_object
} from "../sanitize"

export const description = object({
	email: string(),
	name: string(),
	text: string()
})

export type Message = {|
	email: string,
	name: string,
	text: string
|}

export const get_message = (raw: Object): Message => {
	const message = get_object(sanitize(description)(raw))

	const email = get_string(message.email)
	const name = get_string(message.name)
	const text = get_string(message.text)

	return { email, name, text }
}
