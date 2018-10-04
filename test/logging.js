//@flow

import { status, error, info, warn } from "../src/logging"
import { stub } from "sinon"
import chai from "chai"
import sinon_chai from "sinon-chai"
import assert from "assert"

chai.use(sinon_chai)

describe("logging", () => {
	it("print status", () => {
		const log = stub(console, "log")
		status("symbol", "Test")
		const result_check = /\[[^\][]* symbol\] {2}Test/.test(log.lastCall.args[0])
		log.restore()
		assert(result_check)
	})
	it("print error", () => {
		const log = stub(console, "error")
		error("Test")
		const result_check = /\.*error.*Test/.test(log.lastCall.args[0])
		log.restore()
		assert(result_check)
	})
	it("print info", () => {
		const log = stub(console, "log")
		info("Test")
		const result_check = /\.*info.*Test/.test(log.lastCall.args[0])
		log.restore()
		assert(result_check)
	})
	it("print warn", () => {
		const log = stub(console, "warn")
		warn("Test")
		const result_check = /\.*warning.*Test/.test(log.lastCall.args[0])
		log.restore()
		assert(result_check)
	})
})

