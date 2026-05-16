import { getBoardCards } from './actions'
import { BoardView } from './board-view'

export default async function BoardPage() {
  const cards = await getBoardCards()
  return (
    <div className="p-5">
      <BoardView initialCards={cards} />
    </div>
  )
}
