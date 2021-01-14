import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// App
import { CreationContext } from './task-creation.model';
import { TaskStatus } from '../tasks.model';

@Component({
  selector: 'app-task-creation',
  templateUrl: './task-creation.component.html',
  styleUrls: ['./task-creation.component.scss'],
})
export class TaskCreationComponent implements OnInit {
  form: FormGroup;
  isSubmitted = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  submit(model: CreationContext, isValid: boolean): void {
    this.isSubmitted = true;

    console.log(model, isValid);
  }

  private initForm(): void {
    this.form = this.fb.group({
      id: ['', [Validators.required]],
      taskNumber: [''],
      name: ['', [Validators.required]],
      status: [TaskStatus.Processing, [Validators.required]],
      projectId: ['', [Validators.required]],
    });
  }
}
