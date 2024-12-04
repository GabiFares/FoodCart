import { inject, Injectable } from '@angular/core';
import { FetchService } from './fetch.service';
import { FetchMultipartService } from './fetch-multipart.service';
import { PasswordDetails, UserDetails } from '../interfaces/usuario';

@Injectable({
  providedIn: 'root',
})
export class CRUDUsuariosService {
  constructor(
    private apiService: FetchService,
    private fetchMultipartService: FetchMultipartService,
  ) {}

  async getAllUsers() {
    try {
      // Realiza una solicitud GET a la API para obtener el usuario por su ID
      const response = await this.apiService.get(`usuarios/`);
      return response; // Retorna la respuesta de la API
    } catch (error) {
      console.log(error); // Maneja errores en la consola
    }
  }

  // Método para obtener un usuario por su ID
  async getUserById(id_usuario: string) {
    try {
      const response = await this.apiService.get(
        `usuarios/_id_usuario/${id_usuario}`,
      );
      return response;
    } catch (error) {
      console.log(error);
    }
  }
  async updateUserFoto(foto: FormData, userId: string) {
    try {
      const response = await this.fetchMultipartService.put(
        `usuarios/_id_usuario/${userId}/imagen`,
        foto,
      );
      return response;
    } catch (error) {
      console.error('Error detallado:', JSON.stringify(error, null, 2));
    }
  }

  async updatePassword(passwordDetails: PasswordDetails, userId: string) {
    try {
      const response = await this.apiService.put(
        `usuarios/_id_usuario/${userId}/password`,
        JSON.stringify(passwordDetails),
      );
      return response;
    } catch (error) {
      console.error('Error detallado:', JSON.stringify(error, null, 2));
    }
  }

  async updateUserDetails(userDetails: UserDetails, userId: string) {
    try {
      const response = await this.apiService.put(
        `usuarios/_id_usuario/${userId}`,
        JSON.stringify(userDetails),
      );
      return response;
    } catch (error) {
      console.error('Error detallado:', JSON.stringify(error, null, 2));
    }
  }
}
