export interface UsuarioLogin {
  email: string;
  contraseña: string;
}

export interface UsuarioRegister extends UsuarioLogin {
  nombre: string; // Campo para el nombre del usuario
  apellido: string; // Campo para el apellido del usuario
  telefono: string; // Campo para el número de teléfono del usuario
  calle: string; // Campo para la calle del usuario
  numero: string; // Campo para el número de la calle del usuario
  apto: string; // Campo para el apartamento del usuario
  repetirContraseña: string; // Campo para repetir la contraseña del usuario
  foto?: string; // Campo para la foto del usuario
}

// Define la interfaz para el reinicio de contraseña del usuario
export interface ResetPassword {
  currentPassword: string; // Campo para la contraseña actual del usuario
  newPassword: string; // Campo para la nueva contraseña del usuario
  confirmPassword: string; // Campo para confirmar la nueva contraseña del usuario

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
