//Interface
import { TrelloCards } from '@/interfaces/TrelloCards'

export default function DisplayCard({ name, dueComplete, dueDate,  ListClosed }: TrelloCards) {
    return (
        <div className="flex flex-col bg-gray-200 max-w-100 max-h-100 h-full w-full rounded-2xl ">
            <div className='flex justify-center flex-col m-auto'>
                <div>Card name: {name}</div>
                <div>Met due date: {dueComplete}</div>
                <div>{dueDate ?? "No Due Date"}</div>
                <div>{ListClosed ? "This list is closed" : "This list is open"}</div>
            </div>
        </div>
    )

}