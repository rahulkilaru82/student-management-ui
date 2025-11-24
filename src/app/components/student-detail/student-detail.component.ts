import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService, Student, StudentCourseDto, Course } from '../../services/http/student.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './student-detail.component.html'
})
export class StudentDetailComponent implements OnInit, OnDestroy {
  studentId!: number;

  student: Student | null = null;
  enrollments: StudentCourseDto[] = [];
  availableCourses: Course[] = [];

  // UI state
  editedGrades: Record<number, string | null> = {}; // key = courseId
  selectedCourseId: number | null = null;
  loading = false;
  errorMsg = '';

  private sub = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: StudentService
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.route.paramMap.subscribe(params => {
        const id = Number(params.get('id'));
        if (!id) {
          this.errorMsg = 'Invalid student id';
          return;
        }
        this.studentId = id;
        this.loadAll();
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  // ------- Loaders -------
  loadAll(): void {
    this.errorMsg = '';
    this.loading = true;

    this.api.get(this.studentId).subscribe({
      next: s => (this.student = s),
      error: e => {
        console.error('[StudentDetail] get student failed', e);
        this.errorMsg = 'Failed to load student';
      }
    });

    this.api.listCourses(this.studentId).subscribe({
      next: list => {
        this.enrollments = list || [];
        // reset edited map for rows not present anymore
        const present = new Set(this.enrollments.map(e => e.courseId));
        Object.keys(this.editedGrades).forEach(k => {
          const cid = Number(k);
          if (!present.has(cid)) delete this.editedGrades[cid];
        });
        // after enrollments arrive, load available
        this.loadAvailable();
      },
      error: e => {
        console.error('[StudentDetail] listCourses failed', e);
        this.errorMsg = 'Failed to load enrollments';
        this.loading = false;
      }
    });
  }

  loadAvailable(): void {
    this.api.listAvailableCourses().subscribe({
      next: courses => {
        const enrolledIds = new Set(this.enrollments.map(e => e.courseId));
        this.availableCourses = (courses || []).filter(c => !enrolledIds.has(c.id!));
        this.loading = false;
      },
      error: e => {
        console.error('[StudentDetail] listAvailableCourses failed', e);
        this.errorMsg = 'Failed to load courses';
        this.loading = false;
      }
    });
  }

  // ------- Actions -------
  enroll(): void {
    if (!this.selectedCourseId) return;
    this.loading = true;
    this.api.enroll(this.studentId, this.selectedCourseId).subscribe({
      next: () => {
        this.selectedCourseId = null;
        this.loadAll();
      },
      error: e => {
        console.error('[StudentDetail] enroll failed', e);
        this.errorMsg = 'Enroll failed';
        this.loading = false;
      }
    });
  }

  saveGrade(row: StudentCourseDto): void {
    const courseId = row.courseId;
    const grade = this.editedGrades[courseId] ?? row.grade ?? null; // keep existing if untouched
    this.loading = true;

    this.api.setGrade(this.studentId, courseId, grade === '' ? null : grade).subscribe({
      next: () => {
        delete this.editedGrades[courseId];
        this.loadAll();
      },
      error: e => {
        console.error('[StudentDetail] setGrade failed', e);
        this.errorMsg = 'Saving grade failed';
        this.loading = false;
      }
    });
  }

  unenroll(row: StudentCourseDto): void {
    if (!confirm(`Unenroll from ${row.code}?`)) return;
    this.loading = true;
    this.api.unenroll(this.studentId, row.courseId).subscribe({
      next: () => this.loadAll(),
      error: e => {
        console.error('[StudentDetail] unenroll failed', e);
        this.errorMsg = 'Unenroll failed';
        this.loading = false;
      }
    });
  }

  // helpers for grade field
  currentGradeFor(row: StudentCourseDto): string {
    const pending = this.editedGrades[row.courseId];
    return pending !== undefined ? (pending ?? '') : (row.grade ?? '');
  }
}
