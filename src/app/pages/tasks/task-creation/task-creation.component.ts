import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// App
import { Task, TaskStatus } from '../tasks.model';
import { Project } from '@app/pages/projects/projects.model';
import { StoreName } from '@app/@shared';
import { AppService } from '@app/app.service';

// Firebase
import { createDocumentRef } from '@app/auth/firebase/common.js';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-task-creation',
  templateUrl: './task-creation.component.html',
  styleUrls: ['./task-creation.component.scss'],
})
export class TaskCreationComponent implements OnInit {
  @Input() item: Task;
  @Input() projects: Project[] = [];
  @Input() appService: AppService;

  @Output() createTask = new EventEmitter<Task>();
  @Output() updateTask = new EventEmitter<Task>();
  @Output() hideDialog = new EventEmitter<void>();

  displayedProjects: Project[] = [];

  form: FormGroup;
  isSubmitted = false;

  constructor(private fb: FormBuilder, private messageService: MessageService) {
    this.initForm();
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.item && this.item) {
      this.form.patchValue(this.item);
    }
  }

  async submit(model: Task, isValid: boolean): Promise<void> {
    this.isSubmitted = true;

    if (!isValid) {
      return;
    }

    try {
      await this.appService.updateItemInStore(model, StoreName.Tasks);
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Task updated.' });

      if (this.item) {
        this.updateTask.emit(model);
      } else {
        this.createTask.emit(model);
      }

      this.hideDialog.emit();

      const syncedItem = await this.appService.syncItem(model, StoreName.Tasks);
      if (syncedItem) {
        this.updateTask.emit(syncedItem);
      }
    } catch (err) {
      this.appService.notifyFailedUpdate(err);
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

  onProjectSelect(project: Project): void {
    if (!project) {
      return;
    }

    this.form.controls.projectId.setValue(project.id);
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
