import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FetchMultipartService {

  readonly baseurl = 'https://localhost/backend/'; // URL base para todas las solicitudes al backend

  private getHeaders(): HeadersInit {
    if (localStorage.getItem('token')) {
      return {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      };
    }
    return { Authorization: '' };
  }

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

  constructor() { }
}
