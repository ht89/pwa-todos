import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// App
import { CreationContext } from './task-creation.model';
import { TaskStatus } from '../tasks.model';
import { Project } from '@app/pages/projects/projects.model';
import { StoreName } from '@app/@shared';

// Firebase
import { createDocumentRef } from '@app/auth/firebase/common.js';

@Component({
  selector: 'app-task-creation',
  templateUrl: './task-creation.component.html',
  styleUrls: ['./task-creation.component.scss'],
})
export class TaskCreationComponent implements OnInit {
  @Input() projects: Project[] = [];

  displayedProjects: Project[] = [];

  form: FormGroup;
  isSubmitted = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  submit(model: CreationContext, isValid: boolean): void {
    this.isSubmitted = true;

    console.log(model, isValid);
    if (isValid) {
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  search(event: any): void {
    console.log(event);

    const query: string = event?.query;

    if (!query) {
      this.displayedProjects = [...this.projects];
      return;
    }

    this.displayedProjects = this.projects.filter((project) =>
      project.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
    );
  }

  private initForm(): void {
    const docRef = createDocumentRef(StoreName.Projects);

    this.form = this.fb.group({
      id: [docRef?.id, [Validators.required]],
      taskNumber: [''],
      name: ['', [Validators.required]],
      status: [TaskStatus.Processing, [Validators.required]],
      project: [null, [Validators.required]],
    });
  }
}
