//@flow
import crypto from "crypto"

const toBase64 = (json: Object) => Buffer.from(JSON.stringify(json)).toString("base64")
const fromBase64 = (base64: string) =>
	JSON.parse(Buffer.from(base64, "base64").toString("utf8"))

const head = toBase64({
	"alg": "HS256",
	"typ": "jwt"
})

export type Options = {|
	expiration_date: number,
	name: string,
	admin: boolean
|}

export const create_payload = (options: Options) => toBase64({
	exp: options.expiration_date,
	name: options.name,
	admin: options.admin
})

export const create_signature = (secret: Buffer) => (head: string) => (payload: string) =>
	crypto
		.createHmac("sha256", secret)
		.update(head + "." + payload)
		.digest("base64")

export const create = (secret: Buffer) => (options: Options) => {
	const payload = create_payload(options)
	const signature = create_signature(secret)(head)(payload)

	return `${ head }.${ payload }.${ signature }`
}

const extract_regex = /([^.]+)\.([^.]+)\.([^.]+)/

const raw_part = (i: number) => (jwt: string) => {
	const result = extract_regex.exec(jwt)
	return result instanceof Array ? result[i] : ""
}

const extract_head = (jwt: string) => fromBase64(raw_part(1)(jwt))

const extract_payload = (jwt: string) => fromBase64(raw_part(2)(jwt))

const extract_signature = (jwt: string) => raw_part(3)(jwt)

export const extract_values = (jwt: string) => ({
	head: extract_head(jwt),
	payload: extract_payload(jwt),
	signature: extract_signature(jwt)
})

export const extract_expiration_date = (jwt: string) => extract_payload(jwt).exp

export const validate = (secret: Buffer) => (jwt: string) => {
	const head = raw_part(1)(jwt)
	const payload = raw_part(2)(jwt)
	const signature = raw_part(3)(jwt)
	return create_signature(secret)(head)(payload) === signature
}
