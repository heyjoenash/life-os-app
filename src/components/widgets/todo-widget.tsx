'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { WidgetContainer } from './widget-container';
import { Circle, Plus, Trash, CheckCircle2 } from 'lucide-react';

interface Todo {
  id: string;
  day_id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface TodoWidgetProps {
  dayId?: string;
  className?: string;
}

/**
 * Todo Widget component for displaying and managing todos for a specific day
 */
export function TodoWidget({ dayId, className }: TodoWidgetProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Determine if we're using a development ID
  const isDevelopmentMode = dayId?.startsWith('dev-');

  // Debug log when dayId changes
  useEffect(() => {
    console.log(
      'TodoWidget: dayId changed to:',
      dayId,
      isDevelopmentMode ? '(development mode)' : '',
    );
  }, [dayId, isDevelopmentMode]);

  // Load todos when the component mounts or dayId changes
  useEffect(() => {
    async function loadTodos() {
      if (!dayId) {
        console.log('TodoWidget: No dayId provided, skipping load');
        setIsLoading(false);
        return;
      }

      // Validate UUID format or development ID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const devIdRegex = /^dev-\d+$/;
      if (!uuidRegex.test(dayId) && !devIdRegex.test(dayId)) {
        console.error('TodoWidget: Invalid dayId format:', dayId);
        setError('Invalid day ID format. Please refresh the page.');
        setIsLoading(false);
        return;
      }

      // For development IDs, just use an empty array
      if (isDevelopmentMode) {
        console.log('TodoWidget: Using empty todos for development ID');
        setTodos([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('Loading todos for dayId:', dayId);
        const response = await fetch(`/api/todos?day_id=${dayId}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to load todos: ${response.status}`);
        }

        const data = await response.json();
        console.log('Todos loaded:', data?.length || 0, 'items');
        setTodos(data || []);
      } catch (err: unknown) {
        console.error('Error loading todos:', err);
        setError(err instanceof Error ? err.message : 'Failed to load todos');
      } finally {
        setIsLoading(false);
      }
    }

    loadTodos();
  }, [dayId, isDevelopmentMode]);

  // Add a new todo
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTodoTitle.trim()) {
      console.log('TodoWidget: Empty todo title, not submitting');
      return;
    }

    if (!dayId) {
      setError('Cannot add todo: day ID is missing');
      return;
    }

    // Validate UUID format or development ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const devIdRegex = /^dev-\d+$/;
    if (!uuidRegex.test(dayId) && !devIdRegex.test(dayId)) {
      setError('Invalid day ID format. Please refresh the page.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      console.log('TodoWidget: Adding new todo for dayId:', dayId);

      // For development IDs, we always use local state only
      if (isDevelopmentMode) {
        console.log('Development ID detected, using local state only');
        const mockTodo: Todo = {
          id: `dev-todo-${Date.now()}`,
          day_id: dayId,
          title: newTodoTitle.trim(),
          is_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Update UI with mock todo
        setTodos([...todos, mockTodo]);
        setNewTodoTitle('');
        setIsSaving(false);
        return;
      }

      // For real IDs, use optimistic update first
      if (devIdRegex.test(dayId)) {
        console.log('Development ID detected, optimistically updating UI');
        const mockTodo: Todo = {
          id: `dev-todo-${Date.now()}`,
          day_id: dayId,
          title: newTodoTitle.trim(),
          is_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Update UI optimistically
        setTodos([...todos, mockTodo]);
        setNewTodoTitle('');
      }

      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          day_id: dayId,
          title: newTodoTitle.trim(),
          is_completed: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to add todo: ${response.status}`);
      }

      const data = await response.json();
      console.log('TodoWidget: Todo added successfully:', data);

      // Only update state if we didn't already do an optimistic update
      if (!devIdRegex.test(dayId)) {
        setTodos([...todos, data]);
        setNewTodoTitle('');
      }
    } catch (err: unknown) {
      console.error('Error adding todo:', err);
      setError(err instanceof Error ? err.message : 'Failed to add todo');

      // If we did an optimistic update but the API call failed,
      // we should remove the optimistic todo from the list
      if (devIdRegex.test(dayId)) {
        // Get the last todo which would be our optimistic one
        const todosWithoutOptimistic = todos.slice(0, -1);
        setTodos(todosWithoutOptimistic);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle todo completion status
  const handleToggleTodo = async (todoId: string, isCompleted: boolean) => {
    try {
      // Validate UUID format or development ID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const devIdRegex = /^dev-todo-\d+$/;
      if (!uuidRegex.test(todoId) && !devIdRegex.test(todoId)) {
        console.error('TodoWidget: Invalid todoId format:', todoId);
        setError('Invalid todo ID format. Please refresh the page.');
        return;
      }

      // Skip API call for development IDs and always for development mode
      if (devIdRegex.test(todoId) || isDevelopmentMode) {
        // Just update local state for development IDs
        setTodos(
          todos.map((todo) =>
            todo.id === todoId ? { ...todo, is_completed: !isCompleted } : todo,
          ),
        );
        return;
      }

      // Optimistic update
      setTodos(
        todos.map((todo) => (todo.id === todoId ? { ...todo, is_completed: !isCompleted } : todo)),
      );

      const response = await fetch('/api/todos', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: todoId,
          is_completed: !isCompleted,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update todo: ${response.status}`);
      }
    } catch (err: unknown) {
      console.error('Error toggling todo:', err);
      // Revert optimistic update if there's an error
      setTodos(todos);
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    }
  };

  // Delete a todo
  const handleDeleteTodo = async (todoId: string) => {
    try {
      // Validate UUID format or development ID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const devIdRegex = /^dev-todo-\d+$/;
      if (!uuidRegex.test(todoId) && !devIdRegex.test(todoId)) {
        console.error('TodoWidget: Invalid todoId format:', todoId);
        setError('Invalid todo ID format. Please refresh the page.');
        return;
      }

      // Skip API call for development IDs and always for development mode
      if (devIdRegex.test(todoId) || isDevelopmentMode) {
        // Just update local state for development IDs
        setTodos(todos.filter((todo) => todo.id !== todoId));
        return;
      }

      // Optimistic update
      setTodos(todos.filter((todo) => todo.id !== todoId));

      const response = await fetch(`/api/todos?id=${todoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete todo: ${response.status}`);
      }
    } catch (err: unknown) {
      console.error('Error deleting todo:', err);
      // Revert optimistic update if there's an error
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
    }
  };

  return (
    <WidgetContainer title="Todo" isLoading={isLoading} error={error} className={className}>
      <div className="space-y-4">
        {/* Todo form */}
        <form onSubmit={handleAddTodo} className="flex space-x-2">
          <input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            disabled={isSaving || !dayId}
          />
          <Button type="submit" disabled={isSaving || !newTodoTitle.trim() || !dayId}>
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        {/* Todo list */}
        {todos.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>No todos for today</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-white"
              >
                <div className="flex items-center">
                  <button
                    onClick={() => handleToggleTodo(todo.id, todo.is_completed)}
                    className="mr-3 text-gray-700 hover:text-primary-600 focus:outline-none"
                  >
                    {todo.is_completed ? (
                      <CheckCircle2 className="h-5 w-5 text-primary-600" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>
                  <span className={todo.is_completed ? 'line-through text-gray-500' : ''}>
                    {todo.title}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="text-gray-400 hover:text-red-600 focus:outline-none"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </WidgetContainer>
  );
}
