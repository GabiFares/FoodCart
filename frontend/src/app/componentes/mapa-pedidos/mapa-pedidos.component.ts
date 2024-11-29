import { Component, effect, Input, OnChanges, OnDestroy, OnInit, signal, SimpleChanges } from '@angular/core';
import Map from 'ol/Map'; // Clase principal de mapas en OpenLayers
import View from 'ol/View'; // Para definir la vista del mapa
import TileLayer from 'ol/layer/Tile'; // Para usar capas de mapas base
import OSM from 'ol/source/OSM'; // Fuente de mapas OpenStreetMap
import { Feature } from 'ol'; // Para crear características en el mapa
import { Point } from 'ol/geom'; // Geometría de puntos
import VectorSource from 'ol/source/Vector'; // Fuente de capas vectoriales
import VectorLayer from 'ol/layer/Vector'; // Capa para las ubicaciones
import { fromLonLat } from 'ol/proj'; // Para convertir coordenadas
import { Icon, Style } from 'ol/style';
import { WebSocketSubject } from 'rxjs/webSocket';

@Component({
  selector: 'app-mapa-pedidos',
  standalone: true,
  templateUrl: './mapa-pedidos.component.html',
  styleUrls: ['./mapa-pedidos.component.css'],
})
export class MapaPedidosComponent implements OnInit, OnDestroy {
  @Input() address = signal<string>('');
  @Input() repartidorBoolean = signal<boolean>(false);

  repartidor!: Feature;
  mapa!: Map; // Variable para almacenar el mapa
  vectorSource = new VectorSource();
  private socket: WebSocketSubject<any>;


  constructor() {
    // Si hay un cambio en las signal entonces se va a ejecutar el effect.
    effect(() => {
      this.addAddressMarker();
      if (this.repartidorBoolean()) {
        this.addMarkerRepatirdor()
      }
      else {
        this.escucharPosicionRepartidor();
      }
    });
    this.socket = new WebSocketSubject('wss://localhost/backend/websocket');
  }
  ngOnDestroy(): void {
    this.socket.unsubscribe();
  }
  ngOnInit(): void {
    // Inicializar el mapa al cargar el componente
    this.inicializarMapa();


  }

  inicializarMapa() {
    // Crear características para cada ubicación
    // Capa vectorial
    const vectorLayer = new VectorLayer({
      source: this.vectorSource,
    });

    // Configuración del mapa
    this.mapa = new Map({
      target: 'mapaPedidos', // ID del contenedor en el HTML
      layers: [
        new TileLayer({
          source: new OSM(), // Mapa base de OpenStreetMap
        }),
        vectorLayer, // Capa de ubicaciones
      ],
      view: new View({
        center: fromLonLat([-57.95325964113459, -31.390312485072155]), // Coordenadas de Salto
        zoom: 15, // Nivel de zoom inicial
      }),
    });
  }

  addAddressMarker(): void {
    if (!this.address) {
      return;
    }

    // País y codigo postal hardcodeados para más precision
    const country = 'Uruguay';
    const postalCode = '50000';
    const query = `${this.address()}, ${postalCode}, ${country}`;

    // FETCH a nominatim para obtener latitud y longitud
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.length === 0) {
          alert('Dirección no encontrada.');
          return;
        }
        // Obtener latitud y longitud del primer resultado
        const { lat, lon } = data[0];
        const coordinates = fromLonLat([parseFloat(lon), parseFloat(lat)]);

        // Crear marcador para el mapa
        this.addMarker(coordinates);

        // Centrar y acercar el mapa a la ubicación
        this.mapa.getView().setCenter(coordinates);
        this.mapa.getView().setZoom(15);
      })
      .catch((err) => {
        console.error('Error al geocodificar:', err);
        alert('Error al buscar la dirección.');
      });
  }

  addMarker(coordinates: any): void {
    // Crear un nuevo marcador
    const marker = new Feature({
      geometry: new Point(coordinates),
    });

    // Estilo del marcador
    marker.setStyle(
      new Style({
        image: new Icon({
          src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Icono del marcador
          scale: 0.05, // Tamaño del icono
        }),
      })
    );

    // Agregar marcador a la capa de la fuente vectorial
    this.vectorSource.addFeature(marker);
  }
  addMarkerRepatirdor(): void {
    console.log("Soy repartidor");
    navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Si ya hay una Feature(Punto) entonces lo borra y crea uno nuevo.
        if (this.repartidor) {
          this.vectorSource.removeFeature(this.repartidor);
        }

        // Posición del repartidor con la data nueva
        this.repartidor = new Feature({
          geometry: new Point(fromLonLat([longitude, latitude])),
        });

        // Como se va a ver el punto
        this.repartidor.setStyle(
          new Style({
            image: new Icon({
              src: 'https://cdn-icons-png.freepik.com/256/5457/5457799.png',
              scale: 0.05,
            }),
          })
        );
        this.socket.next({
          type: 'positionChanged',
          data: { lat: latitude, lon: longitude },
        });
        // Pone el punto
        this.vectorSource.addFeature(this.repartidor);
      },
      // Si la geolocation por alguna razón no funca tiramos este error en consola.
      (error) => console.error('Error al obtener ubicación del repartidor:', error),
      { enableHighAccuracy: true } // Config de precision.
    );
  }

  escucharPosicionRepartidor(): void {
    this.socket.subscribe((message) => {
      try {
        if (message.type === 'repartidorPosition') {
          const { lat, lon } = message.data;

          if (this.repartidor) {
            this.vectorSource.removeFeature(this.repartidor);
          }

          this.repartidor = new Feature({
            geometry: new Point(fromLonLat([lon, lat])),
          });

          this.repartidor.setStyle(
            new Style({
              image: new Icon({
                src: 'https://cdn-icons-png.freepik.com/256/5457/5457799.png',
                scale: 0.05,
              }),
            })
          );

          this.vectorSource.addFeature(this.repartidor);
        }
      } catch (error) {
        console.log(error);
      }

    });
  }
}



