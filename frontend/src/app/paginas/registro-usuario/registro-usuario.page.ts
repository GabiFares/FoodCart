import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { Camera, CameraResultType } from '@capacitor/camera';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { SafeUrl } from '@angular/platform-browser';
import { FetchMultipartService } from '../../servicios/fetch-multipart.service';

@Component({
  selector: 'app-registro-usuario',
  standalone: true,
  imports: [FormsModule, NgIf, NgClass, ImageCropperComponent],
  templateUrl: './registro-usuario.page.html',
})
export class RegistroUsuarioPage implements OnInit {
  nombre: string = '';
  apellido: string = '';
  email: string = '';
  telefono: string = '';
  calle: string = '';
  numero: string = '';
  apto: string = '';
  password: string = '';
  foto: string = ''; // Aquí almacenamos la imagen recortada como base64
  confirmarContrasena: string = '';
  contraigual: boolean = false;
  imageChangedEvent: any = '';
  croppedImage: SafeUrl = '';
  mostrarCropper: boolean = false;

  private fetchMultipartService: FetchMultipartService = inject(
    FetchMultipartService,
  );
  private router: Router = inject(Router);

  ngOnInit(): void {
    const queryString = window.location.search;
    if (queryString != null) {
      const UrlParams = new URLSearchParams(queryString);
      this.nombre = UrlParams.get('given_name') ?? '';
      this.apellido = UrlParams.get('family_name') ?? '';
      this.email = UrlParams.get('email') ?? '';
    }
  }

  async onSubmit() {
    const formData = new FormData();
    formData.append('nombre', this.nombre);
    formData.append('apellido', this.apellido);
    formData.append('email', this.email);
    formData.append('telefono', this.telefono);
    formData.append('calle', this.calle);
    formData.append('numero', this.numero);
    formData.append('apto', this.apto);
    formData.append('contraseña', this.password);
    formData.append('repetirContraseña', this.confirmarContrasena);

    if (this.foto) {
      const blob = this.dataURItoBlob(this.foto);
      formData.append('foto', blob, 'foto_usuario.png');
    }

    try {
      await this.fetchMultipartService.post<any>('usuarios/', formData);
      this.router.navigate(['auth/login']);
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      alert(
        'Hubo un error al intentar registrarlo, por favor pruebe con otros datos.',
      );
    }
  }

  checkInput() {
    this.contraigual = this.confirmarContrasena === this.password;
  }

  redirectToLogin() {
    this.router.navigate(['auth/login']);
  }

  public async tomarFoto() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
    });

    // Validar formato base64
    if (image.dataUrl?.startsWith('data:image')) {
      console.log('Foto capturada:', image.dataUrl);
      this.imageChangedEvent = image.dataUrl; // Asignar al cropper
      this.mostrarCropper = true;
    } else {
      console.error('Error: Formato de imagen no válido.');
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    console.log('Evento imageCropped recibido:', event);

    if (event.base64) {
      this.croppedImage = event.base64;
    } else if (event.blob) {
      this.convertBlobToBase64(event.blob).then((base64) => {
        this.croppedImage = base64;
      });
    } else {
      console.error(
        'Error: El evento imageCropped no devolvió base64 ni blob.',
      );
    }
  }

  // Función para convertir Blob a Base64
  convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string); // Devuelve la imagen en formato base64
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(blob); // Convierte el blob a base64
    });
  }

  cropImage() {
    if (this.croppedImage) {
      this.foto = this.croppedImage as string;
      console.log('Imagen recortada asignada correctamente:', this.foto);
      this.mostrarCropper = false;
    } else {
      console.error('Error: No hay imagen recortada para asignar.');
    }
  }

  onCropperReady() {
    console.log('Cropper listo para usar.');
  }

  onLoadImageFailed(event: any) {
    console.error('Error al cargar la imagen en el cropper:', event);
  }

  dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/png' });
  }
}
