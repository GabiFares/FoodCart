import { Component, inject, OnInit, signal } from '@angular/core'; // Importa las funciones Component, inject y OnInit de Angular
import { NavbarComponent } from '../../componentes/navbar/navbar.component'; // Importa el componente NavbarComponent
import { ActivatedRoute, Router } from '@angular/router'; // Importa ActivatedRoute y Router para la navegación de rutas
import { GetDetallePedidosService } from '../../servicios/pedidos/get-detalle-pedidos.service'; // Importa el servicio GetDetallePedidosService
import { GetProductosService } from '../../servicios/productos/get-productos.service'; // Importa el servicio GetProductosService
import { CommonModule, JsonPipe, NgFor } from '@angular/common'; // Importa CommonModule y NgFor para directivas de Angular
import { MapaPedidosComponent } from '../../componentes/mapa-pedidos/mapa-pedidos.component';
import { CRUDdireccionesService } from '../../servicios/direcciones/cruddirecciones.service';
import { AuthService } from '../../servicios/auth.service';
import { Pedido } from '../../interfaces/pedido';
import GetPedidosService from '../../servicios/pedidos/get-pedidos.service';
import { PostPedidosService } from '../../servicios/pedidos/post-pedidos.service';
import { PostDetallePedidoService } from '../../servicios/pedidos/post-detalle-pedido.service';
import { CarritoService } from '../../servicios/carrito-service.service';
import { PutDetallePedidoService } from '../../servicios/pedidos/put-detalle-pedido.service';

@Component({
  selector: 'app-verdetalles-pedidos', // Define el selector del componente, que se utiliza en el HTML
  templateUrl: './verdetalles-pedidos.page.html', // Especifica la ubicación del archivo de plantilla HTML del componente
  standalone: true, // Indica que el componente es autónomo
  imports: [MapaPedidosComponent, NavbarComponent, NgFor, CommonModule], // Importa componentes y directivas necesarias
})
export class VerdetallesPedidosPage implements OnInit {
  // Inyecta los servicios y rutas necesarias utilizando la función inject
  private cargarProducto: GetProductosService = inject(GetProductosService);
  private repartidorCheck: AuthService = inject(AuthService);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  getDetalle_Pedido: GetDetallePedidosService = inject(
    GetDetallePedidosService,
  );
  private getDireccionID: CRUDdireccionesService = inject(
    CRUDdireccionesService,
  );
  private getPedidoService: GetPedidosService = inject(GetPedidosService);
  private Auth: AuthService = inject(AuthService);
  private postPedidoService: PostPedidosService = inject(PostPedidosService);
  private postDetallePedido: PostDetallePedidoService = inject(
    PostDetallePedidoService,
  );
  private carritoService: CarritoService = inject(CarritoService);
  private putDetallePedido: PutDetallePedidoService = inject(
    PutDetallePedidoService,
  );

  // Inicializa las propiedades para almacenar los detalles de los pedidos y productos
  detalle_pedidos: any[] = [];
  productos: any[] = [];
  address = signal<string>('');
  repartidor = signal<boolean>(false);
  direccion = signal<boolean>(false);
  constructor() {}

  // Método para obtener el nombre del producto por su ID
  getProducto(id_producto: string) {
    const producto = this.productos.find(
      (producto) => producto.id_producto == id_producto,
    );
    return producto.nombre;
  }

  // Método que se ejecuta al inicializar el componente
  async ngOnInit() {
    // Verifica si hay un ID de pedido en los parámetros de la ruta
    if (this.activatedRoute.snapshot.queryParams['id_pedido']) {
      // Obtiene los detalles del pedido por su ID
      this.detalle_pedidos = await this.getDetalle_Pedido.getDetallePedidoByID(
        this.activatedRoute.snapshot.queryParams['id_pedido'],
      );
      // Mapea los detalles del pedido para obtener los productos correspondientes
      const productoslista = this.detalle_pedidos.map((detalle) =>
        this.cargarProducto.getProductoById(detalle.id_producto),
      );
      // Espera a que se resuelvan todas las promesas de productos
      this.productos = await Promise.all(productoslista);
      if (this.activatedRoute.snapshot.queryParams['id_direccion']) {
        let direccion = await this.getDireccionID.getDireccionesByID(
          this.activatedRoute.snapshot.queryParams['id_direccion'],
        );
        this.address.set(`${direccion.calle} ${direccion.numero}`);
        this.repartidor.set(this.repartidorCheck.isRepartidor());
        this.direccion.set(true);
      }
    } else {
      // Navega a la ruta de inicio si no hay un ID de pedido en los parámetros de la ruta
      this.router.navigate(['']);
    }
  }

  async RepetirPedido() {
    let detallePedido = this.detalle_pedidos[0];
    try {
      const pedidosUsuario = await this.getPedidoService.getPedidoById(
        this.Auth.getUserId(),
      );

      if (pedidosUsuario.length > 0) {
        const pedidoPendiente = pedidosUsuario.find(
          (pedido: Pedido) => pedido.estado === 'PENDIENTE',
        );

        if (pedidoPendiente) {
          for (let detalle_pedido of this.detalle_pedidos) {
            detalle_pedido.id_pedido = pedidoPendiente.id_pedido;
            const productoExistente = pedidoPendiente.items.find(
              (producto: any) =>
                producto.id_producto === detalle_pedido.id_producto,
            );
            if (productoExistente) {
              this.putDT(detallePedido);
              return;
            }
            this.postDT(detallePedido);
            return;
          }
        }
      }
      this.postPedido();
    } catch (error) {
      console.log(error);
    }
  }

  async postPedido() {
    let cantidad = 0;
    const pedido = {
      estado: 'PENDIENTE',
      importe_total: 0,
      id_local: 1,
      id_direccion: 1,
      id_usuario: parseInt(this.Auth.getUserId()),
    };

    const respuesta = await this.postPedidoService.postPedido(
      JSON.stringify(pedido),
    );

    for (let detalle_pedido of this.detalle_pedidos) {
      detalle_pedido.id_pedido = respuesta.id_pedido;
      cantidad += detalle_pedido.cantidad;
      await this.postDetallePedido.postDetallePedido(
        JSON.stringify(detalle_pedido),
      );
    }
    this.carritoService.cartCount.set(cantidad);
  }

  async postDT(detallePedido: any) {
    await this.postDetallePedido.postDetallePedido(
      JSON.stringify(detallePedido),
    );

    const detalleActualizado =
      await this.getDetalle_Pedido.getDetallePedidoByID(
        detallePedido.id_pedido,
      );

    const totalItems = detalleActualizado.reduce(
      (total: number, item: any) => total + item.cantidad,
      0,
    );
    this.carritoService.cartCount.set(totalItems);
  }

  async putDT(detallePedido: any) {
    console.log(JSON.stringify(detallePedido));
    await this.putDetallePedido.putDT(
      JSON.stringify(detallePedido),
      detallePedido.id_pedido,
      detallePedido.id_producto,
    );

    const detalleActualizado =
      await this.getDetalle_Pedido.getDetallePedidoByID(
        detallePedido.id_pedido,
      );
    console.log();
    const totalItems = detalleActualizado.reduce(
      (total: number, item: any) => total + item.cantidad,
      0,
    );
    console.log(totalItems);
    this.carritoService.cartCount.set(totalItems);
  }
}
