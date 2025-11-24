Student Management UI (Angular)

A small Angular app to manage students, courses, and enrollments.

Run

Prereqs: Node 18/20 and Angular CLI 19

npm ci
ng serve --open


The UI expects the API at http://localhost:8080.

Pages

/students – list with actions: New, Edit, Manage Courses, Enroll, Delete

/students/:id – student profile + enrollments (edit grade, enroll/unenroll)

/courses – add/remove courses

Tech

Angular 19, Angular Material, RxJS, HttpClient (with error interceptor)

Structure (short)
src/app/
  app.config.ts, app.routes.ts, app.component.*
  components/
    students/        # list, form dialog, enroll dialog
    student-detail/  # detail page (profile + enrollments)
    courses/         # course list
  services/
    http/            # student.service.ts, course.service.ts
    interceptors/    # http-error.interceptor.ts
  stores/            # student.store.ts, course.store.ts