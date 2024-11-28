import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { UsuarioRegister } from '../../interfaces/usuario';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-registro-usuario',
  standalone: true,
  imports: [FormsModule, NgIf, NgClass],
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
  foto: string = ''; // Aquí almacenamos la imagen capturada
  confirmarContrasena: string = '';
  contraigual: boolean = false;
  registerUser?: UsuarioRegister;

  private authService: AuthService = inject(AuthService);
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
    this.registerUser = {
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      telefono: this.telefono,
      calle: this.calle,
      numero: this.numero,
      apto: this.apto,
      contraseña: this.password,
      repetirContraseña: this.confirmarContrasena,
      foto: this.foto, // Usamos la imagen capturada almacenada en `foto`
    };
    let response = await this.authService.registro(
      JSON.stringify(this.registerUser),
    );
    if (response != null) {
      this.router.navigate(['auth/login']);
    } else {
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

  async abrirCamara() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });

      if (image && image.base64String) {
        const imgElement = new Image();
        imgElement.src = `data:image/jpeg;base64,${image.base64String}`;

        imgElement.onload = () => {
          // Proceso de recorte usando canvas
          const canvas = document.getElementById(
            'recorteCanvas',
          ) as HTMLCanvasElement;
          const ctx = canvas.getContext('2d')!;
          const size = Math.min(imgElement.width, imgElement.height);

          canvas.width = 128;
          canvas.height = 128;

          ctx.drawImage(
            imgElement,
            (imgElement.width - size) / 2,
            (imgElement.height - size) / 2,
            size,
            size,
            0,
            0,
            canvas.width,
            canvas.height,
          );

          this.foto = canvas.toDataURL('image/png'); // Guarda el recorte como base64
        };
      }
    } catch (error) {
      console.error('Error al abrir la cámara:', error);
    }
  }
}
