import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../componentes/navbar/navbar.component';
import { RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../servicios/auth.service';
import { CRUDUsuariosService } from '../../servicios/crud-usuarios.service';
import { ImgCropperComponent } from '../../componentes/img-cropper/img-cropper.component';

@Component({
  selector: 'editar-perfil',
  standalone: true,
  imports: [
    NavbarComponent,
    RouterLink,
    FormsModule,
    NgClass,
    NgIf,
    ImgCropperComponent,
  ],
  templateUrl: './editar-perfil.page.html',
})
export class EditarPerfilPage implements OnInit {
  usuario = {
    id: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    calle: '',
    numero: '',
    apto: '',
    id_direccion: '',
    id_telefono: '',
  };

  usuarioPassword = {
    contrasenaActual: '',
    password: '',
    confirmarContrasena: '',
    contraigual: false,
  };

  mostrarPopup = false;
  foto: Blob | undefined | null;
  formUserUpdateSuccess: boolean = false;
  formPasswordPutSuccess: boolean = false;
  formPasswordPutFailed: boolean = false;

  constructor(
    private authService: AuthService,
    private crudUsuarios: CRUDUsuariosService,
  ) {}

  async ngOnInit() {
    this.cargarDatosUsuario();
  }

  async cargarDatosUsuario() {
    if (this.authService.isValidUser()) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const idToken = JSON.parse(atob(token.split('.')[1]));
          this.usuario.id = idToken.id;
          const usuarioGet = await this.crudUsuarios.getUserById(
            this.usuario.id,
          );
          this.usuario.nombre = usuarioGet.nombre;
          this.usuario.apellido = usuarioGet.apellido;
          this.usuario.email = usuarioGet.email;
          this.usuario.id_telefono = usuarioGet.id_telefono;
          this.usuario.telefono = usuarioGet.numerotel;
          this.usuario.id_direccion = usuarioGet.id_direccion;
          this.usuario.calle = usuarioGet.calle;
          this.usuario.numero = usuarioGet.numero;
          this.usuario.apto = usuarioGet.apto ? usuarioGet.apto : '---';
        }
      } catch (error) {
        console.error('Error extrayendo los datos del usuario:', error);
      }
    }
  }
  confirmUserDetailsChanges(formUserPut: NgForm): void {
    const confirmacion = window.confirm(
      '¿Estás seguro de que deseas modificar tus datos?',
    );
    if (confirmacion) {
      this.editProfile(formUserPut);
    }
  }

  async editProfile(formUserPut: NgForm) {
    try {
      const resultado = await this.crudUsuarios.updateUserDetails(
        this.usuario,
        this.usuario.id,
      );
      console.log(JSON.stringify(resultado, null, 2));
    } catch (error) {
      console.error('Error editando el perfil:', error);
    }
    this.formUserUpdateSuccess = true;
    setTimeout(() => {
      this.formUserUpdateSuccess = false;
    }, 5000);
    formUserPut.reset();
    this.cargarDatosUsuario();
  }

  confirmUserPasswordChanges(formPasswordPut: NgForm): void {
    const confirmacion = window.confirm(
      '¿Estás seguro de que deseas modificar su contraseña?',
    );
    if (confirmacion) {
      this.editPassword(formPasswordPut);
    }
  }

  checkInput() {
    if (
      this.usuarioPassword.confirmarContrasena == this.usuarioPassword.password
    ) {
      this.usuarioPassword.contraigual = true;
    } else {
      this.usuarioPassword.contraigual = false;
    }
  }

  async editPassword(formPasswordPut: NgForm) {
    try {
      await this.crudUsuarios.updatePassword(
        this.usuarioPassword,
        this.usuario.id,
      );
      this.formPasswordPutSuccess = true;
      setTimeout(() => {
        this.formPasswordPutSuccess = false;
      }, 5000);
      formPasswordPut.reset();
    } catch (error) {
      console.error('Error modificando la contraseña:', error);
      this.formPasswordPutFailed = true;
      setTimeout(() => {
        this.formPasswordPutFailed = false;
      }, 5000);
    }
  }

  abrirCropper() {
    this.mostrarPopup = true;
  }

  handleCroppedImage(blob: Blob) {
    this.foto = blob;
    this.editFoto();
  }

  async editFoto() {
    try {
      const formData = new FormData(
        document.getElementById('formPost') as HTMLFormElement,
      );
      if (this.foto) {
        formData.delete('foto');
        formData.append('foto', this.foto, 'imagen.png');
        const resultado = await this.crudUsuarios.updateUserFoto(
          formData,
          this.usuario.id,
        );
        console.log(resultado);
      }
    } catch (error) {
      console.error('Error cambiando la foto:', error);
    }
  }
}
