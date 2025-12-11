// src/app/services/comment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../models/index.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = 'http://localhost:8080/api/comments';

  constructor(private http: HttpClient) { }

  getCommentsByEvent(eventId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/event/${eventId}`);
  }

  createComment(eventId: number, userId: number, content: string): Observable<Comment> {
    const params = new HttpParams()
      .set('eventId', eventId.toString())
      .set('userId', userId.toString());
    
    return this.http.post<Comment>(this.apiUrl, { content }, { params });
  }

  deleteComment(commentId: number, userId: number): Observable<void> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.delete<void>(`${this.apiUrl}/${commentId}`, { params });
  }
}