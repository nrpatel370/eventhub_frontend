// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Event, Rsvp } from '../models/index.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) { }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  getUserCreatedEvents(userId: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/${userId}/events`);
  }

  getUserRsvps(userId: number): Observable<Rsvp[]> {
    return this.http.get<Rsvp[]>(`${this.apiUrl}/${userId}/rsvps`);
  }

  updateUser(userId: number, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, userData);
  }

  changePassword(userId: number, oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/change-password`, {
      oldPassword,
      newPassword
    });
  }
}