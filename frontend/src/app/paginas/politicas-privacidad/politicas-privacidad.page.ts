import { Component, inject, OnInit } from '@angular/core';
import { FooterComponent } from '../../componentes/footer/footer.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-politicas-privacidad',
  templateUrl: './politicas-privacidad.page.html',
  standalone: true,
  imports: [FooterComponent],
  styleUrls: ['./politicas-privacidad.page.scss'],
})
export class PoliticasPrivacidadPage implements OnInit {
  private router: Router = inject(Router);
  constructor() {}

  ngOnInit() {}

  navegarA(ruta: string) {
    this.router.navigate([ruta]);
  }
}
