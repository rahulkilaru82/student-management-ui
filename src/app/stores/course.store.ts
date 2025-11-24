import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Course {
  id?: number;
  code: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class CourseStore {
  private readonly base = `${environment.apiUrl}/courses`;

  private readonly subject = new BehaviorSubject<Course[]>([]);
 
  readonly rows$ = this.subject.asObservable();

  readonly list$ = this.rows$;

  constructor(private http: HttpClient) {}

  load(): Observable<Course[]> {
    return this.http.get<Course[]>(this.base).pipe(
      tap(list => this.subject.next(list ?? []))
    );
  }

  refresh(): Observable<Course[]> {
    return this.load();
  }

  get(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.base}/${id}`);
  }

  create(body: Course): Observable<Course> {
    return this.http.post<Course>(this.base, body).pipe(
      tap(() => this.load().subscribe())
    );
  }

  update(id: number, body: Course): Observable<Course> {
    return this.http.put<Course>(`${this.base}/${id}`, body).pipe(
      tap(() => this.load().subscribe())
    );
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`).pipe(
      tap(() => this.load().subscribe())
    );
  }
}
