import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// App
import { CreationContext } from './task-creation.model';
import { TaskStatus } from '../tasks.model';
import { Project } from '@app/pages/projects/projects.model';
import { StoreName } from '@app/@shared';
import { TasksService } from '../tasks.service';

// Firebase
import { createDocumentRef } from '@app/auth/firebase/common.js';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-task-creation',
  templateUrl: './task-creation.component.html',
  styleUrls: ['./task-creation.component.scss'],
})
export class TaskCreationComponent implements OnInit {
  @Input() projects: Project[] = [];
  @Input() tasksService: TasksService;

  displayedProjects: Project[] = [];

  form: FormGroup;
  isSubmitted = false;

  constructor(private fb: FormBuilder, private messageService: MessageService) {}

  ngOnInit(): void {
    this.initForm();
  }

  async submit(model: CreationContext, isValid: boolean): Promise<void> {
    this.isSubmitted = true;

    console.log(model, isValid);
    if (!isValid) {
      return;
    }

    try {
      const task = {
        ...model,
        projectId: model.project.id,
      };

      // await this.tasksService.updateItemInStore(task);

      // this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Project updated.' });

      // const syncedItem = await this.projectsService.syncItem(item);
      // if (syncedItem) {
      //   this.items[index] = syncedItem;
      // }
    } catch (err) {
      // this.projectsService.notifyFailedUpdate(err);
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  search(event: any): void {
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
