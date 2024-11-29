import { Routes } from '@angular/router'; // Importa las interfaces y servicios de enrutamiento de Angular
import { LoginPage } from './paginas/login/login.page'; // Importa la página de login
import { RegistroUsuarioPage } from './paginas/registro-usuario/registro-usuario.page'; // Importa la página de registro de usuario
import { InicioPage } from './paginas/inicio/inicio.page'; // Importa la página de inicio
import { BebidasPage } from './paginas/bebidas/bebidas.page'; // Importa la página de bebidas
import { ComidasPage } from './paginas/comidas/comidas.page'; // Importa la página de comidas
import { PostProductoPage } from './paginas/post-producto/post-producto.page'; // Importa la página para ingresar productos
import { CarritoPage } from './paginas/carrito/carrito.page'; // Importa la página del carrito
import { checkTokenGuard } from './guardia/check-token.guard'; // Importa el guard que verifica el token de autenticación
import { checkAdminGuard } from './guardia/check-admin.guard'; // Importa el guard que verifica si el usuario es administrador
import { VerDetallesPage } from './paginas/ver-detalles/ver-detalles.page'; // Importa la página para ver detalles del producto
import { EditarProductoPages } from './paginas/editar-producto/editar-producto.pages'; // Importa la página para editar productos
import { VerPedidosPage } from './paginas/ver-pedidos/ver-pedidos.page'; // Importa la página para ver los pedidos
import { RestablecerContrasenaPage } from './paginas/reestablecer-contrasena/reestablecer-contrasena.page'; // Importa la página para restablecer la contraseña
import { VerdetallesPedidosPage } from './paginas/verdetalles-pedidos/verdetalles-pedidos.page'; // Importa la página para ver detalles de los pedidos
import { PoliticasPrivacidadPage } from './paginas/politicas-privacidad/politicas-privacidad.page'; // Importa la página de políticas de privacidad
import { TerminosServicioPage } from './paginas/terminos-servicio/terminos-servicio.page'; // Importa la página de términos y condiciones
import { EditarPerfilPage } from './paginas/editar-perfil/editar-perfil.page';
import { ContactoPage } from './paginas/contacto/contacto.page'; // Importa la página de contacto
import { acompañamientosPage } from './paginas/acompanamientos/acompanamientos.page';

export const routes: Routes = [
  {
    path: 'auth/login', // Ruta para la página de login
    component: LoginPage,
    title: 'Login', // Título de la página
  },
  {
    path: 'registro', // Ruta para la página de registro de usuario
    component: RegistroUsuarioPage,
    title: 'Registro', // Título de la página
  },
  {
    path: '', // Ruta para la página de inicio
    component: InicioPage,
    title: 'Inicio', // Título de la página
    canActivate: [checkTokenGuard], // Guard para verificar si el usuario está autenticado
  },
  {
    path: 'bebidas', // Ruta para la página de bebidas
    component: BebidasPage,
    title: 'Bebidas', // Título de la página
    canActivate: [checkTokenGuard], // Guard para verificar si el usuario está autenticado
  },
  {
    path: 'comidas', // Ruta para la página de comidas
    component: ComidasPage,
    title: 'Comidas', // Título de la página
    canActivate: [checkTokenGuard], // Guard para verificar si el usuario está autenticado
  },
  {
    path: 'acompanamientos', // Ruta para la página de comidas
    component: acompañamientosPage,
    title: 'Acompañamientos', // Título de la página
    canActivate: [checkTokenGuard], // Guard para verificar si el usuario está autenticado
  },
  {
    path: 'productos/ingresar', // Ruta para la página de ingreso de productos
    component: PostProductoPage,
    title: 'Ingresar Producto', // Título de la página
    canActivate: [checkAdminGuard], // Guard para verificar si el usuario es administrador
  },
  {
    path: 'carrito', // Ruta para la página del carrito
    component: CarritoPage,
    title: 'Carrito de Compras', // Título de la página
    canActivate: [checkTokenGuard], // Guard para verificar si el usuario está autenticado
  },
  {
    path: 'producto/detalles', // Ruta para la página de detalles del producto
    component: VerDetallesPage,
    title: 'Detalles Producto', // Título de la página
    canActivate: [checkTokenGuard], // Guard para verificar si el usuario está autenticado
  },
  {
    path: 'productos/editar/:id', // Ruta para la página de edición de productos
    component: EditarProductoPages,
    title: 'Editar Producto', // Título de la página
    canActivate: [checkAdminGuard], // Guard para verificar si el usuario es administrador
  },
  {
    path: 'pedidos/ver', // Ruta para la página de visualización de pedidos
    component: VerPedidosPage,
    title: 'Ver pedidos', // Título de la página
    canActivate: [checkTokenGuard], // Guard para verificar si el usuario está autenticado
  },
  {
    path: 'restablecer-contrasena', // Ruta para la página de restablecimiento de contraseña
    component: RestablecerContrasenaPage,
    title: 'Restablecer Contraseña', // Título de la página
  },
  {
    path: 'pedidos/detalles', // Ruta para la página de detalles de pedidos
    component: VerdetallesPedidosPage,
    title: 'Ver detalles pedidos', // Título de la página
    canActivate: [checkTokenGuard], // Guard para verificar si el usuario está autenticado
  },
  {
    path: 'politicas-privacidad', // Ruta para la página de políticas de privacidad
    component: PoliticasPrivacidadPage,
    title: 'Políticas de Privacidad', // Título de la página
    canActivate: [checkTokenGuard],
  },
  {
    path: 'terminos-servicio', // Ruta para la página de términos y condiciones
    component: TerminosServicioPage,
    title: 'Términos y Condiciones', // Título de la página
    canActivate: [checkTokenGuard],
  },
  {
    path: 'editarPerfil', // Ruta para la página de detalles de pedidos
    component: EditarPerfilPage,
    title: 'Editar perfil', // Título de la página
    canActivate: [checkTokenGuard], // Guard para verificar si el usuario está autenticado
  },
  {
    path: 'contacto', // Ruta para la página de contacto
    component: ContactoPage,
    title: 'Contacto', // Título de la página
    canActivate: [checkAdminGuard], // Guard para verificar si el usuario está autenticado
  },
];
