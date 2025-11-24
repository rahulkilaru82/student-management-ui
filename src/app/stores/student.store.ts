import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, switchMap, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Student {
  id?: number;
  firstName: string;
  lastName: string;
  email?: string;
  birthDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  id?: number;
  code: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class StudentStore {
  private readonly base = `${environment.apiUrl}/students`;
  private readonly coursesBase = `${environment.apiUrl}/courses`;
  private readonly enrollBase = `${environment.apiUrl}/enrollments`;

  private readonly subject = new BehaviorSubject<Student[]>([]);
  readonly rows$ = this.subject.asObservable();

  constructor(private http: HttpClient) {}

  load(): Observable<Student[]> {
    return this.http.get<Student[]>(this.base).pipe(
      tap(list => this.subject.next(list ?? []))
    );
  }

  get(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.base}/${id}`);
  }

  create(body: Partial<Student>): Observable<Student> {
    const payload: any = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      birthDate: body.birthDate ? String(body.birthDate).slice(0, 10) : null
    };
    return this.http.post<Student>(this.base, payload).pipe(
      tap(() => this.load().subscribe())
    );
  }

  update(id: number, changes: Partial<Student>): Observable<Student> {
    return this.get(id).pipe(
      map(current => {
        const merged: any = { ...current, ...changes };
        if (merged.birthDate) merged.birthDate = String(merged.birthDate).slice(0, 10);
        merged.id = id;
        return merged;
      }),
      switchMap(payload => this.http.put<Student>(`${this.base}/${id}`, payload)),
      tap(() => this.load().subscribe())
    );
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`).pipe(
      tap(() => this.load().subscribe())
    );
  }

  listCourses(studentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.enrollBase}/student/${studentId}`);
  }

  listAvailableCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.coursesBase);
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
