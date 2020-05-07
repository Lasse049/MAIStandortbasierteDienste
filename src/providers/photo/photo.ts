import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';


import {CameraPhoto, CameraResultType, CameraSource, Capacitor, FilesystemDirectory, Plugins} from '@capacitor/core';
import {Platform} from 'ionic-angular';

const { Camera, Filesystem, Storage } = Plugins;


/*
  Generated class for the ProviderPhotoProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ProviderPhotoProvider {

  picture:any;

  public photos: Photo[] = [];

  public ueber: any;
  public lueber: any;
  //Loading Photos
  private PHOTO_STORAGE: string = "photos";

  private platform: Platform;

  constructor(
    public http: HttpClient,
    platform: Platform,
  ) {

    this.platform = platform;
    console.log('Hello ProviderPhotoProvider Provider');
  }



  public async addNewToGallery() {
    // Take a photo
    try {
      const capturedPhoto = await Camera.getPhoto({
        //resultType: CameraResultType.Uri,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality: 20,
      });

      const savedImageFile = await this.savePicture(capturedPhoto)
      //console.log('Fotopfad:' + savedImageFile);
      //this.photos.unshift(savedImageFile);

      this.lueber =  'data:image/jpeg;base64,' + savedImageFile;

      /*this.photos.unshift({
        filepath: "soon...",
        webviewPath: capturedPhoto.webPath
      });*/

      //this.picture = capturedPhoto.base64String;
    } catch (error) {
      console.error(error);
    }

    //Loading Photos
    Storage.set({
      key: this.PHOTO_STORAGE,
      value: this.platform.is('hybrid')
              ? JSON.stringify(this.photos)
              : JSON.stringify(this.photos.map(p => {
                // Don't save the base64 representation of the photo data,
                // since it's already saved on the Filesystem
                const photoCopy = { ...p };
                delete photoCopy.base64;

                return photoCopy;
            }))
    });


  }

  private async savePicture(cameraPhoto : CameraPhoto) {
      this.ueber = cameraPhoto;
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(cameraPhoto);

    //this.ueber = base64Data;

    // Write the file to the data directory
    const fileName = new Date().getTime() + '.jpeg';
    //console.log('fileName:' + fileName);
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });

    //this.ueber = savedFile.data;

    if (this.platform.is('hybrid')) {
      // Display the new image by rewriting the 'file://' path to HTTP
      // Details: https://ionicframework.com/docs/building/webview#file-protocol
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      };
    }

    else {

      // Use webPath to display the new image instead of base64 since it's
      // already loaded into memory
      return {
        filepath: fileName,
        webviewPath: cameraPhoto.webPath
      };
    }

  }

  private async readAsBase64(cameraPhoto: CameraPhoto) {

    // "hybrid" will detect Cordova or Capacitor
    if (this.platform.is('hybrid')) {
      // Read the file into base64 format
      const file = await Filesystem.readFile({
        path: cameraPhoto.path
      });

      return file.data;
    }
    else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(cameraPhoto.webPath!);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    }
  }

  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  //Loading Photos
  public async loadSaved() {
    // Retrieve cached photo array data
    const photos = await Storage.get({ key: this.PHOTO_STORAGE });
    this.photos = JSON.parse(photos.value) || [];

    if (!this.platform.is('hybrid')) {

      for (let photo of this.photos) {
        // Read each saved photo's data from the Filesystem
        const readFile = await Filesystem.readFile({
            path: photo.filepath,
            directory: FilesystemDirectory.Data
        });

        // Web platform only: Save the photo into the base64 field
        photo.base64 = `data:image/jpeg;base64,${readFile.data}`;
      }
    }
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


interface Photo {

  filepath: string;
  webviewPath: string;
  base64?: string;

}
