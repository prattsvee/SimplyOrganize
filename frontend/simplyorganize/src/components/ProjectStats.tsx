import React from 'react';
import { TasksSummary } from '../types/project';
import { CheckCircle2, Clock, AlertTriangle, CalendarDays, ListTodo } from 'lucide-react';

interface ProjectStatsProps {
  stats: TasksSummary;
}

const ProjectStats: React.FC<ProjectStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: <ListTodo className="w-5 h-5 text-blue-600" />,
      className: 'bg-blue-50 border-blue-100'
    },
    {
      title: 'Completed',
      value: stats.completedTasks,
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      className: 'bg-green-50 border-green-100'
    },
    {
      title: 'In Progress',
      value: stats.inProgressTasks,
      icon: <Clock className="w-5 h-5 text-yellow-600" />,
      className: 'bg-yellow-50 border-yellow-100'
    },
    {
      title: 'Overdue',
      value: stats.overdueTasks,
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
      className: 'bg-red-50 border-red-100'
    },
    {
      title: 'Upcoming',
      value: stats.upcomingTasks,
      icon: <CalendarDays className="w-5 h-5 text-purple-600" />,
      className: 'bg-purple-50 border-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`${stat.className} rounded-lg border p-6 transition-shadow hover:shadow-sm`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm">
              {stat.icon}
            </div>
            <span className="text-2xl font-semibold">{stat.value}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
        </div>
      ))}
    </div>
  );
};

export default ProjectStats;