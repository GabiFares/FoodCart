import { NgClass, NgIf } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../servicios/auth.service';
import GetPedidosService from '../../servicios/pedidos/get-pedidos.service';
import { PostPedidosService } from '../../servicios/pedidos/post-pedidos.service';
import { PostDetallePedidoService } from '../../servicios/pedidos/post-detalle-pedido.service';
import { CarritoService } from '../../servicios/carrito-service.service';
import { GetDetallePedidosService } from '../../servicios/pedidos/get-detalle-pedidos.service';
import { Pedido } from '../../interfaces/pedido';
import { PutDetallePedidoService } from '../../servicios/pedidos/put-detalle-pedido.service';

@Component({
  selector: 'add-to-cart',
  standalone: true,
  imports: [NgIf, FormsModule, NgClass],
  templateUrl: './add-to-cart.component.html',
})
export class AddToCartComponent {
  private carritoService: CarritoService = inject(CarritoService);
  private authService: AuthService = inject(AuthService);
  private getDetallePedido: GetDetallePedidosService = inject(
    GetDetallePedidosService,
  );
  private getPedidoService: GetPedidosService = inject(GetPedidosService);
  private postPedidoService: PostPedidosService = inject(PostPedidosService);
  private postDetallePedido: PostDetallePedidoService = inject(
    PostDetallePedidoService,
  );
  private putDetallePedido: PutDetallePedidoService = inject(
    PutDetallePedidoService,
  );

  @Input() product: any;
  @Input() isOpen: boolean = false;
  @Input() showNote: boolean = true;
  @Input() actualizar: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  userId: string = this.authService.getUserId();
  quantity: number = 1;
  note: string = '';
  id_pedido: number = 0;
  excesoIndicaciones: boolean = false;

  // Método para aumentar la cantidad del producto
  increaseQuantity() {
    this.quantity++;
  }

  // Método para disminuir la cantidad del producto
  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product) {
      // cada vez que cambie product, se actualiza lo siguiente
      this.quantity = this.product.cantidad || 1;
      this.note = this.product.nota || '';
    }
  }

  // Método asincrónico para agregar el producto al carrito
  async addToCart() {
    let detallePedido = {
      cantidad: this.quantity,
      indicaciones: this.note,
      id_pedido: this.id_pedido,
      id_producto: this.product.id_producto,
    };

    try {
      const pedidosUsuario = await this.getPedidoService.getPedidoByIdUsuario(
        this.userId,
      );

      if (pedidosUsuario.length > 0) {
        const pedidoPendiente = pedidosUsuario.find(
          (pedido: Pedido) => pedido.estado === 'PENDIENTE',
        );

        console.log(
          'Pedido pendiente' + JSON.stringify(pedidoPendiente, null, 2),
        );

        if (pedidoPendiente) {
          detallePedido.id_pedido = pedidoPendiente.id_pedido;

          const productoExistente = pedidoPendiente.items.find(
            (producto: any) =>
              producto.id_producto === detallePedido.id_producto,
          );
          console.log('productoExistente' + JSON.stringify(productoExistente));
          if (productoExistente) {
            console.log('llego al put');
            this.putDT(detallePedido);
            this.closeModal.emit();
            return;
          }
          console.log('llego al post');
          this.postDT(detallePedido);
          this.closeModal.emit();
          return;
        }
      }
      this.postPedido(detallePedido);
    } catch (error) {
      console.log(error);
    }
    this.closeModal.emit(); // Emite el evento de cierre del modal
  }

  async postDT(detallePedido: any) {
    const detalle = await this.postDetallePedido.postDetallePedido(
      JSON.stringify(detallePedido),
    );

    const detalleActualizado = await this.getDetallePedido.getDetallePedidoByID(
      detallePedido.id_pedido,
    );

    const totalItems = detalleActualizado.reduce(
      (total: number, item: any) => total + item.cantidad,
      0,
    );
    this.carritoService.cartCount.set(totalItems);
  }

  async putDT(detallePedido: any) {
    const detalle = await this.putDetallePedido.putDT(
      JSON.stringify(detallePedido),
      detallePedido.id_pedido,
      detallePedido.id_producto,
    );

    const detalleActualizado = await this.getDetallePedido.getDetallePedidoByID(
      detallePedido.id_pedido,
    );

    const totalItems = detalleActualizado.reduce(
      (total: number, item: any) => total + item.cantidad,
      0,
    );
    this.carritoService.cartCount.set(totalItems);
  }

  async postPedido(detallePedido: any) {
    const pedido = {
      estado: 'PENDIENTE',
      importe_total: 0,
      id_local: 1,
      id_direccion: 1,
      id_usuario: parseInt(this.userId),
    };

    const respuesta = await this.postPedidoService.postPedido(
      JSON.stringify(pedido),
    );

    detallePedido.id_pedido = respuesta.id_pedido;
    const detalle = await this.postDetallePedido.postDetallePedido(
      JSON.stringify(detallePedido),
    );

    this.carritoService.cartCount.set(detallePedido.cantidad);
  }

  validarIndicaciones() {
    this.excesoIndicaciones = this.note.length > 200;
  }
  close() {
    this.closeModal.emit();
    this.quantity = 1;
    this.note = '';
    this.product = null;
  }
}
