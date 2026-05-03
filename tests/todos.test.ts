import { describe, it, expect } from "vitest"
import { generateValidRow, generateRowWithout } from "./helpers/schema-test-utils"
import { todoSelectSchema, todoInsertSchema } from "@/db/zod-schemas"

describe("todos schema", () => {
	it("validates a complete select row", () => {
		const row = {
			id: crypto.randomUUID(),
			text: "Buy groceries",
			completed: false,
			created_at: new Date(),
		}
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(true)
	})

	it("rejects a select row missing text", () => {
		const row = { id: crypto.randomUUID(), completed: false, created_at: new Date() }
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("validates an insert row with only required fields", () => {
		const row = { text: "Write tests" }
		const result = todoInsertSchema.safeParse(row)
		expect(result.success).toBe(true)
	})

	it("rejects an insert row missing text", () => {
		const row = { completed: true }
		const result = todoInsertSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("generates a valid select row via helper", () => {
		const row = generateValidRow(todoSelectSchema as any)
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(true)
	})

	it("generates a row without a field via helper", () => {
		const row = generateRowWithout(todoSelectSchema as any, "text")
		expect(row.text).toBeUndefined()
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("validates completed boolean type", () => {
		const row = {
			id: crypto.randomUUID(),
			text: "Test todo",
			completed: true,
			created_at: new Date(),
		}
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.completed).toBe(true)
		}
	})

	it("validates created_at as a Date", () => {
		const now = new Date()
		const row = {
			id: crypto.randomUUID(),
			text: "Test",
			completed: false,
			created_at: now,
		}
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.created_at).toBeInstanceOf(Date)
		}
	})
})
