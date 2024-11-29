import { Component, HostListener, inject, OnInit } from '@angular/core';
import { GetProductosService } from '../../servicios/productos/get-productos.service';
import { NavbarComponent } from '../../componentes/navbar/navbar.component';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { RouterLink } from '@angular/router';
import { DeleteProductoService } from '../../servicios/productos/delete-producto.service';
import { Producto } from '../../interfaces/producto';
import { FooterComponent } from '../../componentes/footer/footer.component';
import { AddToCartComponent } from '../../componentes/add-to-cart/add-to-cart.component';
import { GetPedidosService } from '../../servicios/pedidos/get-pedidos.service';
import { Pedido, PedidoItem } from '../../interfaces/pedido';

@Component({
  selector: 'app-comidas',
  standalone: true,
  imports: [
    NavbarComponent,
    NgFor,
    RouterLink,
    NgIf,
    AddToCartComponent,
    FooterComponent,
  ], // Importa componentes necesarios
  templateUrl: './comidas.page.html', // Especifica la ubicación del archivo de plantilla HTML del componente
})
export class ComidasPage implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  productoSeleccionado: any = null;
  isAdmin: boolean = false;
  modalIsOpen: boolean = false;
  actualizar: boolean = false;

  constructor(
    private authService: AuthService,
    private cargarTabla: GetProductosService,
    private router: Router,
    private deleteProduct: DeleteProductoService,
    private getPedidoService: GetPedidosService,
  ) { }

  // Método que se ejecuta al inicializar el componente
  ngOnInit(): void {
    this.cargarProductos();
    this.isAdmin = this.authService.isAdmin();
  }

  // Método para cargar los productos
  cargarProductos(): void {
    this.cargarTabla.getProductosByCategoria('1').then((data) => {
      this.productos = data;
      this.productosFiltrados = data;
    });
  }

  // Método para actualizar el filtro de productos
  actualizarFiltroDeProductos(searchValue: string) {
    this.productosFiltrados = this.productos.filter((producto) =>
      producto.nombre.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }

  async agregarAlCarrito(producto: Producto) {
    this.productoSeleccionado = producto;
    console.log('este producto en comida page' + JSON.stringify(producto));
    try {
      const pedidosUsuario = await this.getPedidoService.getPedidoByIdUsuario(
        this.authService.getUserId(),
      );

      if (pedidosUsuario.length > 0) {
        const pedidoPendiente = pedidosUsuario.find(
          (pedido: Pedido) => pedido.estado === 'PENDIENTE',
        );
        console.log(
          'pedido pendiente' + JSON.stringify(pedidoPendiente, null, 2),
        );

        if (pedidoPendiente && pedidoPendiente.items) {
          const productoExistente = pedidoPendiente.items.find(
            (item: PedidoItem) => item.id_producto === producto.id_producto,
          );

          console.log(
            'producto existente ' + JSON.stringify(productoExistente),
          );
          if (productoExistente) {
            // Pasa los datos del producto existente al modal
            console.log('llega al true');
            this.modalIsOpen = true;
            this.productoSeleccionado = {
              ...producto,
              cantidad: productoExistente.cantidad,
              nota: productoExistente.indicaciones,
            };
            this.actualizar = true;
            return;
          }
        }
      }
      this.defaultAddToCart(producto);
    } catch (error) {
      console.error('Error al verificar el carrito:', error);
    }
  }

  defaultAddToCart(producto: Producto) {
    this.modalIsOpen = true;
    this.actualizar = false;
    this.productoSeleccionado = { ...producto, cantidad: 1, nota: '' };
  }

  // Método para cerrar el modal
  closeModal() {
    this.productoSeleccionado = null;
    this.modalIsOpen = false;
  }

  // Método para ver los detalles de un producto
  onDetalles(idProducto: string) {
    this.router.navigate(['producto/detalles/'], {
      queryParams: { id: idProducto },
    });
  }

  // Método para confirmar la eliminación de un producto
  confirmarEliminacion(productoId: string): void {
    const confirmacion = window.confirm(
      '¿Estás seguro de que deseas eliminar este producto?',
    );
    if (confirmacion) {
      this.eliminarProducto(productoId);
    }
  }

  // Método para eliminar un producto
  async eliminarProducto(productoId: string): Promise<void> {
    try {
      await this.deleteProduct.deleteProducto(productoId);
      this.cargarProductos();
    } catch (error) {
      console.error('Error eliminando el producto:', error);
    }
  }

  // Método para navegar a la página de creación de productos
  onCreate() {
    this.router.navigate(['productos/ingresar']);
  }
}
