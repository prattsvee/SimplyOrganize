// src/services/signalRService.ts
import * as signalR from '@microsoft/signalr';
import { TaskItem, ProjectDetails } from '../types/project';

export class SignalRService {
  private hubConnection: signalR.HubConnection;
  private callbacks: { [key: string]: ((...args: any[]) => void)[] } = {};

  constructor() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5059/taskHub')
      .withAutomaticReconnect()
      .build();

    // Define handlers for all possible SignalR events
    const eventHandlers = [
      'TaskCreated',
      'TaskUpdated',
      'TaskDeleted',
      'ProjectCreated',
      'ProjectUpdated',
      'ProjectDeleted',
      'TaskCommentAdded',
      'TaskCommentDeleted',
      'TaskAttachmentAdded',
      'TaskAttachmentDeleted'
    ];

    eventHandlers.forEach(event => {
      this.hubConnection.on(event, (...args: any[]) => {
        this.callbacks[event]?.forEach(callback => callback(...args));
      });
    });
  }

  public async start(): Promise<void> {
    try {
      await this.hubConnection.start();
      console.log('SignalR Connected');
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
      setTimeout(() => this.start(), 5000);
    }
  }

  public addTaskCreatedListener(callback: (task: TaskItem) => void) {
    this.addCallback('TaskCreated', callback);
  }

  public addTaskUpdatedListener(callback: (task: TaskItem) => void) {
    this.addCallback('TaskUpdated', callback);
  }

  public addTaskDeletedListener(callback: (taskId: number) => void) {
    this.addCallback('TaskDeleted', callback);
  }

  public addProjectCreatedListener(callback: (project: ProjectDetails) => void) {
    this.addCallback('ProjectCreated', callback);
  }

  public addProjectUpdatedListener(callback: (project: ProjectDetails) => void) {
    this.addCallback('ProjectUpdated', callback);
  }

  public addProjectDeletedListener(callback: (projectId: number) => void) {
    this.addCallback('ProjectDeleted', callback);
  }

  private addCallback(event: string, callback: (...args: any[]) => void) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  public removeListener(event: string, callback: (...args: any[]) => void) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }

  public async stop(): Promise<void> {
    try {
      await this.hubConnection.stop();
      console.log('SignalR Disconnected');
    } catch (err) {
      console.error('SignalR Disconnection Error: ', err);
    }
  }
}

// Create a singleton instance
export const signalRService = new SignalRService();
export default signalRService;