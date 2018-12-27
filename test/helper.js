//@flow
import { Config } from "../src/config"
import { Config as Database } from "../src/config/database"
import { Config as Sqlite } from "../src/config/sqlite"
import Core from "../src/core"

export const memory_core = async () => {
	const base_path = "temp"
	const environment = new Sqlite(base_path, { path: ":memory:" })
	const db = new Database("sqlite", false, environment)
	const config = new Config(db, [ ], base_path)
	const core = new Core(config)
	await core.initialize()
	return core
}
