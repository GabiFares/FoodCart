import { inject, Injectable } from '@angular/core'; // Importa las funciones inject e Injectable de Angular
import { FetchService } from './fetch.service'; // Importa el servicio FetchService
import { FetchMultipartService } from './fetch-multipart.service';

// Decorador Injectable para permitir que este servicio sea inyectable en otros componentes o servicios
@Injectable({
  providedIn: 'root', // Provee el servicio en el nivel raíz de la aplicación, haciéndolo disponible en todas partes
})
export class AuthService {
  // Inyecta el servicio FetchService utilizando la función inject
  private apiService: FetchService = inject(FetchService);

  // Método para realizar el login del usuario
  async login(body: string) {
    try {
      // Realiza una solicitud POST a la API para el login
      const response = await this.apiService.post('auth/login', body);
      // Guarda el token en el almacenamiento local
      localStorage.setItem('token', response.token);
    } catch (error) {
      console.log(error); // Maneja errores en la consola
    }
  }

  // Método para registrar un nuevo usuario
  async registro(formData: FormData): Promise<any> {
    try {
      // Realiza una solicitud POST a la API para el registro
      const response = await this.fetchMultipartService.post(
        'usuarios/',
        formData,
      );
      return response; // Retorna la respuesta de la API
    } catch (error) {
      console.log(error); // Maneja errores en la consola
    }
  }

  // Método para restablecer la contraseña del usuario
  async resetPassword(body: string): Promise<void> {
    try {
      // Realiza una solicitud POST a la API para restablecer la contraseña
      const response = await this.apiService.post(
        'reestablecer-contraseña/', // A cambiar cuando esté la ruta del backend
        body,
      );
      return response; // Retorna la respuesta de la API
    } catch (error) {
      console.log(error); // Maneja errores en la consola
      throw error; // Lanza el error para ser manejado por el llamador
    }
  }

  // Método para verificar si el usuario es válido (si el token existe en el almacenamiento local)
  isValidUser(): boolean {
    return !!localStorage.getItem('token');
  }

  // Método para verificar si el usuario es administrador
  isAdmin(): boolean {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Decodifica el token y verifica si el usuario es administrador
        const admin = JSON.parse(atob(token.split('.')[1]));
        return admin.isAdmin === true;
      }
      return false;
    } catch (error) {
      console.log(error); // Maneja errores en la consola
      return false;
    }
  }

  isRepartidor(): boolean {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Decodifica el token y verifica si el usuario es administrador
        const repartidor = JSON.parse(atob(token.split('.')[1]));
        return repartidor.isRepartidor === true;
      }
      return false;
    } catch (error) {
      console.log(error); // Maneja errores en la consola
      return false;
    }
  }

  // Método para obtener el ID del usuario desde el token
  getUserId() {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Decodifica el token y retorna el ID del usuario
        const user = JSON.parse(atob(token.split('.')[1]));
        return user.id;
      }
      return undefined;
    } catch (error) {
      console.log(error); // Maneja errores en la consola
      return undefined;
    }
  }

  // Constructor del servicio
  constructor(private fetchMultipartService: FetchMultipartService) {}
}
