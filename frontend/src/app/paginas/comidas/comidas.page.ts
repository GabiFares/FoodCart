import { Component, inject } from '@angular/core';
import { GetProductosService } from '../../servicios/get-productos.service';
import { NavbarComponent } from '../../componentes/navbar/navbar.component';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-comidas',
  standalone: true,
  imports: [NavbarComponent, NgFor, NgIf],
  templateUrl: './comidas.page.html',
  styleUrl: './comidas.page.css',
})
export class ComidasPage {
  productos: any[] = [];
  productosFiltrados: any[] = [];
  private cargarTabla: GetProductosService = inject(GetProductosService);
  private router: Router = inject(Router);
  isAdmin: boolean = false;
  private authService: AuthService = inject(AuthService);

  ngOnInit(): void {
    this.cargarTabla.getProductosByCategoria('1').then((data) => {
      console.log(data);
      this.productos = data;
      this.productosFiltrados = data;
      this.isAdmin = this.authService.isAdmin();
    });
  }

  actualizarFiltroDeProductos(searchValue: string) {
    this.productosFiltrados = this.productos.filter((producto) =>
      producto.nombre.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }
  onDetalles(idProducto: string) {
    this.router.navigate(['producto/detalles/'], { queryParams: { id: idProducto } })
  }
}
