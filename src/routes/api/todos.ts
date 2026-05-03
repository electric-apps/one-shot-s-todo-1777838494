import { createFileRoute } from "@tanstack/react-router"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { todos } from "@/db/schema"
import { todoInsertSchema } from "@/db/zod-schemas"
import { generateTxId, parseDates } from "@/db/utils"
import { proxyElectricRequest } from "@/lib/electric-proxy"

const GET = async ({ request }: { request: Request }) => {
	return proxyElectricRequest(request, "todos")
}

const POST = async ({ request }: { request: Request }) => {
	const body = parseDates(await request.json())
	const parsed = todoInsertSchema.pick({ text: true, completed: true, id: true, created_at: true }).parse(body)

	const result = await db.transaction(async (tx) => {
		const [row] = await tx
			.insert(todos)
			.values({
				id: parsed.id ?? crypto.randomUUID(),
				text: parsed.text,
				completed: parsed.completed ?? false,
				created_at: parsed.created_at ?? new Date(),
			})
			.returning()
		const txid = await generateTxId(tx)
		return { ...row, txid }
	})

	return Response.json(result)
}

const PUT = async ({ request }: { request: Request }) => {
	const body = await request.json()
	const { id, completed } = body as { id: string; completed: boolean }

	const result = await db.transaction(async (tx) => {
		const [row] = await tx
			.update(todos)
			.set({ completed })
			.where(eq(todos.id, id))
			.returning()
		const txid = await generateTxId(tx)
		return { ...row, txid }
	})

	return Response.json(result)
}

const DELETE = async ({ request }: { request: Request }) => {
	const url = new URL(request.url)
	const id = url.searchParams.get("id")
	if (!id) return Response.json({ error: "id required" }, { status: 400 })

	const result = await db.transaction(async (tx) => {
		await tx.delete(todos).where(eq(todos.id, id))
		const txid = await generateTxId(tx)
		return { txid }
	})

	return Response.json(result)
}

export const Route = createFileRoute("/api/todos")({
	server: {
		handlers: { GET, POST, PUT, DELETE },
	},
})
