const TrackListItem = ({ item }: { item: { id: string, content: string } }) => {
    return (
        <div className='m-2 p-2 bg-gray-800 rounded-md text-white h-[40px]'>
            <p className='truncate'>{item.content}</p>
        </div>
    );
}

export default TrackListItem