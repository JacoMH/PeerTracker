//Interface
import { TrelloCards } from '@/interfaces/TrelloCards'

export default function DisplayCard({ name, dueDate}: TrelloCards) {
    return (
        <div className='flex justify-center flex-col m-auto gap-3'>
            <label className='text-2xl text-white font-bold text-center'>Description</label>
            <div className='text-white text-center'>{name}</div>
            <label className='text-2xl text-white font-bold text-center'>Due Date</label>
            <div className='text-white text-center'>{dueDate ?? "No Due Date"}</div>
        </div>
    )

}