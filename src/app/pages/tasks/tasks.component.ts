import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

// App
import { Task } from './tasks.model';
import { PublishSubscribeService } from '@app/@core';
import { PubSubChannel } from '@app/@shared';
import { TasksService } from './tasks.service';

// Primeng
import { Table } from 'primeng/table';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
})
export class TasksComponent implements OnInit {
  items: Task[] = [];
  rowGroupMetadata: { [projectId: string]: { index: number; size: number } } = {};
  @ViewChild('pt') table: Table;

  subscriptions: Subscription[] = [];

  constructor(private tasksService: TasksService, private pubSubService: PublishSubscribeService<string>) {}

  async ngOnInit(): Promise<void> {
    this.subscribeToSearch();

    this.items = await this.tasksService.getItems();
    // this.syncItems();
  }

  onAddBtnClick(): void {}

  private subscribeToSearch() {
    this.subscriptions.push(
      this.pubSubService.subscribe(PubSubChannel.Search, (query) => {
        if (query === undefined || query === null) {
          return;
        }

        this.table.filterGlobal(query, 'contains');
      }),
    );
  }
}
