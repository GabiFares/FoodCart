// Define la interfaz para el inicio de sesión de usuario
export interface UsuarioLogin {
  email: string; // Campo para el correo electrónico del usuario
  contraseña: string; // Campo para la contraseña del usuario
}

// Define la interfaz para el registro de usuario, extendiendo la interfaz UsuarioLogin
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
