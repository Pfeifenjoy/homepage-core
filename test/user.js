//@flow

import assert from "assert"
import { memory_core, destroy_base_folder } from "./helper"


describe("user", () => {
	it("automatically create admin", async () => {
		const core = await memory_core()
		const admin = await core.user.find("admin")
		assert(admin.name === "admin", "check name")
		assert(admin.check_password("admin"), "check password")
		assert(admin.admin, "check if user is admin")
	})
	it("create user", async () => {
		const core = await memory_core()
		const user = await core.user.create({
			name: "darth.vader",
			password: "death.star",
			email: "darth.vader@dark-side.imp"
		})
		assert.equal(user.name, "darth.vader", "check name")
		assert(user.check_password("death.star"), "check password")
		assert.equal(user.email, "darth.vader@dark-side.imp", "check email")
		assert(!user.admin, "ordinary user")
	})
	it("delete user", async () => {
		const core = await memory_core()
		await core.user.create({
			name: "darth.vader",
			password: "death.star",
			email: "darth.vader@dark-side.imp"
		})
		await core.user.remove("darth.vader")
		const user = await core.user.find("darth.vader")
		assert(user === null, "user must not exist")
	})
	it("authenticate user", async () => {
		const core = await memory_core()
		await core.user.create({
			name: "darth.vader",
			password: "death.star",
			email: "darth.vader@dark-side.imp"
		})
		const token = await core.user.authenticate({
			name: "darth.vader",
			password: "death.star"
		})
		assert(core.user.validate_token(token), "check token")
	})
	afterEach(destroy_base_folder)
})
