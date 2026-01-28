import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig,  } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes, withComponentInputBinding(), withRouterConfig({
            paramsInheritanceStrategy: 'always'//importante para herdar parámetros de url da rotas Pai em rotas filhas/children
        })), provideHttpClient()],
       
};
