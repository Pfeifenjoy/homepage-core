//@flow

import assert from "assert"
import { implies, iff } from "../src/util"

describe("util", () => {
	it("implies", () => {
		assert(implies(true)(true), "true => true === true")
		assert(implies(false)(true), "false => true === true")
		assert(!implies(true)(false), "true => false === false")
		assert(implies(false)(false), "false => false === true")
	})
	it("iff", () => {
		assert(iff(true)(true), "true === true")
		assert(!iff(false)(true), "false !== true")
		assert(!iff(true)(false), "true !== false")
		assert(iff(false)(false), "false === false")
	})
})
