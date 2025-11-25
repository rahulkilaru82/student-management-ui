import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Student {
  id?: number;
  firstName: string;
  lastName: string;
  email?: string;
  birthDate?: string; 
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

  list(): Observable<Student[]> { return this.http.get<Student[]>(this.base); }
  get(id: number): Observable<Student> { return this.http.get<Student>(`${this.base}/${id}`); }
  create(body: Student): Observable<Student> { return this.http.post<Student>(this.base, body); }
  update(id: number, body: Student): Observable<Student> { return this.http.put<Student>(`${this.base}/${id}`, body); }
  remove(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }

  listAvailableCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.coursesBase);
  }

  listCourses(studentId: number): Observable<StudentCourseDto[]> {
    return this.http.get<StudentCourseDto[]>(`${this.enrollBase}/student/${studentId}`);
  }

  enroll(studentId: number, courseId: number): Observable<any> {
    return this.http.post<any>(this.enrollBase, { studentId, courseId });
  }

  unenroll(studentId: number, courseId: number): Observable<void> {
    return this.http.delete<void>(`${this.enrollBase}?studentId=${studentId}&courseId=${courseId}`);
  }

  setGrade(studentId: number, courseId: number, grade: string | null): Observable<any> {
    return this.http.patch<any>(`${this.enrollBase}/grade`, { studentId, courseId, grade });
  }
}
