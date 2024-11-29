import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  HostListener,
} from '@angular/core';
import { SearchComponent } from '../search/search.component';
import { AuthService } from '../../servicios/auth.service';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { CRUDUsuariosService } from '../../servicios/crud-usuarios.service';
import GetPedidosService from '../../servicios/pedidos/get-pedidos.service';
import { CarritoService } from '../../servicios/carrito-service.service';
import { Pedido } from '../../interfaces/pedido';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, SearchComponent, NgIf, CommonModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {
  usuario = {
    nombre: '',
    foto: 'assets/default-user.png',
  };

  isDropdownOpen = false;

  @Input() withSearch: boolean = true;
  @Output() searchValueChange = new EventEmitter<string>();

  constructor(
    private authservice: AuthService,
    private crudUsuarios: CRUDUsuariosService,
    private router: Router,
    public carritoService: CarritoService,
    private getPedido: GetPedidosService,
  ) { }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const dropdownElement = (event.target as HTMLElement).closest('.relative');
    if (!dropdownElement) {
      this.isDropdownOpen = false;
    }
  }

  async ngOnInit() {
    if (this.authservice.isValidUser()) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const idToken = JSON.parse(atob(token.split('.')[1]));
          const usuarioGet = await this.crudUsuarios.getUserById(idToken.id);
          this.usuario.nombre = `${usuarioGet.nombre}`;
          if (usuarioGet.foto == true) {
            this.usuario.foto = `https://192.168.1.11/backend/Resources/${usuarioGet.email}.jpg`;
          } else {
            this.usuario.foto = 'assets/user.png';
          }

          const pedidosUsuario = await this.getPedido.getPedidoByIdUsuario(idToken.id);

          if (pedidosUsuario.length > 0) {
            const pedidoPendiente = pedidosUsuario.find(
              (pedido: Pedido) => pedido.estado === 'PENDIENTE',
            );

            if (pedidoPendiente) {
              const totalItems = pedidoPendiente.items.reduce(
                (total: number, item: any) => total + item.cantidad,
                0,
              );
              this.carritoService.cartCount.set(totalItems);
            }
          }
        }
      } catch (error) {
        console.error('Error extrayendo los datos del usuario:', error);
      }
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['']);
    this.isDropdownOpen = false;
  }

  onSearchValue(value: string) {
    this.searchValueChange.emit(value);
  }
}
