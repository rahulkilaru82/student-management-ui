import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'students' },
  {
    path: 'students',
    loadComponent: () =>
      import('./components/students/students-page.component')
        .then(m => m.StudentsPageComponent),
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('./components/courses/courses-page.component')
        .then(m => m.CoursesPageComponent),
  },
  {
    path: 'students/:id',
    loadComponent: () =>
      import('./components/student-detail/student-detail.component')
        .then(m => m.StudentDetailComponent),
  },
  { path: '**', redirectTo: 'students' }];
