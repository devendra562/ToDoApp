import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = 'http://localhost:3034/api/v1/auth';
  // private currentUser = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {
    // const token = localStorage.getItem('token');
    // if (token) this.fetchCurrentUser().subscribe();
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.api}/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.api}/login`, data);
  }

  fetchCurrentUser(): Observable<any> {
    return this.http.get(`${this.api}/getUserDetails`);
  }

  logout() {
    localStorage.removeItem('token');
    // this.currentUser.next(null);
  }

  // user$ = this.currentUser.asObservable();
}
