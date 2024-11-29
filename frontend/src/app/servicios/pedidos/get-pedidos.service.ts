import { inject, Injectable } from '@angular/core'; // Importa las funciones inject e Injectable de Angular
import { FetchService } from '../fetch.service'; // Importa el servicio FetchService

// Decorador Injectable para permitir que este servicio sea inyectable en otros componentes o servicios
@Injectable({
  providedIn: 'root', // Provee el servicio en el nivel raíz de la aplicación, haciéndolo disponible en todas partes
})
export class GetPedidosService {
  // Inyecta el servicio FetchService utilizando la función inject
  private apiService: FetchService = inject(FetchService);

  // Método para obtener un pedido por ID de usuario
  async getPedidoByIdUsuario(id_usuario: string) {
    try {
      // Realiza una solicitud GET a la API para obtener los pedidos por ID de usuario
      const response = await this.apiService.get(
        `pedidos/usuario/${id_usuario}`,
      );
      return response; // Retorna la respuesta de la API
    } catch (error) {
      console.log(error); // Maneja errores en la consola
      return []; // Retorna un array vacío en caso de error
    }
  }

  // Método para obtener todos los pedidos
  async getAllPedidos() {
    try {
      // Realiza una solicitud GET a la API para obtener todos los pedidos
      const response = await this.apiService.get(`pedidos/`);
      return response; // Retorna la respuesta de la API
    } catch (error) {
      console.log(error); // Maneja errores en la consola
      return []; // Retorna un array vacío en caso de error
    }
  }

  async getPedidoById(id_pedido: string) {
    try {
      // Realiza una solicitud GET a la API para obtener los pedidos por ID 
      const response = await this.apiService.get(
        `pedidos/${id_pedido}`,
      );
      return response; // Retorna la respuesta de la API
    } catch (error) {
      console.log(error); // Maneja errores en la consola
      return []; // Retorna un array vacío en caso de error
    }
  }
  // Constructor del servicio
  constructor() { }
}

export default GetPedidosService;
