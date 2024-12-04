import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from '../../componentes/navbar/navbar.component';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { CRUDUsuariosService } from '../../servicios/crud-usuarios.service';
@Component({
  selector: 'app-listado-usuarios',
  templateUrl: './listado-usuarios.page.html',
  standalone: true,
  imports: [NavbarComponent, NgFor],
})
export class ListadoUsuariosPage implements OnInit {
  listadeusuarios: any[] = [];
  private router: Router = inject(Router);
  private getUsers: CRUDUsuariosService = inject(CRUDUsuariosService);
  constructor() {}
  async ngOnInit() {
    this.listadeusuarios = await this.getUsers.getAllUsers();
  }
  redirectToverPedidos(id_usuario: number) {
    this.router.navigate(['historial'], {
      queryParams: { id_usuario: id_usuario },
    });
  }
}
