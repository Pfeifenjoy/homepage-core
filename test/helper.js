//@flow
import rmrf from "rmrf"
import { create_core } from "../src"
import { join } from "path"

export const memory_core = async () => {
	const core = await create_core(join(__dirname, "assets/sqlite-memory-config.json"))
	return core
}

export const destroy_base_folder = async () => {
	await rmrf(".homepage")
}
