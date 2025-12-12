// src/app/components/event-detail/event-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { Event, Rsvp, RsvpStatus, Comment } from '../../models/index.model';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { CommentService } from '../../services/comment.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule
  ],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {
  event?: Event;
  participants: Rsvp[] = [];
  comments: Comment[] = [];
  userRsvpStatus?: RsvpStatus;
  loading = true;
  newComment = '';
  
  goingCount = 0;
  interestedCount = 0;
  
  RsvpStatus = RsvpStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    public authService: AuthService,
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    const eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadEventDetails(eventId);
  }

  loadEventDetails(eventId: number): void {
    this.loading = true;
    
    this.eventService.getEventById(eventId).subscribe({
      next: (event: Event) => {
        this.event = event;
        this.loadParticipants(eventId);
        this.loadComments(eventId);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading event', error);
        this.loading = false;
        this.router.navigate(['/events']);
      }
    });
  }

  loadParticipants(eventId: number): void {
    this.eventService.getEventParticipants(eventId).subscribe({
      next: (rsvps: Rsvp[]) => {
        // Filter out NOT_GOING participants
        this.participants = rsvps.filter((r: Rsvp) => r.status !== RsvpStatus.NOT_GOING);
        
        this.goingCount = this.participants.filter((r: Rsvp) => r.status === RsvpStatus.GOING).length;
        this.interestedCount = this.participants.filter((r: Rsvp) => r.status === RsvpStatus.INTERESTED).length;
        
        const currentUser = this.authService.currentUserValue;
        if (currentUser) {
          const userRsvp = this.participants.find((r: Rsvp) => r.user.id === currentUser.userId);
          this.userRsvpStatus = userRsvp?.status;
        }
      },
      error: (error: any) => console.error('Error loading participants', error)
    });
  }

  loadComments(eventId: number): void {
    this.commentService.getCommentsByEvent(eventId).subscribe({
      next: (comments: Comment[]) => {
        this.comments = comments;
      },
      error: (error: any) => console.error('Error loading comments', error)
    });
  }

  rsvp(status: RsvpStatus): void {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    const currentUser = this.authService.currentUserValue!;
    
    this.eventService.rsvpToEvent(this.event!.id!, currentUser.userId, status).subscribe({
      next: () => {
        this.userRsvpStatus = status === RsvpStatus.NOT_GOING ? undefined : status;
        this.loadParticipants(this.event!.id!);
      },
      error: (error: any) => {
        console.error('Error submitting RSVP', error);
        alert(error.error || 'Failed to RSVP');
      }
    });
  }

  addComment(): void {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.newComment.trim()) {
      return;
    }

    const currentUser = this.authService.currentUserValue!;

    this.commentService.createComment(
      this.event!.id!,
      currentUser.userId,
      this.newComment
    ).subscribe({
      next: (comment: Comment) => {
        this.comments.unshift(comment);
        this.newComment = '';
      },
      error: (error: any) => console.error('Error adding comment', error)
    });
  }

  deleteComment(commentId: number): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      const currentUser = this.authService.currentUserValue!;
      
      this.commentService.deleteComment(commentId, currentUser.userId).subscribe({
        next: () => {
          this.comments = this.comments.filter(c => c.id !== commentId);
        },
        error: (error: any) => {
          console.error('Error deleting comment', error);
          alert('Failed to delete comment');
        }
      });
    }
  }

  canDeleteComment(comment: Comment): boolean {
    const currentUser = this.authService.currentUserValue;
    return currentUser ? 
      (comment.user.id === currentUser.userId || this.authService.isAdmin) : 
      false;
  }

  isOrganizer(): boolean {
    const currentUser = this.authService.currentUserValue;
    return currentUser ? this.event?.organizer?.id === currentUser.userId : false;
  }

  editEvent(): void {
    this.router.navigate(['/edit-event', this.event!.id]);
  }

  deleteEvent(): void {
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(this.event!.id!).subscribe({
        next: () => {
          alert('Event deleted successfully');
          this.router.navigate(['/events']);
        },
        error: (error: any) => {
          console.error('Error deleting event', error);
          alert('Failed to delete event');
        }
      });
    }
  }

  formatDate(date: string | Date): string {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;

  return d.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

}