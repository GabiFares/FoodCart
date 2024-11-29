import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto'

@Component({
  selector: 'app-grafica',
  templateUrl: './grafica.page.html',
  styleUrls: ['./grafica.page.scss'],
  standalone: true,
  imports: []
})
export class GraficaPage implements OnInit {

  constructor() { }


  async CrearGrafica() {
    const ctx = document.getElementById('acquisitions') as HTMLCanvasElement | null;
    if (ctx) {
      const data = [
        { year: 2010, count: 10 },
        { year: 2011, count: 20 },
        { year: 2012, count: 15 },
        { year: 2013, count: 25 },
        { year: 2014, count: 22 },
        { year: 2015, count: 30 },
        { year: 2016, count: 28 },
      ];

      new Chart(
        ctx,
        {
          type: 'scatter',
          data: {
            labels: data.map(row => row.year),
            datasets: [
              {
                label: 'Acquisitions by year',
                data: data.map(row => row.count)
              }
            ]
          },
          options:
          {
            scales: {
              x: {
                type: 'linear',
                position: 'bottom'
              }
            }
          }
        }
      );
    }
    else {
      console.error('El elemento con id "acquisitions" no se encontró.');
    }


  };
  ngOnInit() {
    this.CrearGrafica()
  }

}
