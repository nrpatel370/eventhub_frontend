// src/app/components/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User, Event, Rsvp } from '../../models/index.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user?: User;
  createdEvents: Event[] = [];
  rsvpEvents: Rsvp[] = [];
  loading = true;
  activeTab = 0;

  constructor(
    public authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadUserProfile(currentUser.userId);
  }

  loadUserProfile(userId: number): void {
    this.loading = true;

    this.userService.getUserById(userId).subscribe({
      next: (user: User) => {
        this.user = user;
      },
      error: (error: any) => console.error('Error loading user', error)
    });

    this.userService.getUserCreatedEvents(userId).subscribe({
      next: (events: Event[]) => {
        this.createdEvents = events;
      },
      error: (error: any) => console.error('Error loading events', error)
    });

    this.userService.getUserRsvps(userId).subscribe({
      next: (rsvps: Rsvp[]) => {
        // Filter out NOT_GOING status
        this.rsvpEvents = rsvps.filter((rsvp: Rsvp) => rsvp.status !== 'NOT_GOING');
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading RSVPs', error);
        this.loading = false;
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  viewEvent(eventId: number): void {
    this.router.navigate(['/event', eventId]);
  }

  logout(): void {
    this.authService.logout();
  }
}