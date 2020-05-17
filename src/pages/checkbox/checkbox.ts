import { Component } from '@angular/core';
import {LoadingController, NavController, NavParams} from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import {ProviderPhotoProvider} from "../../providers/photo/photo";
import { Events } from 'ionic-angular';
import 'rxjs/add/operator/map';

// Angular Metadata
@Component({
  selector: 'page-checkbox',
  templateUrl: 'checkbox.html'
})

/**
 * Submit Page!
 *
 * @author Lasse Hybbeneth
 * @author Felix
 * @author Tristan
 */

export class CheckboxPage {
  Hausmuell: boolean = false;             // indicate if Hausmüll is checked
  Sondermuell: boolean = false;           // indicate if Sondermüll is checked
  Gruenabfall: boolean = false;           // indicate if Grünabfall is checked
  Sperrmuell: boolean = false;            // indicate if Sperrmüll is checked
  latitude: any;                          // Latitude of user position
  longitude: any;                         // Longitute of user position
  username: any;                          // Usernameinput
  timestamp: any;                         // Geolocation timestamp
  error: boolean = false;                 // Boolean to indicate if sending is Possible and correct
  sending: any;                           // Loading Spinner
  subscriptioncomplete: boolean = false;  // Boolean indicates if data was send
  postsubscription: any;                  // Listen to server response

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public photoProvider: ProviderPhotoProvider,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public http: HttpClient,
    public event: Events
  )
  {
    //Get data from other Page
    this.latitude = this.navParams.get('lat');
    this.longitude = this.navParams.get('long');
    this.timestamp = this.navParams.get('time');
  }

  /***
   * On Clicking the Photo Button
   */
  async onclickmethode(){
    // Wait for picture to be taken or cancled
    await this.photoProvider.addNewToGallery();
    //const emptypic = document.getElementById('machen');
    const fullpic = document.getElementById('gemacht');
    // If picute wasnt taken style is none taken
    if(this.photoProvider.ueber==null){
      fullpic.style.display='none';
    } else {
      // Picture taken, indicate with button appearing
      fullpic.style.display='inline';
    }
  }

  /***
   * On Clicking the Send Button
   * Make sure Data to be submitted contains location, name and trash information
   * Show alerts or sendtoserver(data+photo)
   * @param this.photop
   */
  send() {

    // save base64 string
    let data64 = this.photoProvider.ueber;

    // Check for input
    if (this.username == null) {
      this.showAlertnu()
    }
    if (this.Hausmuell== false && this.Gruenabfall == false && this.Sperrmuell == false && this.Sondermuell == false ) {
      this.showAlertma()
    }
    if ( this.username!= null) {
      if (this.Hausmuell == true || this.Gruenabfall == true || this.Sperrmuell == true || this.Sondermuell == true) {
       if (this.longitude != null && this.latitude != null) {
         this.sendtoserver(data64);
        }
      }
    }
  }


  /***
   * On Clicking the Send Button
   * Make sure Data to be submitted contains location, name and trash information
   * Show alerts or sendtoserver(data+photo)
   */
  sendtoserver(photo) {

    // Show Sending Spinner
    this.sending = this.loadingCtrl.create({
      content: 'Sending Data',
      spinner: 'circles'
    });
    this.sending.present();

    // Call ServerAdress:Port/Method
    const url = "http://igf-srv-lehre.igf.uni-osnabrueck.de:44458/send"

    //Wrap up a data object
    let data = {
      time: this.timestamp,
      user: this.username,
      lat: this.latitude,
      long: this.longitude,
      haustrash: this.Hausmuell,
      sondertrash: this.Sondermuell,
      gruentrash: this.Gruenabfall,
      sperrtrash: this.Sperrmuell,
      picture: photo,
    };

    // post (Send) Data to server. Subscribe its answer
    // url = server url_port/method
    // data = data wrapped up as object
    this.postsubscription = this.http.post(url, data).subscribe((response) => {
      // Sending succsessful, show alert
      if(response['status'] == 200){
        this.showAlertSe()
      // Sending failed, show alert
      }else{
        this.showAlertSf()
      }
    },err=>
      //Sending failed, no Connection
      this.showAlertSf()
    );
    // Remove picture so next time you send something you dont accidentaly send pictures
    this.photoProvider.removePicturePath();
  }


  /***
   *  Simple Notification alert to let user know that Trash kind was missing
   */
  showAlertma() {
    const alert = this.alertCtrl.create({
      title: 'Fehlende Müllart!',
      subTitle: 'Bitte geben Sie eine Müllart an',
      buttons: ['OK']
    });
    alert.present();
  }

  /***
   *  Simple Notification alert to let user know that Name was missing
   */
  showAlertnu() {
    const alert = this.alertCtrl.create({
      title: 'Fehlender Benutzername!',
      subTitle: 'Bitte geben Sie einen Namen an',
      buttons: ['OK']
    });
    alert.present();
  }

  /***
   *   Notification alert to let user know data was sent
   *   unsubscirbes postsubscription after succsess and pops back to homepage
   */
  showAlertSe() {
    const alert = this.alertCtrl.create({
      title: 'Daten wurden versandt.',
      subTitle: 'Vielen Dank!',
      buttons: [{
        text: 'OK',
        handler: () => {
          if(this.sending!=null){
            this.sending.dismissAll();
            this.sending = null;
          }
          this.postsubscription.unsubscribe();
          this.navCtrl.pop();
        }
      }]
    });
    alert.present();
  }

  /***
   *  Simple Notification alert to let user know that data could not be sent
   */
  showAlertSf() {
    const alert = this.alertCtrl.create({
      title: 'Daten konnten nicht übermittelt werden!',
      subTitle: 'Versuchen sie es später erneut.',
      buttons: [{
        text: 'OK',
        handler: () => {
          this.error = true;
          if(this.sending!=null){
            this.sending.dismissAll();
            this.sending = null;
          }
          this.postsubscription.unsubscribe();
        }
      }]
    });
    alert.present();
  }

  /***
   *  Go back to home page
   *  Delete pictures
   */
  back(){
    this.navCtrl.pop();
    this.photoProvider.removePicturePath().then();
  }

  /***
   *  Leaving page
   *  Dismiss Loading spinners if active and delete photo
   */
  ionViewDidLeave() {
    if(this.sending!=null){
      this.sending.dismissAll();
      this.sending = null;
      this.photoProvider.removePicturePath().then();
    }
  }
}
