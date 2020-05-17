import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';


import {CameraPhoto, CameraResultType, CameraSource, Capacitor, FilesystemDirectory, Plugins} from '@capacitor/core';
import {Platform} from 'ionic-angular';
import { AndroidPermissions } from '@ionic-native/android-permissions';
const { Camera, Filesystem } = Plugins;

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

  //private platform: Platform;
  //public androidPermissions: any;

  /***
   * Constructor
   * Permissions for android to use the camera
   */
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


  /***
   * try to take a picture
   * Call the method savePicture
   */
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

      console.log("57" + this.lueber);

    } catch (error) {
      console.error(error);
    }
  }

  /***
   * Reset the variable for transferring
   * the Picture/ Picturepath
   * when the picture was send
   * or the picture has been deleted
   * or when the reporting of trash
   * has been canceled
   */
  public async removePicturePath() {

    console.log(this.ueber)
    if (this.ueber != null){
      this.ueber = null;
      console.log(this.ueber)
    }else {
      console.log("Kein Foto aufgenommen!")
    }
  }

  /***
   * Save the Picture
   * call methods readAsBase64, getTime and writeFile
   * transfer picture for sending to the database
   *
   * return the picture depending on the platform
   *
   * @param cameraPhoto
   */
  private async savePicture(cameraPhoto : CameraPhoto) {
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(cameraPhoto);

    this.ueber = base64Data;
    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });

    this.lueber = savedFile;
    if (this.platform.is('hybrid')) {
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

  /***
   * Converts the picture depending
   * on the platform
   *
   * @param cameraPhoto
   */

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
}

interface Photo {

  filepath: string;
  webviewPath: string;
  base64?: string;

}
