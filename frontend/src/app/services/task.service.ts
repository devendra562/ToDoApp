import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private api = 'http://localhost:3034/api/v1/tasks';

  constructor(private http: HttpClient) { }

  getAllTasks(requestBody: any) {
    return this.http.post(`${this.api}/getTasks`, requestBody);
  }

  getSingleTask(id: string): Observable<any> {
    return this.http.get(`${this.api}/getTaskById/${id}`);
  }

  createTask(data: any): Observable<any> {
    return this.http.post(`${this.api}/createTask`, data);
  }

  updateTask(id: string, data: any): Observable<any> {
    return this.http.put(`${this.api}/updateTask/${id}`, data);
  }

  deleteTask(id: string): Observable<any> {
    return this.http.delete(`${this.api}/deleteTask/${id}`);
  }

  getUsers(): Observable<any> {
    return this.http.get('http://localhost:3034/api/v1/auth/getUsers');
  }

  getCommentsByTask(taskId: string): Observable<any> {  
    return this.http.get(`${this.api}/comments/getCommentsByTask/${taskId}`);
  }

  addComment(taskId: string, comment: string): Observable<any> {
    return this.http.post(`${this.api}/comments/addComment/${taskId}`, { comment });
  }
}
