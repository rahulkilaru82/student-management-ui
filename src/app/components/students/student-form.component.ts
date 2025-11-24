import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { StudentStore } from '../../stores/student.store';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule,
    MatButtonModule, MatIconModule
  ],
  templateUrl: './student-form.component.html',
  // inline styles so no .scss file is needed
  styles: [`
    .sf-title { display:flex; align-items:center; gap:8px; margin:0; }
    .sf-content { padding-top:4px; }
    .sf-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .sf-full { grid-column:1 / -1; }
    .sf-actions { padding-top:8px; }
    mat-form-field { width:100%; }
    @media (max-width: 640px) { .sf-grid { grid-template-columns:1fr; } }
  `]
})
export class StudentFormComponent implements OnInit {
  title = this.data?.id ? 'Edit student' : 'New student';

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    birthDate: [null as Date | null, Validators.required],
  });

  saving = false;

  constructor(
    private fb: FormBuilder,
    private store: StudentStore,
    private ref: MatDialogRef<StudentFormComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: { id?: number } | null
  ) {}

  ngOnInit(): void {
    if (this.data?.id) {
      this.store.get(this.data.id).subscribe(s => {
        this.form.patchValue({
          firstName: s.firstName,
          lastName: s.lastName,
          email: s.email ?? '',
          birthDate: s.birthDate ? new Date(s.birthDate) : null
        });
      });
    }
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;

    const v = this.form.value;
    const payload = {
      firstName: v.firstName!,
      lastName: v.lastName!,
      email: v.email!,
      birthDate: v.birthDate ? new Date(v.birthDate).toISOString().slice(0,10) : null
    };

    const req$ = this.data?.id
      ? this.store.update(this.data.id, payload)
      : this.store.create(payload);

    req$.subscribe({
      next: () => this.ref.close(true),
      error: (e) => { console.error('[StudentForm] save failed', e); this.saving = false; }
    });
  }

  cancel(): void { this.ref.close(false); }
}
