import { Component } from '@angular/core';
import {IonicPage, LoadingController, NavController, NavParams} from 'ionic-angular';
import {HomePage} from "../home/home";
import { AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import {ProviderPhotoProvider} from "../../providers/photo/photo";
import { Events } from 'ionic-angular';
import {catchError, delay, timeout} from 'rxjs/operators';
import { ReturnStatement } from '@angular/compiler';
import {of} from "rxjs/observable/of";
import {HTTPResponse} from "@ionic-native/http";
import 'rxjs/add/operator/map';


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
  sending: any;
  subscriptioncomplete: boolean = false;
  sendingdata: any;
  postsubscription: any;

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

  send() {
    this.photopfad = this.photoProvider.ueber;
    console.log("Da Pic: " + this.photoProvider.picture)
    console.log("Hier Pfad: " + this.photopfad);

    let data64 = this.photoProvider.ueber;

    console.log("data64: " + data64);
    if (data64 != null){
      console.log("data64 is not null: " + data64);
    this.picture= "data:image/jpeg;base64,"+ data64;
    }

    if (this.username == null) {
      this.showAlertnu()
    }
    if (this.Hausmuell== false && this.Gruenabfall == false && this.Sperrmuell == false && this.Sondermuell == false ) {
      this.showAlertma()
    }
    if ( this.username!= null) {
      if (this.Hausmuell == true || this.Gruenabfall == true || this.Sperrmuell == true || this.Sondermuell || true) {
       if (this.longitude != null && this.latitude != null) {
         this.sendtoserver(this.picture);
        }
      }
    }
  }


  sendtoserver(photo) {
    console.log("sendToserver Ausgeloest");
    console.log(photo);

    this.sending = this.loadingCtrl.create({
      content: 'Sending Data',
      spinner: 'circles'
    });
    this.sending.present();

    const url = "http://igf-srv-lehre.igf.uni-osnabrueck.de:44458/send"
//  const url = "http://igf-srv-lehre.igf.uni-osnabrueck.de:33859/send" js 2  44458 für 22
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

    /*
      this.http.post(url,data)
        .map(res => res.json())
        .subscribe(data => {

          }
        )
    */
/////// ERROR KLAPPT; NEXT/COMPLETE NICHT
/*
    this.http.post(url, data).subscribe((res) => {
      if (res['status'] == 204) {
        console.log("sucsess");
      } else {
        console.log("failed");
      }
    });
  }


 */

    this.postsubscription = this.http.post(url,data)
      .map((res) => {
        console.log("lol")
        return res as Object
      })
    .subscribe
      ((data) => {
          console.log("polly")
          console.log("next" + data);
      },(errorResponse: any) => {
          this.error = true;
          console.log(errorResponse);
          console.log("didnt send data");
          this.showAlertSf();
      },() => {
          console.log("complete");
           this.subscriptioncomplete = true;
      });

  // Das funkctioniert nicht - Error wird ausgegeben, Erfolg jedoch nicht. how to handle?
    if(this.error!= true){
      this.showAlertSe();
    }
  }


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

  ionViewDidLeave() {
    if(this.sending!=null){
      this.sending.dismissAll();
      this.sending = null;
    }
    //Send Data back to home
  }


}
