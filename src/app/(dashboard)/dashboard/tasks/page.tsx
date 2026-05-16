import { getTasks } from './actions'
import { TaskList } from '@/components/tasks/task-list'
import { ensureUserExists } from '@/lib/auth'

export default async function TasksPage() {
  const userId = await ensureUserExists()
  if (!userId) return null

  const tasks = await getTasks('all')

  return (
    <div>
      <div className="flex h-[52px] items-center border-b border-[oklch(90%_0.014_254)] bg-white px-5">
        <h1 className="text-[15px] font-700 text-[oklch(18%_0.012_254)]">Tasks</h1>
        <span className="ml-2 rounded-full bg-[oklch(93%_0.04_265)] px-2 py-0.5 text-[11px] font-700 text-[oklch(42%_0.20_265)]">
          {tasks.filter(t => !t.done).length} รอดำเนินการ
        </span>
      </div>
      <TaskList initialTasks={tasks} />
    </div>
  )
}
