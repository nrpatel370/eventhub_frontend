// src/app/components/create-event/create-event.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
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
import { EventCategory, Event } from '../../models/index.model';

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
  isEditMode = false;
  eventId?: number;
  
  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
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

  ngOnInit(): void {
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.eventId = +params['id'];
        this.loadEventData(this.eventId);
      }
    });
  }

  loadEventData(eventId: number): void {
  this.eventService.getEventById(eventId).subscribe({
    next: (event: Event) => {
      const [datePart, timePart] = event.eventDate.split('T');

      const [year, month, day] = datePart.split('-').map(Number);
      const dateForPicker = new Date(year, month - 1, day);

      const [h, m] = timePart.split(':');
      const timeString = `${h}:${m}`; 

      this.eventForm.patchValue({
        title: event.title,
        description: event.description,
        location: event.location,
        eventDate: dateForPicker,
        eventTime: timeString,
        category: event.category,
        maxParticipants: event.maxParticipants
      });
    },
    error: (error: any) => {
      console.error('Error loading event', error);
      alert('Failed to load event');
      this.router.navigate(['/events']);
    }
  });
}


  formatCategory(category: string): string {
    return category
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
     const formData = this.eventForm.value;

      const date: Date = formData.eventDate; // from MatDatepicker
      const [hours, minutes] = (formData.eventTime as string).split(':').map(Number);

      const yyyy = date.getFullYear();
      const MM = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const HH = String(hours).padStart(2, '0');
      const mm = String(minutes).padStart(2, '0');

    const eventDateTime = `${yyyy}-${MM}-${dd}T${HH}:${mm}:00`;
      
      const eventData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        eventDate: eventDateTime,
        category: formData.category,
        maxParticipants: formData.maxParticipants || null
      };
      
      const currentUser = this.authService.currentUserValue;
      if (!currentUser) {
        this.router.navigate(['/login']);
        return;
      }

      if (this.isEditMode && this.eventId) {
        // Update existing event
        this.eventService.updateEvent(this.eventId, eventData as Event).subscribe({
          next: (response: any) => {
            console.log('Event updated successfully', response);
            this.router.navigate(['/event', this.eventId]);
          },
          error: (error: any) => {
            console.error('Error updating event', error);
            alert('Failed to update event. Please try again.');
          }
        });
      } else {
        // Create new event
        const organizerId = currentUser.userId;
        
        this.eventService.createEvent(eventData as Event, organizerId).subscribe({
          next: (response: any) => {
            console.log('Event created successfully', response);
            this.router.navigate(['/events']);
          },
          error: (error: any) => {
            console.error('Error creating event', error);
            alert('Failed to create event. Please try again.');
          }
        });
      }
    } else {
      Object.keys(this.eventForm.controls).forEach(key => {
        this.eventForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    if (this.isEditMode && this.eventId) {
      this.router.navigate(['/event', this.eventId]);
    } else {
      this.router.navigate(['/events']);
    }
  }
}