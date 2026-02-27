
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';

import { AppComponent } from './src/app.component';
import { APP_ROUTES } from './src/app.routes';
import { authInterceptor } from './src/app/core/auth/auth.interceptor';
import { errorInterceptor } from './src/app/core/interceptors/error.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(APP_ROUTES, withHashLocation()),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
}).catch((err) => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.