import { NgFor } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from '../../componentes/navbar/navbar.component';
import { ActivatedRoute, Router } from '@angular/router';
import GetPedidosService from '../../servicios/pedidos/get-pedidos.service';
import { VerPedido } from '../../interfaces/pedido';
import { AuthService } from '../../servicios/auth.service';
@Component({
  selector: 'app-historial-pedidos',
  templateUrl: './historial-pedidos.page.html',
  standalone: true,
  imports: [NgFor, NavbarComponent],
})
export class HistorialPedidosPage implements OnInit {
  constructor() {}
  historial: any[] = [];
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private getPedidos: GetPedidosService = inject(GetPedidosService);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  isAdmin: boolean = false;
  async ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    if (
      this.activatedRoute.snapshot.queryParams['id_usuario'] &&
      this.isAdmin == true
    ) {
      this.historial = await this.getPedidos.getPedidoById(
        this.activatedRoute.snapshot.queryParams['id_usuario'],
      );
      this.historial = this.historial.map(
        (pedido: VerPedido, index: number) => {
          return { ...pedido, nombre: 'Pedido ' + (index + 1) };
        },
      );
    } else {
      this.historial = await this.getPedidos.getPedidoById(
        this.authService.getUserId(),
      );
      this.historial = this.historial.map(
        (pedido: VerPedido, index: number) => {
          return { ...pedido, nombre: 'Pedido ' + (index + 1) };
        },
      );
      this.historial = this.historial.filter(
        (pedido: any) => !['PENDIENTE'].includes(pedido.estado),
      );
    }
  }
  verPedido(id_pedido: Number) {
    this.router.navigate(['pedidos/detalles'], {
      queryParams: { id_pedido: id_pedido },
    });
  }
}
