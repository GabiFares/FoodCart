import { Component, inject } from '@angular/core'; // Importa las funciones Component e inject de Angular
import { FormsModule } from '@angular/forms'; // Importa FormsModule para el manejo de formularios
import { AuthService } from '../../servicios/auth.service'; // Importa el servicio AuthService
import { Router } from '@angular/router'; // Importa Router para la navegación de rutas
import { NgClass, NgIf } from '@angular/common'; // Importa NgClass y NgIf para directivas de Angular
import { UsuarioLogin } from '../../interfaces/usuario'; // Importa la interfaz UsuarioLogin

@Component({
  selector: 'app-login', // Define el selector del componente, que se utiliza en el HTML
  standalone: true, // Indica que el componente es autónomo
  imports: [FormsModule, NgIf, NgClass], // Importa módulos y directivas necesarias
  templateUrl: './login.page.html', // Especifica la ubicación del archivo de plantilla HTML del componente
})
export class LoginPage {
  // Propiedades para almacenar los datos de inicio de sesión
  email: string = '';
  password: string = '';
  loginOkay: boolean = true;
  loginUser?: UsuarioLogin;

  // Inyecta los servicios AuthService y Router utilizando la función inject
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  // Método para manejar el envío del formulario de inicio de sesión
  async onSubmit() {
    this.loginUser = {
      email: this.email,
      contraseña: this.password,
    };
    await this.authService.login(JSON.stringify(this.loginUser));

    if (localStorage.getItem('token')) {
      this.router.navigate(['/']); // Navega a la página de inicio si el inicio de sesión es exitoso
    } else {
      this.loginOkay = false; // Cambia el estado de loginOkay a false si el inicio de sesión falla
    }
  }

  // Método para redirigir al usuario a la página de inicio de sesión de Google
  redirectToGoogle() {
    window.location.href = 'https://localhost/backend/auth/login/google';
  }

  // Método para redirigir al usuario a la página de inicio de sesión de Facebook
  redirectToFacebook() {
    window.location.href = 'https://localhost/backend/auth/login/facebook';
  }

  // Método para redirigir al usuario a la página de registro
  redirectToRegister() {
    this.router.navigate(['registro']);
  }
}
