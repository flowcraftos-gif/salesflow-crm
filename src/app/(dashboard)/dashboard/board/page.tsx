import { getBoardCards, getTodayItems } from './actions'
import { BoardView } from './board-view'

export default async function BoardPage() {
  const [cards, today] = await Promise.all([getBoardCards(), getTodayItems()])
  return (
    <div className="p-4 md:p-5 overflow-x-auto">
      <BoardView initialCards={cards} todayTasks={today.tasks} todayEvents={today.events} />
    </div>
  )
}
