import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { GetDetallePedidosService } from '../../servicios/pedidos/get-detalle-pedidos.service';
import GetPedidosService from '../../servicios/pedidos/get-pedidos.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { CRUDdireccionesService } from '../../servicios/direcciones/cruddirecciones.service';
import { Router } from '@angular/router';
import { PutPedidoService } from '../../servicios/pedidos/put-pedido.service';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'confirm-order',
  templateUrl: './confirm-order.component.html',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule],
})
export class ConfirmOrderComponent implements OnInit {
  authService: AuthService = inject(AuthService);
  getDetallePedido: GetDetallePedidosService = inject(GetDetallePedidosService);
  getPedidoService: GetPedidosService = inject(GetPedidosService);
  putPedido: PutPedidoService = inject(PutPedidoService);
  DireccionesUser: CRUDdireccionesService = inject(CRUDdireccionesService);


  router: Router = inject(Router);
  id_direccion: string = '';
  direccionSeleccionada: boolean = false;
  camposActivos: boolean = false;
  @Input() isOpen: boolean = false;
  @Input() numero: string = '';
  @Input() calle: string = '';
  @Input() apto: string = '';
  @Input() pedido: any;
  @Input() importe_total: number = 0;
  @Output() closeModal = new EventEmitter<void>();

  userId: string = this.authService.getUserId();

  direcciones = signal<any[]>([]);

  onCambiarDireccion(evento: Event) {
    this.id_direccion = (evento.target as HTMLSelectElement).value;
    this.direccionSeleccionada = true; // Bloquear inputs
    this.camposActivos = false;
  }

  onInputChange() {
    this.camposActivos = !!this.numero && !!this.calle;
    this.direccionSeleccionada = false;
  }

  async confirmarPedido() {
    this.pedido.estado = 'CONFIRMADO';
    if (this.camposActivos == false) {
      this.pedido.id_direccion = this.id_direccion;
      this.pedido.importe_total = this.importe_total;
      this.putPedido.put(
        JSON.stringify(this.pedido),
        this.pedido.id_pedido.toString(),
      );
    }
    else {
      const payload = {
        ...(this.apto ? { apto: this.apto } : {}),
        numero: this.numero, calle: this.calle
      };
      console.log(JSON.stringify(payload));
      const { id_direccion } = await this.DireccionesUser.postDireccion(JSON.stringify(payload));
      this.pedido.id_direccion = id_direccion;
      this.pedido.importe_total = this.importe_total;
      this.putPedido.put(
        JSON.stringify(this.pedido),
        this.pedido.id_pedido.toString(),
      );
    }

    this.router.navigate(['/pedidos/ver']);
    this.closeModal.emit();
  }

  close() {
    this.closeModal.emit();
  }
  async cargarDirecciones() {
    const response = await this.DireccionesUser.getDireccionesByUserID(
      this.userId,
    );
    this.direcciones.set(response.direcciones);
  }
  constructor() { }
  ngOnInit(): void {
    this.cargarDirecciones();
  }
}
