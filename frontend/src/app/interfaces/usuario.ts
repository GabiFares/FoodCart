export interface UsuarioLogin {
  email: string;
  contraseña: string;
}

export interface UsuarioRegister extends UsuarioLogin {
  nombre: string;
  apellido: string;
  telefono: string;
  calle: string;
  numero: string;
  apto: string;
  repetirContraseña: string;
  foto: Object;
}

export interface FormularioContacto {
  nombre: string;
  email: string;
  mensaje: string;
}

export interface PasswordDetails {
  contrasenaActual: string;
  password: string;
  confirmarContrasena: string;
}

export interface UserDetails {
  nombre: string;
  apellido: string;
  calle: string;
  numero: string;
  apto?: string;
  telefono: string;
  email: string;
  id_telefono: string;
  id_direccion: string;
}
