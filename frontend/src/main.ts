import { bootstrapApplication } from '@angular/platform-browser'; // Importa la función para iniciar la aplicación
import { appConfig } from './app/app.config'; // Importa la configuración de la aplicación
import { AppComponent } from './app/app.component'; // Importa el componente principal de la aplicación
import { defineCustomElements } from '@ionic/pwa-elements/loader';

// Inicia la aplicación Angular con el componente principal y la configuración
bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
); // Maneja cualquier error que ocurra durante el inicio de la aplicación
defineCustomElements(window);

