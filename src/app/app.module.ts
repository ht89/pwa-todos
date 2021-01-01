// Angular
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

// App
import { CoreModule, dbConfig } from '@core';
import { AuthModule } from '@app/auth';
import { ShellModule } from './shell/shell.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '@env/environment';

// Firebase
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';

// IndexedDB
import { NgxIndexedDBModule } from 'ngx-indexed-db';

// SW
import { ServiceWorkerModule } from '@angular/service-worker';

// Primeng
import { MessageService } from 'primeng/api';

@NgModule({
  imports: [
    // Angular
    BrowserModule,
    BrowserAnimationsModule,
    // App
    CoreModule,
    ShellModule,
    AuthModule,
    // Firebase
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    // IndexedDB
    NgxIndexedDBModule.forRoot(dbConfig),
    // SW
    ServiceWorkerModule.register('../service-worker.js', { enabled: environment.production }),
    // App Routes
    AppRoutingModule, // must be imported as the last module as it contains the fallback route
  ],
  declarations: [AppComponent],
  providers: [MessageService],
  bootstrap: [AppComponent],
})
export class AppModule {}
