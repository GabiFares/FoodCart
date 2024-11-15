import { NgClass, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {
  ImageCroppedEvent,
  ImageCropperComponent,
  LoadedImage,
} from 'ngx-image-cropper';
import { PostProductoService } from '../../servicios/productos/post-producto.service';
import { Router } from '@angular/router';
import { ProductoPost } from '../../interfaces/producto';

@Component({
  selector: 'app-post-producto',
  templateUrl: './post-producto.page.html',
  styleUrls: ['./post-producto.page.scss'],
  imports: [FormsModule, NgIf, NgClass, ImageCropperComponent],
  standalone: true,
})
export class PostProductoPage {
  private postProducto: PostProductoService = inject(PostProductoService);
  private router: Router = inject(Router);

  producto: ProductoPost = {
    nombre: '',
    descripcion: '',
    precio_unidad: 0,
    id_categoria: 0,
    foto: null,
  };

  imageChangedEvent: Event | null = null;
  croppedImage: SafeUrl = '';
  temporaryCroppedImage: SafeUrl = '';
  temporaryBlob: Blob | undefined | null = null;
  mostrarCropper: boolean = true;

  constructor(private sanitizer: DomSanitizer) {}

  fileChangeEvent(event: Event): void {
    this.imageChangedEvent = event;
    this.mostrarCropper = true;
  }
  imageCropped(event: ImageCroppedEvent) {
    if (event.objectUrl) {
      this.temporaryCroppedImage = this.sanitizer.bypassSecurityTrustUrl(
        event.objectUrl,
      );
    }
    this.temporaryBlob = event.blob;
  }
  imageLoaded(image: LoadedImage) {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    alert('No se pudo cargar la imágen, intente otra vez.');
  }
  onSubmit() {
    const formData = new FormData(
      document.getElementById('formPost') as HTMLFormElement,
    );
    if (this.producto.foto) {
      formData.delete('foto');
      formData.append('foto', this.producto.foto, 'imagen.png');
    }
    if (this.postProducto.postProducto(formData) != null) {
      this.router.navigate(['']);
    } else {
      alert('Hubo un error al crear su producto.');
    }
  }
  cropImage() {
    this.croppedImage = this.temporaryCroppedImage;
    this.producto.foto = this.temporaryBlob;
    this.mostrarCropper = false;
    this.temporaryCroppedImage = '';
  }
}
