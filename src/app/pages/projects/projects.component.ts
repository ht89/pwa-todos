import { Component, OnDestroy, OnInit } from '@angular/core';
import { Project } from './projects.model';
import { openDatabase, openObjectStore } from '../../../indexedDB/store.js';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { untilDestroyed } from '@app/@core';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent implements OnInit, OnDestroy {
  data: Project[] = [];

  constructor(private afs: AngularFirestore) {}

  async ngOnInit() {
    this.data = await this.getData();
  }

  ngOnDestroy() {}

  private async getData(indexName: string = '', indexValue: string = ''): Promise<Project[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await openDatabase();
        const objectStore = openObjectStore(db, 'projects');
        let cursor;
        const data: Project[] = [];

        if (indexName && indexValue) {
          cursor = objectStore.index(indexName).openCursor(indexValue);
        } else {
          cursor = objectStore.openCursor();
        }

        cursor.onsuccess = (event: any) => {
          const currentCursor = event.target.result;

          if (currentCursor) {
            data.push(currentCursor.value);
            currentCursor.continue();
          } else {
            if (data.length > 0) {
              resolve(data);
            } else {
              this.getDataFromServer()
                .pipe(untilDestroyed(this))
                .subscribe((serverData: Project[]) => {
                  const readwriteStore = openObjectStore(db, 'projects', 'readwrite');

                  serverData.forEach((item: Project) => {
                    readwriteStore.add(item);
                  });

                  resolve(serverData);
                });
            }
          }
        };
      } catch (err) {
        this.getDataFromServer()
          .pipe(untilDestroyed(this))
          .subscribe((data) => resolve(data));
      }
    });
  }

  private getDataFromServer(): Observable<Project[]> {
    return this.afs.collection<Project>('projects').valueChanges();
  }
}
