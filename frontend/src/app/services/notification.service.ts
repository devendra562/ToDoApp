import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private api = 'http://localhost:3034/api/v1/notifications';

  constructor(private http: HttpClient) { }

  getNotificationsByUser(): Observable<any> {
    return this.http.get(`${this.api}/getNotificationsByUser`);
  }

  markAsRead(notificationId?: string): Observable<any> {
    const url = notificationId
      ? `${this.api}/markAsRead/${notificationId}` // for single notification
      : `${this.api}/markAsRead`;                  // for all notifications
    return this.http.put(url, {});
  }


  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(`${this.api}/deleteNotification/${notificationId}`);
  }
}
