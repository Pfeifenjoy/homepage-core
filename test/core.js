//@flow

import assert from "assert"
import { memory_core } from "./helper"
import Core, { load_config } from "../src"
import path from "path"
import { existsSync } from "fs"
import { SanitizeError, UndefinedAttribute } from "../src/exception/sanitize"

describe("core", () => {
	it("load config", async () => {
		const core = await memory_core()
		assert(core.config.db.type === "sqlite")
		await core.destroy_data()
	})
	it("load core with db in folder which does not exist", async () => {
		const config_path = path.join(__dirname, "assets/sqlite-basic-config.json")
		const config = await load_config(config_path)
		const core = new Core(config)
		const { base_path } = config
		assert(!existsSync(base_path), "base folder does not exist.")
		await core.initialize()
		assert(existsSync(base_path), "base folder does exist.")
		const db_path = config.db.environment.get_config().storage
		assert(existsSync(db_path), "database does exist.")
		await core.destroy_data()
		assert(!existsSync(base_path), "base folder does not exist.")
	})
	it("add message", async () => {
		const core = await memory_core()
		const x = await core.message_system.add({
			email: "overlord@googlemail.com",
			name: "Star Lord",
			text: "Greetings from outer space."
		})
		assert.equal(x.get("name"), "Star Lord")
		assert.equal(x.get("email"), "overlord@googlemail.com")
		assert.equal(x.get("text"), "Greetings from outer space.")
		await core.destroy_data()
	})
	it("add broken message", async () => {
		const core = await memory_core()
		try {
			await core.message_system.send({
				text: "Greetings from outer space."
			})
		} catch(e) {
			assert(e instanceof SanitizeError, "Expecting sanitize error")
			assert.deepEqual(e.key_chain, [ "email" ])
			assert(e.error instanceof UndefinedAttribute)
			assert.deepEqual(e.error,
				{ description: { type: "string" }, property: undefined })
		}
		await core.destroy_data()
	})
	it("list messages", async () => {
		const core = await memory_core()
		await core.message_system.add({
			email: "overlord@googlemail.com",
			name: "Star Lord",
			text: "Greetings from outer space."
		})
		const messages = await core.message_system.list_messages()
		assert(messages.length === 1)
		const x = messages[0]
		assert.equal(x.get("name"), "Star Lord")
		assert.equal(x.get("email"), "overlord@googlemail.com")
		assert.equal(x.get("text"), "Greetings from outer space.")
		await core.destroy_data()
	})
})
