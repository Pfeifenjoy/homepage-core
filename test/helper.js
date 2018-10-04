//@flow
import { Config } from "../src/config"
import { Config as Database } from "../src/config/database"
import { Config as Sqlite } from "../src/config/sqlite"
import Core from "../src/core"

export const memory_core = async () => {
	const environment = new Sqlite({ path: ":memory:" })
	const db = new Database("sqlite", false, environment)
	const config = new Config(db, [ ])
	const core = new Core(config)
	await core.initialize()
	return core
}
