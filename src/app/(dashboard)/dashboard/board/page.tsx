import { getBoardCards } from './actions'
import { BoardView } from './board-view'

export default async function BoardPage() {
  const cards = await getBoardCards()
  return (
    <div className="p-4 md:p-5 overflow-x-auto">
      <BoardView initialCards={cards} />
    </div>
  )
}
