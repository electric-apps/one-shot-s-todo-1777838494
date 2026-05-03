import { createFileRoute } from "@tanstack/react-router"
import { useLiveQuery } from "@tanstack/react-db"
import { useState } from "react"
import { todosCollection } from "@/db/collections/todos"
import type { Todo } from "@/db/zod-schemas"

export const Route = createFileRoute("/")({
	ssr: false,
	component: App,
})

function App() {
	const [text, setText] = useState("")

	const { data: todos = [] } = useLiveQuery((q) =>
		q.from({ todo: todosCollection }).orderBy(({ todo }) => todo.created_at, "asc"),
	)

	const handleAdd = () => {
		const trimmed = text.trim()
		if (!trimmed) return
		todosCollection.insert({
			id: crypto.randomUUID(),
			text: trimmed,
			completed: false,
			created_at: new Date(),
		})
		setText("")
	}

	const handleToggle = (todo: Todo) => {
		todosCollection.update(todo.id, (draft) => {
			draft.completed = !draft.completed
		})
	}

	const handleDelete = (id: string) => {
		todosCollection.delete(id)
	}

	return (
		<div className="min-h-svh p-6">
			<div className="max-w-md mx-auto">
				<h1 className="text-2xl font-bold mb-6">Todos</h1>

				<div className="flex gap-2 mb-6">
					<input
						type="text"
						value={text}
						onChange={(e) => setText(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleAdd()}
						placeholder="Add a todo..."
						className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<button
						type="button"
						onClick={handleAdd}
						className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
					>
						Add
					</button>
				</div>

				<ul className="space-y-2">
					{todos.map((todo) => (
						<li
							key={todo.id}
							className="flex items-center gap-3 p-3 border border-gray-200 rounded-md"
						>
							<input
								type="checkbox"
								checked={todo.completed}
								onChange={() => handleToggle(todo)}
								className="w-4 h-4 cursor-pointer accent-blue-600"
							/>
							<span
								className={`flex-1 text-sm ${todo.completed ? "line-through text-gray-400" : ""}`}
							>
								{todo.text}
							</span>
							<button
								type="button"
								onClick={() => handleDelete(todo.id)}
								className="text-red-500 hover:text-red-700 text-sm px-2"
							>
								Delete
							</button>
						</li>
					))}
				</ul>

				{todos.length === 0 && (
					<p className="text-center text-gray-400 text-sm mt-8">No todos yet. Add one above!</p>
				)}
			</div>
		</div>
	)
}
