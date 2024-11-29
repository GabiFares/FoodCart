import { NgIf } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'; // Importa DomSanitizer y SafeUrl para manejo seguro de URLs
import {
  ImageCroppedEvent,
  ImageCropperComponent,
  LoadedImage,
} from 'ngx-image-cropper';

@Component({
  selector: 'app-img-cropper',
  standalone: true,
  imports: [ImageCropperComponent, NgIf],
  templateUrl: './img-cropper.component.html',
})
export class ImgCropperComponent implements OnInit {
  constructor(private sanitizer: DomSanitizer) {}
  @Input() mostrarPopup: boolean = false;
  @Output() closePopup = new EventEmitter<void>();
  @Output() fotoOutput: EventEmitter<Blob> = new EventEmitter<Blob>();
  foto: Blob | undefined | null;
  imageChangedEvent: Event | null = null;
  croppedImage: SafeUrl = '';
  temporaryCroppedImage: SafeUrl = '';
  temporaryBlob: Blob | undefined | null = null;
  mostrarCropper: boolean = true;

  // Método para manejar el cambio de archivo
  fileChangeEvent(event: Event): void {
    this.imageChangedEvent = event;
    this.mostrarCropper = true;
  }

  // Método para manejar el recorte de la imagen
  imageCropped(event: ImageCroppedEvent) {
    if (event.objectUrl) {
      this.temporaryCroppedImage = this.sanitizer.bypassSecurityTrustUrl(
        event.objectUrl,
      );
    }
    this.temporaryBlob = event.blob;
  }

  // Método para manejar la carga de la imagen
  imageLoaded(image: LoadedImage) {
    // mostrar el cropper
  }

  // Método para manejar cuando el cropper esté listo
  cropperReady() {
    // cropper listo
  }

  // Método para manejar cuando la carga de la imagen falla
  loadImageFailed() {
    alert('No se pudo cargar la imágen, intente otra vez.');
  }

  // Método para aplicar el recorte a la imagen
  cropImage() {
    this.croppedImage = this.temporaryCroppedImage;
    this.foto = this.temporaryBlob;
    this.mostrarCropper = false;
    this.temporaryCroppedImage = '';
    this.fotoOutput.emit(this.foto!);
    this.cerrar();
  }

  emitirImagen(blob: Blob): void {
    this.fotoOutput.emit(blob);
  }

  cerrar() {
    this.mostrarPopup = false;
    this.closePopup.emit();
  }

  ngOnInit() {}
}
