import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';



import { Plugins, CameraResultType, Capacitor, FilesystemDirectory,
  CameraPhoto, CameraSource } from '@capacitor/core';

const { Camera, Filesystem, Storage } = Plugins;



/*
  Generated class for the ProviderPhotoProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ProviderPhotoProvider {

  constructor(public http: HttpClient) {
    console.log('Hello ProviderPhotoProvider Provider');
  }



  public async addNewToGallery() {
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

  }




}
