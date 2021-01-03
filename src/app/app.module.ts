// Angular
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

// App
import { CoreModule } from '@core';
import { AuthModule } from '@app/auth';
import { ShellModule } from './shell/shell.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '@env/environment';

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
