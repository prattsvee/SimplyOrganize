// src/services/SignalRService.ts
import * as signalR from '@microsoft/signalr';
import { TaskItem, TaskComment } from '../types/tasks';
import { ProjectDetails } from '../types/project';
import authService from './authService';

type CallbackFunction = (...args: any[]) => void;

class SignalRService {
  private hubConnection: signalR.HubConnection;
  private callbacks: { [key: string]: CallbackFunction[] } = {};
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;

  constructor() {
    this.initializeConnection();
  }
  private initializeConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5059/taskHub', {
        accessTokenFactory: () => authService.getToken() || '',
        withCredentials: false,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withHubProtocol(new signalR.JsonHubProtocol())
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();
  
    this.setupConnectionHandlers();
    this.setupEventHandlers();
  }


  private setupConnectionHandlers() {
    this.hubConnection.onreconnecting((error) => {
      console.warn('SignalR Reconnecting:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.stop();
      }
    });

    this.hubConnection.onreconnected((connectionId) => {
      console.log('SignalR Reconnected:', connectionId);
      this.reconnectAttempts = 0;
      this.resubscribeToEvents();
    });

    this.hubConnection.onclose((error) => {
      console.error('SignalR Connection Closed:', error);
      this.handleConnectionClosed();
    });
  }

  private setupEventHandlers() {
    // Task Events
    this.hubConnection.on('TaskCreated', (task: TaskItem) => {
      this.invokeCallbacks('TaskCreated', task);
    });

    this.hubConnection.on('TaskUpdated', (task: TaskItem) => {
      this.invokeCallbacks('TaskUpdated', task);
    });

    this.hubConnection.on('TaskDeleted', (taskId: number) => {
      this.invokeCallbacks('TaskDeleted', taskId);
    });

    this.hubConnection.on('TaskStatusChanged', (taskId: number, newStatus: string) => {
      this.invokeCallbacks('TaskStatusChanged', taskId, newStatus);
    });

    // Comment Events
    this.hubConnection.on('CommentAdded', (taskId: number, comment: TaskComment) => {
      this.invokeCallbacks('CommentAdded', taskId, comment);
    });

    this.hubConnection.on('CommentDeleted', (taskId: number, commentId: number) => {
      this.invokeCallbacks('CommentDeleted', taskId, commentId);
    });

    // Project Events
    this.hubConnection.on('ProjectCreated', (project: ProjectDetails) => {
      this.invokeCallbacks('ProjectCreated', project);
    });

    this.hubConnection.on('ProjectUpdated', (project: ProjectDetails) => {
      this.invokeCallbacks('ProjectUpdated', project);
    });

    this.hubConnection.on('ProjectDeleted', (projectId: number) => {
      this.invokeCallbacks('ProjectDeleted', projectId);
    });

    // Team Member Events
    this.hubConnection.on('TeamMemberAdded', (projectId: number, userId: string) => {
      this.invokeCallbacks('TeamMemberAdded', projectId, userId);
    });

    this.hubConnection.on('TeamMemberRemoved', (projectId: number, userId: string) => {
      this.invokeCallbacks('TeamMemberRemoved', projectId, userId);
    });
  }

  private handleConnectionClosed() {
    // Reset connection state
    this.callbacks = {};
    this.reconnectAttempts = 0;
    
    // Attempt to restart if user is still authenticated
    if (authService.isAuthenticated()) {
      this.start();
    }
  }

  private resubscribeToEvents() {
    // Resubscribe to project/task specific events if needed
    // This would be implemented based on your specific needs
  }

  private invokeCallbacks(event: string, ...args: any[]) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in ${event} callback:`, error);
        }
      });
    }
  }

  public async start(): Promise<void> {
    if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
      try {
        await this.hubConnection.start();
        console.log('SignalR Connected');
        this.reconnectAttempts = 0;
      } catch (err) {
        console.error('SignalR Connection Error:', err);
        if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
          setTimeout(() => this.start(), 5000);
        }
      }
    }
  }

  public async stop(): Promise<void> {
    try {
      await this.hubConnection.stop();
      console.log('SignalR Disconnected');
      this.callbacks = {};
    } catch (err) {
      console.error('SignalR Disconnection Error:', err);
    }
  }

  // Event listener methods - Task related
  public addTaskCreatedListener(callback: (task: TaskItem) => void) {
    this.addCallback('TaskCreated', callback);
  }

  public addTaskUpdatedListener(callback: (task: TaskItem) => void) {
    this.addCallback('TaskUpdated', callback);
  }

  public addTaskDeletedListener(callback: (taskId: number) => void) {
    this.addCallback('TaskDeleted', callback);
  }

  public addTaskStatusChangedListener(callback: (taskId: number, status: string) => void) {
    this.addCallback('TaskStatusChanged', callback);
  }

  // Event listener methods - Comment related
  public addCommentAddedListener(callback: (taskId: number, comment: TaskComment) => void) {
    this.addCallback('CommentAdded', callback);
  }

  public addCommentDeletedListener(callback: (taskId: number, commentId: number) => void) {
    this.addCallback('CommentDeleted', callback);
  }

  // Event listener methods - Project related
  public addProjectCreatedListener(callback: (project: ProjectDetails) => void) {
    this.addCallback('ProjectCreated', callback);
  }

  public addProjectUpdatedListener(callback: (project: ProjectDetails) => void) {
    this.addCallback('ProjectUpdated', callback);
  }

  public addProjectDeletedListener(callback: (projectId: number) => void) {
    this.addCallback('ProjectDeleted', callback);
  }

  // Event listener methods - Team member related
  public addTeamMemberAddedListener(callback: (projectId: number, userId: string) => void) {
    this.addCallback('TeamMemberAdded', callback);
  }

  public addTeamMemberRemovedListener(callback: (projectId: number, userId: string) => void) {
    this.addCallback('TeamMemberRemoved', callback);
  }

  // Generic add/remove listener methods
  private addCallback(event: string, callback: CallbackFunction) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  public removeListener(event: string, callback: CallbackFunction) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }

  // Method to check connection state
  public isConnected(): boolean {
    return this.hubConnection.state === signalR.HubConnectionState.Connected;
  }
}

export const signalRService = new SignalRService();
export default signalRService;