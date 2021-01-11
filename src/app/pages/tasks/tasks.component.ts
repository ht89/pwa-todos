import { Component, OnInit } from '@angular/core';

// App
import { Task } from './tasks.model';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
})
export class TasksComponent implements OnInit {
  items: Task[] = [];
  rowGroupMetadata: { [projectId: string]: { index: number; size: number } } = {};

  constructor() {}

  ngOnInit(): void {}

  onAddBtnClick(): void {}
}
