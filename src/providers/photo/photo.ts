import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';


import {CameraPhoto, CameraResultType, CameraSource, Capacitor, FilesystemDirectory, Plugins} from '@capacitor/core';
import {Platform} from 'ionic-angular';
import { AndroidPermissions } from '@ionic-native/android-permissions';
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

  //private platform: Platform;
  //public androidPermissions: any;

  constructor(
    public http: HttpClient,
    public platform: Platform,
    public androidPermissions: AndroidPermissions
  ) {
    if (this.platform.is('cordova')) {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
        result => console.log('Has permission?',result.hasPermission),
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
      );
      this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.CAMERA, this.androidPermissions.PERMISSION.GET_ACCOUNTS]);
      console.log("requested permission")
    } else {
      // You're testing in browser, do nothing or mock the plugins' behaviour.
      console.log("not using cordova")
    }
    this.platform = platform;
    console.log('Hello Photo Provider');
  }



  public async addNewToGallery() {
    // Take a photo
    try {
      const capturedPhoto = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        //resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality: 10,
      });

      const savedImageFile = await this.savePicture(capturedPhoto)
      //console.log('Fotopfad:' + savedImageFile);
      this.photos.unshift(savedImageFile);

      //this.lueber =  'data:image/jpeg;base64,' + savedImageFile;
      console.log("57" + this.lueber);
      /*this.photos.unshift({
        filepath: "soon...",
        webviewPath: capturedPhoto.webPath
      });*/

      //this.picture = capturedPhoto.base64String;
    } catch (error) {
      console.error(error);
    }
  }

  public async removePicturePath() {

    console.log(this.ueber)
    if (this.ueber != null){
      this.ueber = null;
      console.log(this.ueber)
    }else {
      console.log("Kein Foto aufgenommen!")
      // Hier nen Alert???
    }
  }


  private async savePicture(cameraPhoto : CameraPhoto) {
    //this.ueber = cameraPhoto;
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(cameraPhoto);

    this.ueber = base64Data;
    //this.ueber = 'data:image/jpeg;base64,' +base64Data;
    //console.log("92" + this.ueber);
    // Write the file to the data directory
    const fileName = new Date().getTime() + '.jpeg';
    //console.log('fileName:' + fileName);
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });

    this.lueber = savedFile;
    //console.log("103" + this.lueber); Objekt
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
  /*public async loadSaved() {
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
  }*/

}


interface Photo {

  filepath: string;
  webviewPath: string;
  base64?: string;

}
