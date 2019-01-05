//@flow

import assert from "assert"
import { memory_core, destroy_base_folder } from "./helper"
import Core, { load_config } from "../src"
import { join } from "path"
import { existsSync } from "fs"
import { SanitizeError, UndefinedAttribute } from "../src/exception/sanitize"

describe("core", () => {
	afterEach(destroy_base_folder)
	it("load config", async () => {
		const core = await memory_core()
		assert(core.config.db.type === "sqlite")
	})
	it("load core with db in folder which does not exist", async () => {
		const config_path = join(__dirname, "assets/sqlite-basic-config.json")
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
		const x = await core.message.add({
			email: "overlord@googlemail.com",
			name: "Star Lord",
			text: "Greetings from outer space."
		})
		assert.equal(x.get("name"), "Star Lord")
		assert.equal(x.get("email"), "overlord@googlemail.com")
		assert.equal(x.get("text"), "Greetings from outer space.")
	})
	it("add broken message", async () => {
		const core = await memory_core()
		try {
			await core.message.send({
				text: "Greetings from outer space."
			})
		} catch(e) {
			assert(e instanceof SanitizeError, "Expecting sanitize error")
			assert.deepEqual(e.key_chain, [ "email" ])
			assert(e.error instanceof UndefinedAttribute)
			assert.deepEqual(e.error,
				{ description: { type: "string" }, property: undefined })
		}
	})
	it("list messages", async () => {
		const core = await memory_core()
		await core.message.add({
			email: "overlord@googlemail.com",
			name: "Star Lord",
			text: "Greetings from outer space."
		})
		const messages = await core.message.list_messages()
		assert(messages.length === 1)
		const x = messages[0]
		assert.equal(x.get("name"), "Star Lord")
		assert.equal(x.get("email"), "overlord@googlemail.com")
		assert.equal(x.get("text"), "Greetings from outer space.")
	})
	it("launch core twice", async () => {
		const config_path = join(__dirname, "assets/sqlite-basic-config.json")
		const config = await load_config(config_path)
		const core1 = new Core(config)
		await core1.initialize()

		const core2 = new Core(config)
		await core2.initialize()
	})
})
