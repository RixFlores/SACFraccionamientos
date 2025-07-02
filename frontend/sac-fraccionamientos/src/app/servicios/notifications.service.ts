import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { url } from './url'; // Asegúrate que esta ruta sea la correcta

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private baseUrl = url + '/api/notifications';

  constructor(private http: HttpClient) { }

  registerNotification(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  getNotifications(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  getNotificationsByUserId(userId: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/${userId}`);
  }

  updateNotification(userId: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${userId}`, data);
  }

  deleteNotification(notificationId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${notificationId}`);
  }
}
