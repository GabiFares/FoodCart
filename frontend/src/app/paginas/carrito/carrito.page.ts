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
import { Producto } from '../../interfaces/producto';
import { Pedido } from '../../interfaces/pedido';
import { AddToCartComponent } from '../../componentes/add-to-cart/add-to-cart.component';
import { CartoDB } from 'ol/source';
import { ConfirmOrderComponent } from '../../componentes/confirm-order/confirm-order.component';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [
    NavbarComponent,
    NgFor,
    NgIf,
    AddToCartComponent,
    RouterModule,
    ConfirmOrderComponent,
  ],
  templateUrl: './carrito.page.html',
})
export class CarritoPage implements OnInit {
  userId: number = 0;
  modalIsOpen: boolean = false;
  subTotal: number[] = [];
  id_pedido: number = 0;
  importe_total: number = 0;
  productosPedido: any[] = [];
  productos: any[] = [];
  pedidoaConfirmar: any;
  modalIsOpendir: boolean = false;
  actualizar: boolean = false;
  productoSeleccionado: any = null;
  numero: string = '';
  calle: string = '';
  apto: string = '';
  constructor(
    private detallePedidoService: GetDetallePedidosService,
    private getUserService: AuthService,
    private pedidoUsuario: GetPedidosService,
    private cargarProducto: GetProductosService,
    private carritoService: CarritoService,
    private router: Router,
    private putPedido: PutPedidoService,
  ) { }

  // Método que se ejecuta al inicializar el componente
  ngOnInit() {
    this.userId = this.getUserService.getUserId();
    this.cargarProductosDelCarrito();
  }

  // Método para cargar los productos del carrito
  async cargarProductosDelCarrito() {
    try {
      const pedidoUsuario = await this.pedidoUsuario.getPedidoByIdUsuario(
        this.userId.toString(),
      );

      if (pedidoUsuario.length > 0) {
        const pedidoPendiente = pedidoUsuario.find(
          (pedido: Pedido) => pedido.estado === 'PENDIENTE',
        );

        if (pedidoPendiente && pedidoPendiente.items) {
          this.id_pedido = pedidoPendiente.id_pedido;
          this.productos = pedidoPendiente.items.map((item: any) => ({
            id_producto: item.id_producto,
            nombre: item.producto,
            cantidad: item.cantidad,
            precio_unidad: item.precio_unidad,
            indicaciones: item.indicaciones,
          }));
          this.pedidoaConfirmar = pedidoPendiente;
          return;
        }
      }
      this.resetearEstadoCarrito();
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
      this.resetearEstadoCarrito();
    }
  }

  async editarProducto(producto: any) {
    this.productoSeleccionado = producto;
    this.modalIsOpen = true;
    this.productoSeleccionado = {
      ...producto,
      cantidad: producto.cantidad,
      nota: producto.indicaciones,
    };
    this.actualizar = true;
  }

  private resetearEstadoCarrito() {
    this.productos = [];
    this.id_pedido = 0;
    this.pedidoaConfirmar = null;
  }

  closeModal() {
    this.productoSeleccionado = null;
    this.modalIsOpen = false;
  }

  // Método para calcular el total del carrito
  getTotal(): number {
    return this.productos.reduce((total, producto) => {
      return total + producto.precio_unidad * producto.cantidad;
    }, 0);
  }

  // Método para ver los detalles de un producto
  onDetalles(idProducto: string) {
    this.router.navigate(['producto/detalles/'], {
      queryParams: { id: idProducto },
    });
  }

  // Método para confirmar la eliminación de un producto del carrito
  confirmarEliminacion(id_producto: string, cantidad: number): void {
    const confirmacion = window.confirm(
      '¿Estás seguro de que deseas eliminar este producto del carrito?',
    );
    if (confirmacion) {
      this.eliminarDetallePedido(id_producto, cantidad);
    }
  }

  // Método para eliminar un producto del carrito
  async eliminarDetallePedido(
    id_producto: string,
    cantidad: number,
  ): Promise<void> {
    try {
      await this.carritoService.eliminarDetallePedido(
        this.id_pedido.toString(),
        id_producto,
      );
    } catch (error) {
      console.error('Error eliminando el producto:', error);
    }

    const cartActualizado = this.carritoService.cartCount() - cantidad;
    this.carritoService.cartCount.set(cartActualizado);
    await this.cargarProductosDelCarrito();
  }
  // Método para confirmar el pedido

  onConfirmar() {
    this.importe_total = this.getTotal();
    this.modalIsOpendir = true;
  }

  closeModalDir() {
    this.modalIsOpendir = false;
  }
  // onConfirmar() {
  //   this.pedidoaConfirmar.estado = 'CONFIRMADO';
  //   this.pedidoaConfirmar.importe_total = this.getTotal();
  //   this.putPedido.put(
  //     JSON.stringify(this.pedidoaConfirmar),
  //     this.id_pedido.toString(),
  //   );
  //   this.router.navigate(['/pedidos/ver']);
  // }
}
