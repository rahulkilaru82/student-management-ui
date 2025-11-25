import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { StudentStore } from '../../stores/student.store';
import { StudentFormComponent } from './student-form.component';

@Component({
  selector: 'app-students-page',
  standalone: true,
  imports: [
    AsyncPipe, NgIf, RouterModule,
    MatTableModule, MatIconModule, MatButtonModule, MatDialogModule
  ],
  templateUrl: './students-page.component.html'
})
export class StudentsPageComponent implements OnInit {
  displayedColumns = ['firstName', 'lastName', 'email', 'actions'];
  students$ = this.store.rows$;

  constructor(
    private store: StudentStore,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.store.load().subscribe();
  }

  create() {
    const ref = this.dialog.open(StudentFormComponent, {
      width: '640px',
      maxWidth: '95vw',
      autoFocus: false,
      data: null
    });
    ref.afterClosed().subscribe(changed => {
      if (changed) this.store.load().subscribe();
    });
  }

  edit(s: { id: number }) {
    if (!s?.id) return;
    const ref = this.dialog.open(StudentFormComponent, {
      width: '640px',
      maxWidth: '95vw',
      autoFocus: false,
      data: { id: s.id }
    });
    ref.afterClosed().subscribe(changed => {
      if (changed) this.store.load().subscribe();
    });
  }

  manage(s: { id: number }) {
    if (!s?.id) return;
    this.router.navigate(['/students', s.id]);
  }

  remove(s: { id: number }) {
    if (!s?.id) return;
    if (!confirm('Delete this student?')) return;
    this.store.remove(s.id).subscribe({ next: () => this.store.load().subscribe() });
  }
}
