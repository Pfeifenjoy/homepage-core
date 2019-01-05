//@flow
import { object, string, get_string, get_object, fallback } from "../sanitize"
import { join } from "path"

export const description = object({
	key_path: string(),
	cert_path: string()
})

export type Config = {|
	key_path: string,
	cert_path: string
|}

export const default_config = (base_path: string) => ({
	key_path: join(base_path, "ssl-private-key.pem"),
	cert_path: join(base_path, "ssl-certificate.pem")
})

export const load = (base_path: string) => (raw: Object): Config => {
	const security = fallback(get_object)({ })(raw)
	const { key_path, cert_path } = default_config(base_path)
	return {
		key_path: fallback(get_string)(key_path)(security.key_path),
		cert_path: fallback(get_string)(cert_path)(security.cert_path)
	}
}
