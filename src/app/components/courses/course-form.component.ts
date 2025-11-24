import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { CourseStore } from '../../stores/course.store';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, NgIf],
  templateUrl: './course-form.component.html'
})
export class CourseFormComponent implements OnChanges {
  @Input() model: any | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder, private store: CourseStore) {
    this.form = this.fb.group({
      id: [],
      code: ['', Validators.required],
      name: ['', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['model'] && this.model) {
      this.form.reset(this.model || { id: null, code: '', name: '' });
    }
  }

  submit() {
    const body = this.form.value;
    if (!body) return;
    const save$ = body.id ? this.store.update(body.id, body) : this.store.create(body);
    save$.subscribe(() => this.saved.emit());
  }
}
