import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';

import { defineCustomElements } from '@ionic/pwa-elements/loader';

platformBrowserDynamic().bootstrapModule(AppModule);

defineCustomElements(window);
