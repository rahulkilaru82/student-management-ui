import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Course {
  id?: number;
  code: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class CourseService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/courses`;

  list(): Observable<Course[]> { return this.http.get<Course[]>(this.base); }
  get(id: number): Observable<Course> { return this.http.get<Course>(`${this.base}/${id}`); }
  create(body: Course): Observable<Course> { return this.http.post<Course>(this.base, body); }
  update(id: number, body: Course): Observable<Course> { return this.http.put<Course>(`${this.base}/${id}`, body); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
