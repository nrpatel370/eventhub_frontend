// src/app/components/create-event/create-event.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { EventCategory } from '../../models/index.model';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css']
})
export class CreateEventComponent implements OnInit {
  eventForm: FormGroup;
  categories = Object.values(EventCategory);
  minDate = new Date();
  
  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private authService: AuthService,
    private router: Router
  ) {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required]],
      location: ['', [Validators.required]],
      eventDate: ['', [Validators.required]],
      eventTime: ['', [Validators.required]],
      category: ['', [Validators.required]],
      maxParticipants: ['']
    });
  }

  ngOnInit(): void { }

  formatCategory(category: string): string {
    return category
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      const formData = this.eventForm.value;
      
      // Combine date and time
      const eventDate = new Date(formData.eventDate);
      const [hours, minutes] = formData.eventTime.split(':');
      eventDate.setHours(parseInt(hours), parseInt(minutes));
      
      const eventData = {
        ...formData,
        eventDate: eventDate.toISOString(),
        eventTime: undefined // Remove eventTime from payload
      };
      
      delete eventData.eventTime;
      
      const currentUser = this.authService.currentUserValue;
      if (!currentUser) {
        this.router.navigate(['/login']);
        return;
      }
      
      const organizerId = currentUser.userId;
      
      this.eventService.createEvent(eventData, organizerId).subscribe({
        next: (response: any) => {
          console.log('Event created successfully', response);
          this.router.navigate(['/events']);
        },
        error: (error: any) => {
          console.error('Error creating event', error);
          alert('Failed to create event. Please try again.');
        }
      });
    } else {
      Object.keys(this.eventForm.controls).forEach(key => {
        this.eventForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/events']);
  }
}