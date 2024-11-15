import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Importa Router
import { FooterComponent } from '../../componentes/footer/footer.component';
import { MapComponent } from '../../componentes/mapa/mapa.component';

@Component({
  selector: 'inicio',
  standalone: true,
  imports: [FooterComponent, MapComponent],
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.css'],
})
export class InicioPage implements OnInit {
  private router: Router = inject(Router);

  ngOnInit(): void {
    // Cualquier lógica de inicialización, si es necesaria
  }

  navegarA(ruta: string) {
    this.router.navigate([ruta]);
  }
}
