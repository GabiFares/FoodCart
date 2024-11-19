import { Component, OnInit, inject } from '@angular/core';
import { CarritoService } from '../../servicios/carrito-service.service';
import { AuthService } from '../../servicios/auth.service';
import { NavbarComponent } from '../../componentes/navbar/navbar.component';
import { NgFor, NgIf } from '@angular/common';
import { FooterComponent } from '../../componentes/footer/footer.component';
import { GetDetallePedidosService } from '../../servicios/pedidos/get-detalle-pedidos.service';
import GetPedidosService from '../../servicios/pedidos/get-pedidos.service';
import { GetProductosService } from '../../servicios/productos/get-productos.service';
import { Router, RouterModule } from '@angular/router';
import { PutPedidoService } from '../../servicios/pedidos/put-pedido.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [NavbarComponent, NgFor, NgIf, RouterModule],
  templateUrl: './carrito.page.html',
})
export class CarritoPage implements OnInit {
  private detallePedidoService: GetDetallePedidosService = inject(
    GetDetallePedidosService,
  );
  private getUserService: AuthService = inject(AuthService);
  private pedidoUsuario: GetPedidosService = inject(GetPedidosService);
  private cargarProducto: GetProductosService = inject(GetProductosService);
  private carritoService: CarritoService = inject(CarritoService);
  private router: Router = inject(Router);
  private putPedido: PutPedidoService = inject(PutPedidoService);

  userId: number = this.getUserService.getUserId();
  subTotal: number[] = [];
  id_pedido: number = 0;
  productosPedido: any[] = [];
  productos: any[] = [];
  pedidoaConfirmar: any;

  constructor() {}

  ngOnInit() {
    this.cargarProductosDelCarrito();
  }

  async cargarProductosDelCarrito() {
    try {
      const pedidosUsuario = await this.pedidoUsuario.getPedidoById(
        this.userId.toString(),
      );

      if (!pedidosUsuario) {
        this.resetearEstadoCarrito();
        return;
      }

      const pedidoPendiente = pedidosUsuario.filter(
        (pedido: any) => pedido.estado === 'PENDIENTE',
      );

      if (pedidoPendiente.length === 0) {
        this.resetearEstadoCarrito();
        return;
      }

      this.id_pedido = pedidoPendiente[0].id_pedido;

      const productosPedido =
        await this.detallePedidoService.getDetallePedidoByID(
          this.id_pedido.toString(),
        );

      if (!productosPedido) {
        this.resetearEstadoCarrito();
        return;
      }

      const productosLista = productosPedido.map(
        async (detalle: { id_producto: string; cantidad: number }) => {
          const producto = await this.cargarProducto.getProductoById(
            detalle.id_producto,
          );
          return {
            ...producto,
            cantidad: detalle.cantidad,
          };
        },
      );

      this.productos = await Promise.all(productosLista);
    } catch (error) {
      console.error('Error general al cargar el carrito:', error);
      this.resetearEstadoCarrito();
      throw error;
    }
  }

  private resetearEstadoCarrito() {
    this.productos = [];
    this.id_pedido = 0;
    this.pedidoaConfirmar = null;
  }

  decreaseQuantity(producto: any): void {
    if (producto.cantidad > 1) {
      producto.cantidad--;
    }
  }

  increaseQuantity(producto: any): void {
    producto.cantidad++;
  }

  getCantidad(id_producto: string) {
    const producto = this.productosPedido.find(
      (producto) => producto.id_producto == id_producto,
    );
    return producto.cantidad;
  }

  getTotal(): number {
    return this.productos.reduce((total, producto) => {
      return total + producto.precio_unidad * producto.cantidad;
    }, 0);
  }

  onDetalles(idProducto: string) {
    this.router.navigate(['producto/detalles/'], {
      queryParams: { id: idProducto },
    });
  }

  confirmarEliminacion(id_producto: string): void {
    const confirmacion = window.confirm(
      '¿Estás seguro de que deseas eliminar este producto del carrito?',
    );
    if (confirmacion) {
      this.eliminarDetallePedido(id_producto);
    }
  }

  async eliminarDetallePedido(id_producto: string): Promise<void> {
    try {
      await this.carritoService.eliminarDetallePedido(
        this.id_pedido.toString(),
        id_producto,
      );
    } catch (error) {
      console.error('Error eliminando el producto:', error);
    }
    this.carritoService.decrementCart();
    await this.cargarProductosDelCarrito();
  }

  onConfirmar() {
    this.pedidoaConfirmar.estado = 'CONFIRMADO';
    this.pedidoaConfirmar.importe_total = this.getTotal();
    this.putPedido.put(
      JSON.stringify(this.pedidoaConfirmar),
      this.id_pedido.toString(),
    );
    this.router.navigate(['/pedidos/ver']);
  }
}
