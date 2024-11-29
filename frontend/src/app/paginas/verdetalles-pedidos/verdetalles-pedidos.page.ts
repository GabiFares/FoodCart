import { Component, inject, OnInit, signal } from '@angular/core'; // Importa las funciones Component, inject y OnInit de Angular
import { NavbarComponent } from '../../componentes/navbar/navbar.component'; // Importa el componente NavbarComponent
import { ActivatedRoute, Router } from '@angular/router'; // Importa ActivatedRoute y Router para la navegación de rutas
import { GetDetallePedidosService } from '../../servicios/pedidos/get-detalle-pedidos.service'; // Importa el servicio GetDetallePedidosService
import { GetProductosService } from '../../servicios/productos/get-productos.service'; // Importa el servicio GetProductosService
import { CommonModule, JsonPipe, NgFor } from '@angular/common'; // Importa CommonModule y NgFor para directivas de Angular
import { MapaPedidosComponent } from '../../componentes/mapa-pedidos/mapa-pedidos.component';
import { CRUDdireccionesService } from '../../servicios/direcciones/cruddirecciones.service';
import { AuthService } from '../../servicios/auth.service';
import { PutPedidoService } from '../../servicios/pedidos/put-pedido.service';
import GetPedidosService from '../../servicios/pedidos/get-pedidos.service';

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
  private getDireccionID: CRUDdireccionesService = inject(CRUDdireccionesService);
  private getPedidoService: GetPedidosService = inject(GetPedidosService);


  // Inicializa las propiedades para almacenar los detalles de los pedidos y productos
  detalle_pedidos: any[] = [];
  productos: any[] = [];
  address = signal<string>('');
  repartidor = signal<boolean>(false);
  putPedido: PutPedidoService = inject(PutPedidoService);
  constructor() { }

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

      let direccion = await this.getDireccionID.getDireccionesByID(this.activatedRoute.snapshot.queryParams['id_direccion']);
      this.address.set(`${direccion.calle} ${direccion.numero}`);
      this.repartidor.set(this.repartidorCheck.isRepartidor());

    } else {
      // Navega a la ruta de inicio si no hay un ID de pedido en los parámetros de la ruta
      this.router.navigate(['']);
    }
  }
  async entregarPedido() {
    const pedido = await this.getPedidoService.getPedidoById(this.activatedRoute.snapshot.queryParams['id_pedido']);
    const estado = "ENTREGADO"
    pedido.estado = estado;
    pedido.id_direccion = this.activatedRoute.snapshot.queryParams['id_direccion']
    this.putPedido.put(JSON.stringify(pedido), pedido.id_pedido);
    this.router.navigate(['pedidos/ver']);
  }
}
