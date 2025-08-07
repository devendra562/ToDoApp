import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;
  private notificationsSubject = new BehaviorSubject<any[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private toastr: ToastrService) {
    console.log('SocketService constructor called');
  }

  connect(userId: string): void {
    if (this.socket && this.socket.connected) {
      console.log('Already connected to socket');
      return;
    }

    console.log('Connecting to socket...');

    this.socket = io('http://localhost:3034', {
      reconnection: true,
      reconnectionAttempts: 5,     // Max retry attempts
      reconnectionDelay: 2000,     // Initial delay
      reconnectionDelayMax: 5000   // Max delay between retries
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.socket.emit('identify', userId);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('⚠️ Socket disconnected:', reason);
    });

    this.socket.io.on('reconnect_attempt', (attempt) => {
      console.warn(`🔁 Reconnect attempt #${attempt}`);
    });

    this.socket.io.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed');
      this.toastr.error('Reconnection failed. Please check your connection.');
    });

    this.socket.io.on('reconnect', (attempt) => {
      console.log('✅ Reconnected after', attempt, 'attempt(s)');
      this.toastr.error('Reconnected to the server.');
      this.socket.emit('identify', userId); // Re-identify on reconnect
    });

    this.registerNotificationListeners();
  }

  private registerNotificationListeners(): void {
    this.socket.on('taskAssigned', (data) => {
      this.handleNotification('Task Assigned', data);
    });

    this.socket.on('taskUpdated', (data) => {
      this.handleNotification('Task Updated', data);
    });

    this.socket.on('taskUnassigned', (data) => {
      this.handleNotification('Task Unassigned', data);
    });
  }

  private handleNotification(type: string, data: any): void {
    console.log(`@@@@@ ${type}:`, data);
    const notification = data.notification;
    if (notification) {
      
    }this.toastr.success(`${notification.message}`);
  }

  private addNotification(notification: any): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...current]);
  }

  emit(eventName: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(eventName, data);
    } else {
      console.warn('Socket not connected. Cannot emit:', eventName);
    }
  }

  listen(eventName: string): Observable<any> {
    return new Observable<any>((observer) => {
      this.socket.on(eventName, (data) => {
        observer.next(data);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      console.log('Socket manually disconnected');
    }
  }

  clearNotifications(): void {
    this.notificationsSubject.next([]);
  }

  markNotificationAsRead(notificationId: string): void {
    const updated = this.notificationsSubject.value.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(updated);
  }
}
