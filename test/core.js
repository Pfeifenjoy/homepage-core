//@flow

import assert from "assert"
import { memory_core } from "./helper"

describe("core", () => {
	it("load config", async () => {
		const core = await memory_core()
		assert(core.config.db.type === "sqlite")
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
	})
})
