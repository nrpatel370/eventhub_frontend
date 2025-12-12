// src/app/services/event.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, EventCategory, Rsvp, RsvpStatus } from '../models/index.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  ROOT_URL = 'http://eventhub.us-east-1.elasticbeanstalk.com';
  private apiUrl = this.ROOT_URL + '/api/events';

  constructor(private http: HttpClient) { }

  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl);
  }

  getUpcomingEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/upcoming`);
  }

  getEventsByCategory(category: EventCategory): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/category/${category}`);
  }

  searchEvents(keyword: string): Observable<Event[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<Event[]>(`${this.apiUrl}/search`, { params });
  }

  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  createEvent(event: Event, organizerId: number): Observable<Event> {
    const params = new HttpParams().set('organizerId', organizerId.toString());
    return this.http.post<Event>(this.apiUrl, event, { params });
  }

  updateEvent(id: number, event: Event): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  rsvpToEvent(eventId: number, userId: number, status: RsvpStatus): Observable<Rsvp> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('status', status);
    return this.http.post<Rsvp>(`${this.apiUrl}/${eventId}/rsvp`, null, { params });
  }

  getEventParticipants(eventId: number): Observable<Rsvp[]> {
    return this.http.get<Rsvp[]>(`${this.apiUrl}/${eventId}/participants`);
  }
}