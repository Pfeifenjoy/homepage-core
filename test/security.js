//@flow

import { destroy_base_folder } from "./helper"
import { create_core } from "../src"
import assert from "assert"
import { join } from "path"
import pem from "pem"

const check_certificate = (certificate: string) => new Promise((resolve, reject) => {
	pem.checkCertificate(certificate, (e, valid) => {
		if(e) {
			reject(e)
		} else {
			resolve(valid)
		}
	})
})

const read_certificate_info = (certificate: string) => new Promise((resolve, reject) => {
	pem.readCertificateInfo(certificate, (e, data) => {
		if(e) {
			reject(e)
		} else {
			resolve(data)
		}
	})
})

describe("security", () => {
	afterEach(destroy_base_folder)
	it("generate certificate", async () => {
		const core = await create_core(
			join(__dirname, "assets/sqlite-ssl-generation-config.json"))
		const { key_path, cert_path } = core.config.security
		assert.equal(key_path, ".homepage/ssl-private-key.pem")
		assert.equal(cert_path, ".homepage/ssl-certificate.pem")
		const valid = await check_certificate(core.security.cert)
		assert(valid, "certificate must be valid.")

	}).timeout(5000)
	it("load certificate", async () => {
		const core = await create_core(
			join(__dirname, "assets/sqlite-memory-config.json"))
		const info = await read_certificate_info(core.security.cert)
		assert.equal(info.validity.start, 1546698942000)
		assert.equal(info.validity.end, 1546785342000)
	})
})
