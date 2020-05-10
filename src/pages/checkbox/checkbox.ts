import { Component } from '@angular/core';
import {IonicPage, LoadingController, NavController, NavParams} from 'ionic-angular';
import {HomePage} from "../home/home";
import {root} from "rxjs/util/root";
import { AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import {ProviderPhotoProvider} from "../../providers/photo/photo";
import { Events } from 'ionic-angular';
import { delay } from 'rxjs/operators';
import { ReturnStatement } from '@angular/compiler';


@Component({
  selector: 'page-checkbox',
  templateUrl: 'checkbox.html'
})
export class CheckboxPage {
  Hausmuell: boolean = false;
  Sondermuell: boolean = false;
  Gruenabfall: boolean = false;
  Sperrmuell: boolean = false;
  root: any;
  input: any;
  latitude: any;
  longitude: any;
  data: any;
  username: any;
  timestamp: any;
  photopfad: any;
  picture: any;
  error: boolean = false;
  count: number = 3;
  sending: any;

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
    this.latitude = this.navParams.get('lat');
    this.longitude = this.navParams.get('long');
    this.timestamp = this.navParams.get('time');
    this.data = this.navParams.get('data');

  }
  updateHausmuell() {
    console.log('Hausmuell new state:' + this.Hausmuell);
  }

  updateSondermuell() {
    console.log('Sondermuells new state:' + this.Sondermuell);
  }
  updateGruenabfall() {
    console.log('Gruenabfall new state:' + this.Gruenabfall);

  }
  updateSperrmuell() {
    console.log('Sperrmuells new state:' + this.Sperrmuell);

  }

  logEvent() {
    this.navCtrl.setRoot(HomePage);
    this.navCtrl.popToRoot(root);
  }

  send() {
    this.photopfad = this.photoProvider.ueber;
    console.log("Da Pic: " + this.photoProvider.picture)

    console.log("Hier Pfad: " + this.photopfad);

    let data64 = this.photoProvider.ueber;

    this.picture= "data:image/jpeg;base64,"+ data64;

    if (this.username == null) {
      this.showAlertnu()
    }
    if (this.Hausmuell== false && this.Gruenabfall == false && this.Sperrmuell == false && this.Sondermuell == false ) {
      this.showAlertma()

    } else {
      if(this.longitude != null && this.latitude != null){

        this.sendtoserver(this.picture);
      }
    }


  }


  sendtoserver(photo) {
    console.log("sendToserver Ausgeloest");
    ///////// TESTDATEN//////////
    /* this.username="cccfake";
     this.latitude=52;
     this.longitude=8;
     this.Hausmuell=true;
     this.Sondermuell=false;
     this.Gruenabfall=false;
     this.Sperrmuell=false;

     */
    /////////////////////////////

    this.sending = this.loadingCtrl.create({
      content: 'Sending Data',
      spinner: 'circles'
    });
    this.sending.present();

    const url = "http://igf-srv-lehre.igf.uni-osnabrueck.de:33859/send"
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

    console.log("132: "+ this.error);
    this.http.post(url,data).subscribe(() => {
      this.error= true;
      console.log("135: "+ this.error);
    }, err => {
      console.log("Could not send data");
      console.log(err);
      this.error = true;
      console.log("140: "+ this.error);
    },() => {
      this.error= false;
      console.log("143: "+ this.error);
    });


    if(this.error == false){
      console.log("147: "+ this.error);

      this.showAlertSe();
      //this.navCtrl.pop()
    }


    console.log(this.count);
  }

/*
    console.log(this.count);
    this.http.post(url,data).subscribe(data => {
      console.log("Sending Data...")
      //sending.dismissAll()
    }, err => {
      console.log("Could not send data")
      console.log(err)
      this.error = true;
      //sending.dismissAll()
    },() => {
      this.count = 1;
      console.log("Data has been sent to the Server")
    });
    //this.navCtrl.pop()

      console.log(this.count);
  }
  */



  showAlertma() {
    const alert = this.alertCtrl.create({
      title: 'Fehlende Müllart!',
      subTitle: 'Bitte geben Sie eine Müllart an',
      buttons: ['OK']
    });
    alert.present();
  }

  showAlertnu() {
    const alert = this.alertCtrl.create({
      title: 'Fehlender Benutzername!',
      subTitle: 'Bitte geben Sie einen Namen an',
      buttons: ['OK']
    });
    alert.present();
  }

  showAlertSe() {
    const alert = this.alertCtrl.create({
      title: 'Daten gesendet!',
      subTitle: 'Vielen Dank.',
      buttons: [{
        text: 'OK',
        handler: () => {
          this.sending.dismissAll();
          this.sending = null;
          this.navCtrl.pop();
        console.log('Agree clicked');
        }
      }]
    });
    alert.present();
  }

  ionViewDidLeave() {

    //Send Data back to home
  }


}
