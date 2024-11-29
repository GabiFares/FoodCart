import { inject, Injectable } from '@angular/core';
import { FetchService } from '../fetch.service';

@Injectable({
  providedIn: 'root'
})
export class CRUDdireccionesService {
  private apiService: FetchService = inject(FetchService);

  async getDireccionesByUserID(id_usuario: string) {
    try {
      const response = await this.apiService.get(
        `usuarios/direcciones/lista/${id_usuario}`,
      );
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getDireccionesByID(id_direccion: string) {
    try {
      const response = await this.apiService.get(
        `usuarios/direcciones/${id_direccion}`,
      );
      return response;
    } catch (error) {
      console.log(error);
    }
  }
  async postDireccion(body: string) {
    try {
      const response = await this.apiService.post(
        `usuarios/direcciones/`, body
      );
      return response;
    } catch (error) {
      console.log(error);
    }
  }
  constructor() { }
}
