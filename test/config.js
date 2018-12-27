//@flow

import "babel-polyfill"
import assert from "assert"
import { load } from "../src/config"
import { Config as SQLiteConfig } from "../src/config/sqlite"
import path from "path"
import { stub } from "sinon"
import { homedir } from "os"

describe("config", () => {
	it("default configuration", async () => {
		const log = stub(console, "warn")
		const config = await load()
		assert(log.called, "Warning must be displayed if no config is provided.")
		log.restore()

		assert(config.db.type === "sqlite", "SQLite is the default DB.")
		assert(config.db.environment instanceof SQLiteConfig)
		if(config.db.environment instanceof SQLiteConfig) {
			assert.equal(config.db.environment.path, path.join(homedir(), ".homepage/db.sqlite"),
				"Save data in db.sqlite")
		}
	})
	it("load custom config", async () => {
		const config = await load(path.join(__dirname, "./assets/sqlite-basic-config.json"))

		assert.equal(config.db.type, "sqlite",
			"sqlite-basic-config.json has SQLite as db type.")
		if(config.db.environment instanceof SQLiteConfig) {
			assert.equal(config.db.environment.path, "temp/basic-db.sqlite",
				"sqlite-basic-config.json has basic-db.sqlite as path.")
		}
	})
	it("in memory db", async () => {
		const config = await load(path.join(__dirname, "./assets/sqlite-memory-config.json"))
		const db = config.db.get_instance()
		await db.authenticate()
		const result = await db.query("SELECT 1+1 AS result")
		assert.equal(result[0][0].result, 2, "Simple sql calculation")
		db.close()
	})
})
