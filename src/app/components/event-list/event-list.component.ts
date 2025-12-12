// src/app/components/event-list/event-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Event, EventCategory, Rsvp } from '../../models/index.model';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-event-list',
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
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  userRsvps: Rsvp[] = [];
  categories = Object.values(EventCategory);
  selectedCategory: string = 'ALL';
  searchKeyword: string = '';
  loading: boolean = false;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadUpcomingEvents();
    this.loadUserRsvps();
  }

  loadUpcomingEvents(): void {
    this.loading = true;
    this.eventService.getUpcomingEvents().subscribe({
      next: (data: Event[]) => {
        this.events = data;
        this.filteredEvents = data;
        this.loading = false;
        console.log(data)
      },
      error: (error: any) => {
        console.error('Error loading events', error);
        this.loading = false;
      }
    });
  }

  loadUserRsvps(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.userService.getUserRsvps(currentUser.userId).subscribe({
        next: (rsvps: Rsvp[]) => {
          this.userRsvps = rsvps.filter((r: Rsvp) => r.status !== 'NOT_GOING');
        },
        error: (error: any) => console.error('Error loading RSVPs', error)
      });
    }
  }

  getUserRsvpStatus(eventId: number): string | null {
    const rsvp = this.userRsvps.find((r: Rsvp) => r.event.id === eventId);
    return rsvp ? rsvp.status : null;
  }

  filterByCategory(): void {
    if (this.selectedCategory === 'ALL') {
      this.filteredEvents = this.events;
    } else {
      this.filteredEvents = this.events.filter(
        event => event.category === this.selectedCategory
      );
    }
  }

  searchEvents(): void {
    if (this.searchKeyword.trim() === '') {
      this.filteredEvents = this.events;
      return;
    }
    
    this.eventService.searchEvents(this.searchKeyword).subscribe({
      next: (data: Event[]) => {
        this.filteredEvents = data;
      },
      error: (error: any) => {
        console.error('Error searching events', error);
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCategory(category: string): string {
    return category
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }
}