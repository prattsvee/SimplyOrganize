// src/pages/Calendar.tsx
import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { Clock, Users, AlertCircle, Tag } from 'lucide-react';
import Sidebar from '../components/SideBar';
import Header from '../components/Header';
import { taskService } from '../services/taskServices';
import { TaskItem, TaskStatus, TaskPriority } from '../types/tasks';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup the localizer
const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: {
    taskId: number;
    status: string;
    priority: string;
    assignee?: string;
    description: string;
  };
}

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const tasks = await taskService.getTasksByProjectId(1);
      const calendarEvents = convertTasksToEvents(tasks);
      setEvents(calendarEvents);
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const convertTasksToEvents = (tasks: TaskItem[]): CalendarEvent[] => {
    return tasks
      .filter(task => task.dueDate) // Only tasks with due dates
      .map(task => ({
        id: task.id,
        title: task.title,
        start: new Date(task.dueDate!),
        end: new Date(task.dueDate!),
        resource: {
          taskId: task.id,
          status: task.status.toString(),
          priority: task.priority.toString(),
          assignee: task.assigneeId || undefined,
          description: task.shortDescription
        }
      }));
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3B82F6'; // Default blue

    switch (event.resource.priority.toUpperCase()) {
      case 'HIGH':
        backgroundColor = '#EF4444';
        break;
      case 'MEDIUM':
        backgroundColor = '#F59E0B';
        break;
      case 'LOW':
        backgroundColor = '#10B981';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: 'none',
        display: 'block'
      }
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DONE':
        return 'bg-green-100 text-green-800';
      case 'INPROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'TODO':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date): string => {
    return format(date, 'PPP');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header onTabChange={() => {}} />
        <main className="p-6 flex-1 overflow-hidden">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6 h-[calc(100vh-11rem)]">
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleSelectEvent}
              views={['month', 'week', 'day']}
              defaultView="month"
            />
          </div>

          {/* Event Details Modal */}
          {selectedEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedEvent.title}
                    </h3>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-4 space-y-4">
                    <p className="text-gray-600">
                      {selectedEvent.resource.description}
                    </p>

                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Due: {formatDate(selectedEvent.start)}</span>
                    </div>

                    {selectedEvent.resource.assignee && (
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Assigned to: {selectedEvent.resource.assignee}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-500" />
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityBadgeColor(selectedEvent.resource.priority)}`}>
                        {selectedEvent.resource.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(selectedEvent.resource.status)}`}>
                        {selectedEvent.resource.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Close
                    </button>
                    <button
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      View Task
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Calendar;