//@flow

import pem from "pem"
import type { Core } from ".."
import MainCore from ".."
import { warn, error, info } from "@arwed/logging"
import { readFile, writeFile } from "fs"

const read_file = (path: string): Promise<string> => new Promise((resolve, reject) => {
	readFile(path, (e, data) => {
		if(e) {
			reject(e)
		} else {
			resolve(data.toString())
		}
	})
})

const write_file = (path: string) => (data: string): Promise<void> =>
	new Promise((resolve, reject) => {
		writeFile(path, data, e => {
			if(e) {
				reject(e)
			} else {
				resolve()
			}
		})
	})

const create_certificate = () => new Promise((resolve, reject) => {
	pem.createCertificate({ days: 1, selfSigned: true }, (e, keys) => {
		if(e) {
			error("Could not generate certificate.")
			reject(e)
		} else {
			resolve({
				key: keys.serviceKey,
				cert: keys.certificate
			})
		}
	})
})

export default class SecurityCore implements Core {
	core: MainCore
	key: string
	cert: string

	constructor(core: MainCore) {
		this.core = core
	}

	async generate_certificate(key_path: string, cert_path: string) {
		info("Generating certificate.")
		const { key, cert } = await create_certificate()
		this.key = key
		this.cert = cert
		info("Saving certificate.")
		try {
			await Promise.all([
				write_file(key_path)(this.key),
				write_file(cert_path)(this.cert)
			])
		} catch(e) {
			warn("Could not save certificate: " + e)
		}
	}

	async load_certificate(key_path: string, cert_path: string) {
		info("Loading certificate.")
		const [ key, cert ] = await Promise.all([
			read_file(key_path),
			read_file(cert_path)
		])
		this.key = key
		this.cert = cert
	}

	async initialize() {
		const { key_path, cert_path } = this.core.config.security
		try {
			await this.load_certificate(key_path, cert_path)
		} catch(e) {
			warn("Could not load SSL certificate.")
			await this.generate_certificate(key_path, cert_path)
		}
	}

	async destroy() {
		//nothing to do
	}
}
