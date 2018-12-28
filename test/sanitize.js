//@flow
import sanitize, { object, array, number, string, boolean } from "../src/sanitize"
import { SanitizeError, UnexpectedType, UndefinedAttribute } from "../src/exception/sanitize"
import assert from "assert"

describe("sanitize", () => {
	describe("basic", () => {
		const object = {
			a: 1,
			b: "2"
		}

		const description = {
			type: "object",
			children: new Map([
				[ "a", { type: "number" } ],
				[ "b", { type: "string" } ]
			])
		}

		it("sanitize attributes", () => {
			const o = sanitize(description)(object)
			assert.deepEqual(o, { a: 1, b: "2" })
		})
	})
	describe("number", () => {
		const description = number()
		it("ok", () => {
			const object = 1
			const result = sanitize(description)(object)
			assert(result === 1)
		})
		it("error", () => {
			const object = "1"
			try {
				sanitize(description)(object)
				assert(false)
			} catch(e) {
				assert(e instanceof UnexpectedType, "Wrong type provided.")
				assert(e.description === description)
				assert(e.property === "1")
			}
		})
	})
	describe("string", () => {
		const description = string()
		it("ok", () => {
			const object = "test"
			const result = sanitize(description)(object)
			assert(result === "test")
		})
		it("error", () => {
			const object = 1
			try {
				sanitize(description)(object)
				assert(false)
			} catch(e) {
				assert(e instanceof UnexpectedType, "Wrong type provided.")
				assert(e.description === description)
				assert(e.property === 1)
			}
		})
	})
	describe("boolean", () => {
		const description = boolean()
		it("ok", () => {
			const object = true
			const result = sanitize(description)(object)
			assert(result === true)
		})
		it("error", () => {
			const object = "true"
			try {
				sanitize(description)(object)
				assert(false)
			} catch(e) {
				assert(e instanceof UnexpectedType, "Wrong type provided.")
				assert(e.description === description)
				assert(e.property === "true")
			}
		})
	})
	describe("object", () => {
		const description = object({
			a: number(),
			b: string()
		})
		it("ok", () => {
			const object = {
				a: 1,
				b: "1"
			}
			const result = sanitize(description)(object)
			assert.deepEqual(result, { a: 1, b: "1" })
		})
		it("error", () => {
			const object = {
				a: "1",
				b: 1
			}
			try {
				sanitize(description)(object)
				assert(false)
			} catch(e) {
				assert(e instanceof SanitizeError, "Wrong type provided.")
				assert.deepEqual(e.key_chain, [ "a" ])
				assert(e.error instanceof UnexpectedType)
				assert.deepEqual(e.error, { description: { type: "number" }, property: "1" })
			}
		})
		it("error field missing", () => {
			const object = {
				a: 1
			}
			try {
				sanitize(description)(object)
				assert(false)
			} catch(e) {
				assert(e instanceof SanitizeError, "Field missing.")
				assert.deepEqual(e.key_chain, [ "b" ])
				assert(e.error instanceof UndefinedAttribute)
				assert.deepEqual(e.error,
					{ description: { type: "string" }, property: undefined })
			}
		})
		it("nested", () => {
			const description = object({
				a: object({
					b: number()
				})
			})
			const o = {
				a: {
					b: 1
				}
			}
			const result = sanitize(description)(o)
			assert.deepEqual(result, o)
		})
	})
	describe("array", () => {
		const description = array(number())
		it("ok", () => {
			const o = [ 1, 2, 3, 4 ]
			const result = sanitize(description)(o)
			assert.deepEqual(o, result)
		})
		it("error", () => {
			const o = [ "1", "2", "3", "4" ]
			try {
				sanitize(description)(o)
			} catch(e) {
				assert(e instanceof UnexpectedType)
				assert.deepEqual(e, { description: { type: "number" }, property: "1" })
			}
		})
	})
})
