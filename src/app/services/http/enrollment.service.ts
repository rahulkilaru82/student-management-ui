import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface EnrollmentDto {
  studentId: number;
  courseId: number;
  grade?: string | null;
}

export interface StudentCourseDto {
  courseId: number;
  code: string;
  name: string;
  grade?: string | null;
}

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/enrollments`;

  listByStudent(studentId: number): Observable<StudentCourseDto[]> {
    return this.http.get<StudentCourseDto[]>(`${this.base}/student/${studentId}`);
  }

  enroll(dto: EnrollmentDto): Observable<EnrollmentDto> {
    return this.http.post<EnrollmentDto>(`${this.base}`, dto);
  }

  unenroll(studentId: number, courseId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}`, { params: { studentId, courseId } as any });
  }
}
