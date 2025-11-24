import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Student {
  id?: number;
  firstName: string;
  lastName: string;
  email?: string;
  birthDate?: string; // yyyy-MM-dd
}

export interface Course {
  id?: number;
  code: string;
  name: string;
}

export interface StudentCourseDto {
  courseId: number;
  code: string;
  name: string;
  grade?: string | null;
}

@Injectable({ providedIn: 'root' })
export class StudentService {
  private base = `${environment.apiUrl}/students`;
  private coursesBase = `${environment.apiUrl}/courses`;
  private enrollBase = `${environment.apiUrl}/enrollments`;

  constructor(private http: HttpClient) {}

  // ----- Students CRUD -----
  list(): Observable<Student[]> { return this.http.get<Student[]>(this.base); }
  get(id: number): Observable<Student> { return this.http.get<Student>(`${this.base}/${id}`); }
  create(body: Student): Observable<Student> { return this.http.post<Student>(this.base, body); }
  update(id: number, body: Student): Observable<Student> { return this.http.put<Student>(`${this.base}/${id}`, body); }
  remove(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }

  // ----- Courses (for selection) -----
  listAvailableCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.coursesBase);
  }

  // ----- Enrollment (match your EnrollmentController) -----

  /** Courses a student is enrolled in (StudentCourseDto[]) */
  listCourses(studentId: number): Observable<StudentCourseDto[]> {
    return this.http.get<StudentCourseDto[]>(`${this.enrollBase}/student/${studentId}`);
  }

  /** Enroll the student to a course: POST /api/enrollments { studentId, courseId } */
  enroll(studentId: number, courseId: number): Observable<any> {
    return this.http.post<any>(this.enrollBase, { studentId, courseId });
  }

  /** Unenroll: DELETE /api/enrollments?studentId=..&courseId=.. */
  unenroll(studentId: number, courseId: number): Observable<void> {
    return this.http.delete<void>(`${this.enrollBase}?studentId=${studentId}&courseId=${courseId}`);
  }

  /** Optional: set/update grade */
  setGrade(studentId: number, courseId: number, grade: string | null): Observable<any> {
    return this.http.patch<any>(`${this.enrollBase}/grade`, { studentId, courseId, grade });
  }
}
