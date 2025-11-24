import { Component, Inject, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { AsyncPipe, NgIf, NgFor } from '@angular/common';

// ✅ fixed: use relative barrel import (no @app alias)
import { StudentService, CourseService, Course, Student } from '../../services/http';

// ✅ fixed: use relative path (no @app alias)
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

export interface ManageEnrollmentsData {
  student: Student;
}

@Component({
  selector: 'app-manage-enrollments-dialog',
  standalone: true,
  imports: [
    NgIf, NgFor, AsyncPipe,
    MatDialogModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatListModule
  ],
  template: `
    <h2 mat-dialog-title>Manage Enrollments</h2>

    <div mat-dialog-content class="tw-w-[520px] tw-max-w-full">
      <p>Student: <b>{{ data.student.firstName }} {{ data.student.lastName }}</b></p>

      <section class="tw-mt-4">
        <h3 class="tw-text-base tw-font-semibold">Currently Enrolled</h3>
        <mat-nav-list *ngIf="(enrolled$ | async) as enrolled; else noEnroll">
          <a mat-list-item *ngFor="let c of enrolled">
            {{ c.code }} — {{ c.name }}
            <span class="tw-flex-1"></span>
            <button mat-button color="warn" (click)="unenroll(c)">Remove</button>
          </a>
        </mat-nav-list>
        <ng-template #noEnroll>
          <div class="tw-text-sm tw-text-gray-600">No courses yet.</div>
        </ng-template>
      </section>

      <section class="tw-mt-6">
        <h3 class="tw-text-base tw-font-semibold">Enroll in a Course</h3>
        <mat-form-field appearance="fill" class="tw-w-full tw-mt-2">
          <mat-select [value]="selectedCourseId$ | async" (valueChange)="onSelect($event)" placeholder="Select a course">
            <mat-option *ngFor="let c of (available$ | async)!" [value]="c.id">
              {{ c.code }} — {{ c.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <div class="tw-mt-2">
          <button mat-raised-button color="primary" (click)="enroll()" [disabled]="!(selectedCourseId$ | async)">Enroll</button>
        </div>
      </section>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="close()">Close</button>
    </div>
  `
})
export class ManageEnrollmentsDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<ManageEnrollmentsDialogComponent, boolean>);
  private dialog = inject(MatDialog);
  private studentSvc = inject(StudentService);
  private courseSvc = inject(CourseService);

  selectedCourseId$ = new BehaviorSubject<number | null>(null);

  enrolled$ = new BehaviorSubject<Course[]>([]);
  available$ = new BehaviorSubject<Course[]>([]);

  constructor(@Inject(MAT_DIALOG_DATA) public data: ManageEnrollmentsData) {}

  ngOnInit(): void {
    this.refresh();
  }

  private refresh(): void {
    const studentId = this.data.student.id!;
    combineLatest([
      this.studentSvc.listCourses(studentId),
      this.courseSvc.list()
    ])
    .pipe(
      map(([enrolled, all]) => {
        this.enrolled$.next(enrolled || []);
        const enrolledIds = new Set((enrolled || []).map(c => c.id));
        this.available$.next((all || []).filter(c => !enrolledIds.has(c.id)));
        this.selectedCourseId$.next(null);
      })
    )
    .subscribe();
  }

  onSelect(id: number | null) {
    this.selectedCourseId$.next(id);
  }

  enroll(): void {
    const studentId = this.data.student.id!;
    const courseId = this.selectedCourseId$.value;
    if (!courseId) return;

    this.studentSvc.enroll(studentId, courseId).subscribe(() => {
      this.refresh();
    });
  }

  unenroll(c: Course): void {
    this.dialog.open(ConfirmDialogComponent, { data: { message: `Remove ${c.code}?` } })
      .afterClosed().subscribe(ok => {
        if (ok && this.data.student.id && c.id) {
          this.studentSvc.unenroll(this.data.student.id, c.id).subscribe(() => this.refresh());
        }
      });
  }

  close(): void {
    this.dialogRef.close(true);
  }
}
