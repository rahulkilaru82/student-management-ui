import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { StudentService, StudentCourseDto, Course } from '../../services/http/student.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

export interface EnrollmentDialogData {
  studentId: number;
}

@Component({
  selector: 'app-enrollment-dialog',
  standalone: true,
  imports: [
    // Angular
    NgIf, NgFor, ReactiveFormsModule,
    // Material
    MatDialogModule, MatFormFieldModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatListModule, MatInputModule
  ],
  template: `
    <h2 mat-dialog-title>Enroll in Course</h2>

    <div mat-dialog-content style="width:560px;max-width:100%;">
      <!-- CURRENT ENROLLMENTS (with text grade) -->
      <section class="tw-mb-6">
        <h3 class="tw-text-base tw-font-semibold tw-mb-2">Current Enrollments</h3>

        <div *ngIf="enrolled.length; else noEnrollments">
          <div class="tw-flex tw-flex-col tw-gap-3">
            <div class="tw-flex tw-items-center tw-gap-3" *ngFor="let e of enrolled">
              <div class="tw-flex-1">
                <div class="tw-font-medium">{{ e.code }} — {{ e.name }}</div>
                <div class="tw-text-sm tw-text-gray-600">Grade: {{ e.grade || '—' }}</div>
              </div>

              <!-- Free-text grade input -->
              <mat-form-field appearance="outline" style="width: 160px;">
                <mat-label>Grade</mat-label>
                <input
                  matInput
                  [value]="getPendingGrade(e)"
                  (input)="onGradeInput(e, $any($event.target).value)"
                  placeholder="e.g. A+, 85, Pass"
                />
              </mat-form-field>

              <button
                mat-icon-button
                color="primary"
                (click)="saveGrade(e)"
                [disabled]="!hasPending(e)"
                title="Save grade"
              >
                <mat-icon>save</mat-icon>
              </button>

              <button
                mat-icon-button
                color="warn"
                (click)="doUnenroll(e)"
                title="Unenroll"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        </div>

        <ng-template #noEnrollments>
          <div class="tw-text-sm tw-text-gray-600">This student is not enrolled in any course yet.</div>
        </ng-template>
      </section>

      <!-- ENROLL NEW COURSE -->
      <section>
        <h3 class="tw-text-base tw-font-semibold tw-mb-2">Enroll in a Course</h3>

        <div [formGroup]="form" class="tw-flex tw-items-center tw-gap-3">
          <mat-form-field appearance="fill" style="flex:1;">
            <mat-select placeholder="Select a course" formControlName="courseId">
              <mat-option *ngFor="let c of available" [value]="c.id">{{ c.code }} — {{ c.name }}</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-raised-button color="primary" (click)="enroll()" [disabled]="!form.value.courseId">
            Enroll
          </button>
        </div>
      </section>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="close()">Close</button>
    </div>
  `
})
export class EnrollmentDialogComponent implements OnInit {

  form = this.fb.group({ courseId: [null as number | null] });

  enrolled: StudentCourseDto[] = [];
  available: Course[] = [];

  /** temp grade edits keyed by "studentId-courseId" */
  private pendingGrade = new Map<string, string | null>();

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<EnrollmentDialogComponent, boolean>,
    private api: StudentService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: EnrollmentDialogData
  ) {}

  ngOnInit(): void {
    this.reload();
  }

  /** Helpers */
  private keyOf(e: StudentCourseDto) { return `${this.data.studentId}-${e.courseId}`; }
  hasPending(e: StudentCourseDto) { return this.pendingGrade.has(this.keyOf(e)); }
  getPendingGrade(e: StudentCourseDto) {
    const k = this.keyOf(e);
    return this.pendingGrade.has(k) ? (this.pendingGrade.get(k) ?? '') : (e.grade ?? '');
  }

  /** Load enrolled + available lists */
  private reload(): void {
    const sid = Number(this.data.studentId);
    this.api.listCourses(sid).subscribe({
      next: (list) => {
        this.enrolled = list || [];
        // drop pending for rows that disappeared
        const keys = new Set(this.enrolled.map(e => this.keyOf(e)));
        Array.from(this.pendingGrade.keys()).forEach(k => { if (!keys.has(k)) this.pendingGrade.delete(k); });
      },
      error: (e) => console.error('[EnrollmentDialog] listCourses failed', e)
    });

    this.api.listAvailableCourses().subscribe({
      next: (courses) => {
        // Filter out already enrolled
        const enrolledIds = new Set(this.enrolled.map(e => e.courseId));
        this.available = (courses || []).filter(c => !enrolledIds.has(c.id!));
      },
      error: (e) => console.error('[EnrollmentDialog] listAvailableCourses failed', e)
    });

    this.form.reset({ courseId: null });
  }

  /** Enroll action via POST /api/enrollments */
  enroll(): void {
    const sid = Number(this.data.studentId);
    const cid = Number(this.form.value.courseId);
    if (!sid || !cid) return;

    this.api.enroll(sid, cid).subscribe({
      next: () => this.reload(),
      error: (e) => console.error('[EnrollmentDialog] enroll failed', e)
    });
  }

  /** Track text input locally */
  onGradeInput(e: StudentCourseDto, value: string) {
    const key = this.keyOf(e);
    // Allow empty string to clear grade (null on server)
    this.pendingGrade.set(key, value === '' ? null : value);
  }

  /** Persist grade via PATCH /api/enrollments/grade */
  saveGrade(e: StudentCourseDto) {
    const key = this.keyOf(e);
    if (!this.pendingGrade.has(key)) return;
    const grade = this.pendingGrade.get(key) ?? null;

    this.api.setGrade(this.data.studentId, e.courseId, grade).subscribe({
      next: () => {
        this.pendingGrade.delete(key);
        this.reload();
      },
      error: (err) => console.error('[EnrollmentDialog] setGrade failed', err)
    });
  }

  /** Unenroll via DELETE /api/enrollments?studentId=&courseId= */
  doUnenroll(e: StudentCourseDto) {
    const ref = this.dialog.open(ConfirmDialogComponent, { data: { message: `Remove ${e.code}?` }});
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.api.unenroll(this.data.studentId, e.courseId).subscribe({
        next: () => this.reload(),
        error: (err) => console.error('[EnrollmentDialog] unenroll failed', err)
      });
    });
  }

  close(): void {
    this.ref.close(false);
  }
}
