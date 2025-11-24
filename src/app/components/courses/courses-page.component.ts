import { Component } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CourseFormComponent } from './course-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { CourseStore } from '../../stores/course.store';

@Component({
  selector: 'app-courses-page',
  standalone: true,
  imports: [
    NgIf, AsyncPipe,
    MatTableModule, MatIconModule, MatButtonModule, MatDialogModule,
    CourseFormComponent
  ],
  templateUrl: './courses-page.component.html'
})
export class CoursesPageComponent {
  // This already matches your courses-page.component.html
  displayedColumns = ['code', 'name', 'actions'];

  editing: any = null;
  rows$ = this.store.rows$;

  constructor(private store: CourseStore, private dialog: MatDialog) {
    // initial load
    this.store.load().subscribe();
  }

  new() { this.editing = {}; }
  edit(c: any) { this.editing = { ...c }; }

  remove(c: any) {
    this.dialog.open(ConfirmDialogComponent, {
      data: { message: `Delete course ${c.code}?` }
    }).afterClosed().subscribe(ok => {
      if (ok && c.id) this.store.remove(c.id).subscribe();
    });
  }

  onSaved() {
    this.editing = null;
    this.store.load().subscribe();
  }
}
