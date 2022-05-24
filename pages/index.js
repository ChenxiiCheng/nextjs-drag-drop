import * as React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { initialData } from '../mock/initial-data';

// const draggbleSnapshot = {
//   isDragging: true,
//   draggingOver: 'column-1',
// }
// const droggableSnapshot = {
//   isDraggingOver: true,
//   draggingOverWith: 'task-1',
// }

// Droppable
const Column = ({ column, tasks }) => {
	return (
		<div className="flex flex-col m-2 border border-gray-200 rounded-md">
			{/* Title */}
			<h3 className="p-2 text-xl font-medium">Todo</h3>
			{/* TaskList */}
			<Droppable
				droppableId={column.id}
				type={column.id === 'column-3' ? 'done' : 'active'}
			>
				{(provided, snapshot) => (
					<div
						className={`grow p-2 min-h-24 ${
							snapshot.isDraggingOver ? 'bg-sky-100' : 'bg-white'
						}`}
						ref={provided.innerRef}
						{...provided.droppableProps}
					>
						{tasks.map((task, index) => (
							<Task key={task.id} task={task} index={index} />
						))}
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</div>
	);
};

// Draggble
const Task = ({ task: { id, content }, index }) => {
	const isDragDisabled = id === 'task-1';
	return (
		<Draggable draggableId={id} index={index} isDragDisabled={isDragDisabled}>
			{(provided, snapshot) => (
				<div
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					className={`flex items-center mb-3 p-2 border border-gray-200 rounded-md ${
						isDragDisabled
							? 'bg-gray-100'
							: snapshot.isDragging
							? 'bg-rose-300'
							: 'bg-white'
					}`}
				>
					{/* Handler
          <div
            className="w-4 h-4 bg-orange-300 border-2 border-orange-300 mr-2 rounded-md"
            {...provided.dragHandleProps}
          ></div> */}
					{content}
				</div>
			)}
		</Draggable>
	);
};

export default function Home() {
	const [data, setData] = React.useState(initialData);
	const [windowLoaded, setWindowLoaded] = React.useState(false);

	React.useEffect(() => {
		setWindowLoaded(true);
	}, []);

	const onDragEnd = (result) => {
		const { destination, source, draggableId } = result;
		if (!destination) {
			return;
		}
		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		) {
			return;
		}
		const start = data.columns[source.droppableId];
		const finish = data.columns[destination.droppableId];

		if (start === finish) {
			const newTaskIds = Array.from(start.taskIds);
			newTaskIds.splice(source.index, 1);
			newTaskIds.splice(destination.index, 0, draggableId);
			const newColumn = {
				...start,
				taskIds: newTaskIds,
			};
			setData({
				...data,
				columns: {
					...data.columns,
					[newColumn.id]: newColumn,
				},
			});
		} else {
			// Moving from one list to another
			const startTaskIds = Array.from(start.taskIds);
			startTaskIds.splice(source.index, 1);
			const newStart = {
				...start,
				taskIds: startTaskIds,
			};

			const finishTaskIds = Array.from(finish.taskIds);
			finishTaskIds.splice(destination.index, 0, draggableId);
			const newFinish = {
				...finish,
				taskIds: finishTaskIds,
			};

			setData({
				...data,
				columns: {
					...data.columns,
					[newStart.id]: newStart,
					[newFinish.id]: newFinish,
				},
			});
		}
	};

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<div className="grid grid-cols-3">
				{windowLoaded &&
					data.columnOrder.map((columnId) => {
						const column = data.columns[columnId];
						const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);
						return <Column key={column.id} column={column} tasks={tasks} />;
					})}
			</div>
		</DragDropContext>
	);
}
