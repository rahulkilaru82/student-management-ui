import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { CourseStore } from '../../stores/course.store';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './course-form.component.html'
})
export class CourseFormComponent implements OnChanges {
  @Input() model: any | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private store = inject(CourseStore);

  form: FormGroup = this.fb.group({
    id: [null],
    code: ['', Validators.required],
    name: ['', Validators.required]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['model']) {
      this.form.reset(this.model ?? { id: null, code: '', name: '' });
    }
  }

  submit(): void {
    const body = this.form.value;
    if (!body) return;

    const op$ = body.id
      ? this.store.update(body.id, body)
      : this.store.create(body);

    op$.subscribe(() => this.saved.emit());
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
