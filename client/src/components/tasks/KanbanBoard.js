import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Spinner from '../layout/Spinner';

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Columns for the Kanban board
  const columns = {
    todo: {
      name: 'To Do',
      color: 'bg-gray-500'
    },
    in_progress: {
      name: 'In Progress',
      color: 'bg-blue-500'
    },
    review: {
      name: 'Review',
      color: 'bg-yellow-500'
    },
    done: {
      name: 'Done',
      color: 'bg-green-500'
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/tasks', {
        headers: {
          'x-auth-token': token
        }
      });
      const data = await res.json();
      
      if (res.ok) {
        setTasks(data);
      } else {
        setError(data.msg || 'Failed to fetch tasks');
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle drag end event
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // If there's no destination, do nothing
    if (!destination) return;

    // If the item is dropped in the same place, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Find the task being moved
    const taskId = draggableId;
    const task = tasks.find(t => t._id === taskId);
    
    if (!task) return;

    // Update the task status based on the column it was dropped into
    const newStatus = destination.droppableId;
    
    // Update the task in the local state immediately for better UX
    const updatedTasks = tasks.map(t => 
      t._id === taskId ? { ...t, status: newStatus } : t
    );
    
    setTasks(updatedTasks);

    // Update the task on the server
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        // If the update failed, revert the local state
        fetchTasks(); // Refresh tasks from server
        const data = await res.json();
        setError(data.msg || 'Failed to update task status');
      }
    } catch (err) {
      console.error(err);
      // If the update failed, revert the local state
      fetchTasks(); // Refresh tasks from server
      setError('Server error. Please try again.');
    }
  };

  // Get tasks for a specific column
  const getColumnTasks = (status) => {
    return tasks.filter(task => task.status === status);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Kanban Board</h1>
        <p className="text-gray-400">Drag and drop tasks between columns to update their status</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(columns).map(([status, column]) => (
            <div key={status} className="bg-[#1F1F2E] rounded-lg shadow border border-[#2D2D44]">
              <div className={`px-4 py-3 ${column.color} rounded-t-lg`}>
                <h2 className="text-white font-semibold">{column.name}</h2>
              </div>
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-4 min-h-[200px] ${snapshot.isDraggingOver ? 'bg-[#14141D]' : ''}`}
                  >
                    {getColumnTasks(status).map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-[#2D2D44] rounded-lg p-4 mb-4 shadow ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            }`}
                          >
                            <h3 className="font-medium text-white">{task.title}</h3>
                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {task.project?.name || 'No Project'}
                              </span>
                              {task.assignee && (
                                <div className="flex items-center">
                                  <div className="h-6 w-6 rounded-full bg-[#4A90E2] flex items-center justify-center">
                                    <span className="text-xs text-white">
                                      {task.assignee.name.charAt(0)}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                            {/* Priority indicator */}
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                task.priority === 'low' ? 'bg-green-500' :
                                task.priority === 'medium' ? 'bg-yellow-500' :
                                task.priority === 'high' ? 'bg-orange-500' :
                                'bg-red-500'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                            {/* Attachment indicator */}
                            {task.attachments && task.attachments.length > 0 && (
                              <div className="mt-2 flex items-center text-xs text-gray-400">
                                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                <span>{task.attachments.length} attachment{task.attachments.length > 1 ? 's' : ''}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;