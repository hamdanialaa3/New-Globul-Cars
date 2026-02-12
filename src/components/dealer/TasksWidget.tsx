// src/components/dealer/TasksWidget.tsx
// Task Manager Widget - Widget إدارة المهام

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { CheckSquare, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { DashboardTask } from '../../services/dealer/dealer-dashboard.service';

interface TasksWidgetProps {
  tasks: DashboardTask[];
  onComplete?: (taskId: string) => void;
}

const WidgetContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const WidgetTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TasksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TaskItem = styled.div<{ priority: string }>`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: ${props => {
    switch (props.priority) {
      case 'high':
        return '#fef2f2';
      case 'medium':
        return '#fffbeb';
      default:
        return '#f8f9fa';
    }
  }};
  border-left: 4px solid ${props => {
    switch (props.priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      default:
        return '#10b981';
    }
  }};
  border-radius: 8px;
  position: relative;
`;

const TaskIcon = styled.div<{ priority: string }>`
  color: ${props => {
    switch (props.priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      default:
        return '#10b981';
    }
  }};
  flex-shrink: 0;
`;

const TaskContent = styled.div`
  flex: 1;
`;

const TaskTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const TaskDescription = styled.div`
  font-size: 0.875rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
`;

const TaskMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #7f8c8d;
`;

const TaskCar = styled.div`
  font-size: 0.75rem;
  color: #3b82f6;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const TaskAction = styled.button`
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

const CompleteButton = styled.button`
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #059669;
  }
`;

const TasksWidget: React.FC<TasksWidgetProps> = ({ tasks, onComplete }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const getPriorityLabel = (priority: string) => {
    if (language === 'bg') {
      switch (priority) {
        case 'high':
          return 'Високо';
        case 'medium':
          return 'Средно';
        default:
          return 'Ниско';
      }
    } else {
      return priority.charAt(0).toUpperCase() + priority.slice(1);
    }
  };

  const formatDueDate = (dueDate?: any) => {
    if (!dueDate) return null;
    const date = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
    return date.toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US');
  };

  if (tasks.length === 0) {
    return (
      <WidgetContainer>
        <WidgetTitle>
          <CheckSquare size={24} />
          {language === 'bg' ? 'Задачи' : 'Tasks'}
        </WidgetTitle>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
          {language === 'bg' ? 'Няма задачи' : 'No tasks'}
        </div>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer>
      <WidgetTitle>
        <CheckSquare size={24} />
        {language === 'bg' ? 'Задачи' : 'Tasks'} ({tasks.length})
      </WidgetTitle>

      <TasksList>
        {tasks.map((task) => (
          <TaskItem key={task.id} priority={task.priority}>
            <TaskIcon priority={task.priority}>
              {task.priority === 'high' ? (
                <AlertCircle size={20} />
              ) : (
                <Clock size={20} />
              )}
            </TaskIcon>
            <TaskContent>
              <TaskTitle>
                [{getPriorityLabel(task.priority)}] {task.title}
              </TaskTitle>
              <TaskDescription>{task.description}</TaskDescription>
              {task.carTitle && (
                <TaskCar>{task.carTitle}</TaskCar>
              )}
              <TaskMeta>
                {task.dueDate && (
                  <div>
                    {language === 'bg' ? 'Крайна дата:' : 'Due:'} {formatDueDate(task.dueDate)}
                  </div>
                )}
              </TaskMeta>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                {task.actionUrl && (
                  <TaskAction onClick={() => navigate(task.actionUrl!)}>
                    {language === 'bg' ? 'Преглед' : 'View'}
                  </TaskAction>
                )}
                {onComplete && (
                  <CompleteButton onClick={() => onComplete(task.id)}>
                    <CheckSquare size={16} />
                    {language === 'bg' ? 'Завършено' : 'Complete'}
                  </CompleteButton>
                )}
              </div>
            </TaskContent>
          </TaskItem>
        ))}
      </TasksList>
    </WidgetContainer>
  );
};

export default TasksWidget;

