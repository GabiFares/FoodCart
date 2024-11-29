import { Injectable } from '@angular/core';

// Decorador Injectable para permitir que este servicio sea inyectable en otros componentes o servicios
@Injectable({
  providedIn: 'root', // Provee el servicio en el nivel raíz de la aplicación, haciéndolo disponible en todas partes
})
export class FetchMultipartService {
  readonly baseurl = 'https://localhost/backend/'; // URL base para todas las solicitudes al backend

  // Función privada para obtener los encabezados de las solicitudes HTTP
  private getHeaders(): HeadersInit {
    if (localStorage.getItem('token')) {
      return {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Agrega el token de autorización si existe en el almacenamiento local
      };
    }
    return { Authorization: '' }; // Retorna un encabezado vacío si no existe un token
  }

  // Método POST para enviar datos multipart/form-data al backend
  async post<T = any>(url: string, body: FormData): Promise<T> {
    console.log(body);
    try {
      const response = await fetch(`${this.baseurl}${url}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: body,
      });
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json(); // Si el contenido es JSON, parsear el JSON
      } else {
        data = await response.text(); // Si el contenido es texto, obtener el texto
      }
      if (response.ok) {
        return data;
      } else if (response.status == 401) {
        throw new Error('Usuario no verificado.'); // Lanzar error si el usuario no está autorizado
      } else {
        throw new Error(data);
      }
    } catch (error) {
      throw error; // Lanzar error en caso de fallo en la solicitud
    }
  }

  // Método PUT para actualizar datos multipart/form-data en el backend
  async put<T = any>(url: string, body: FormData): Promise<T> {
    console.log(body);
    try {
      const response = await fetch(`${this.baseurl}${url}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: body,
      });
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json(); // Si el contenido es JSON, parsear el JSON
      } else {
        data = await response.text(); // Si el contenido es texto, obtener el texto
      }
      if (response.ok) {
        return data;
      } else if (response.status == 401) {
        throw new Error('Usuario no verificado.'); // Lanzar error si el usuario no está autorizado
      } else {
        throw new Error(data);
      }
    } catch (error) {
      throw error; // Lanzar error en caso de fallo en la solicitud
    }
  }

  // Método GET para obtener datos del backend
  async get<T = any>(url: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseurl}${url}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json(); // Si el contenido es JSON, parsear el JSON
      } else {
        data = await response.text(); // Si el contenido es texto, obtener el texto
      }
      if (response.ok) {
        return data;
      } else if (response.status == 401) {
        throw new Error('Usuario no verificado'); // Lanzar error si el usuario no está autorizado
      } else {
        throw new Error(data);
      }
    } catch (error) {
      throw error; // Lanzar error en caso de fallo en la solicitud
    }
  }

  // Método DELETE para eliminar datos del backend
  async delete<T = any>(url: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseurl}${url}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json(); // Si el contenido es JSON, parsear el JSON
      } else {
        data = await response.text(); // Si el contenido es texto, obtener el texto
      }
      if (response.ok) {
        return data;
      } else if (response.status == 401) {
        throw new Error('Usuario no verificado.'); // Lanzar error si el usuario no está autorizado
      } else {
        throw new Error(data);
      }
    } catch (error) {
      throw error; // Lanzar error en caso de fallo en la solicitud
    }
  }

  constructor() { } // Constructor vacío, puede ser utilizado para inicializar el servicio si es necesario
}
