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

  /**
   *
   *
   *    Falls das so wie oben nicht geht kannst dus sonst mal so versuchen
   *
   *
   *
       import { Camera, CameraOptions } from '@ionic-native/camera';

       constructor
       private camera: Camera;

        const options: CameraOptions = {
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            saveToPhotoAlbum: true,
            quality: x
          }
          this.camera.getPicture(options).then((imageData) => {
            var x = 'data:image/jpeg;base64,' + imageData;
            this.sendToServer(x);
          }, (err) => {
      });
   *
   *
   */


}
