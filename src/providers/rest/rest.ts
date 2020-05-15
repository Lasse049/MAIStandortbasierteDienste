import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import {catchError, timeout} from "rxjs/operators";
import {of} from "rxjs/observable/of";

/*
  Generated class for the RestProvider provider.

VOR ABGABE AUF 30.000 setzten!!! 30000
*/
@Injectable()
export class RestProvider {

  // Server URL:PORT/METHOD
  //dburl:string = "http://igf-srv-lehre.igf.uni-osnabrueck.de:33859/getData";
  dburl:string = "http://igf-srv-lehre.igf.uni-osnabrueck.de:44458/getData";
  constructor(public http: HttpClient, public alertCtrl: AlertController) {
  }

  // Sends a getData request and waits 30s for an answer. if no answer create a 404 item
  // If answering, resolve data (and give it to home)
  // on Error show alert
  public  getData() {
    return new Promise(resolve => {
      this.http.get(this.dburl)
        .pipe(timeout(30000), catchError(error => of(404)))
        .subscribe(data => {
        resolve(data);
        console.log(data);
      }, err => {
        console.log("Data request failed due to Server issues");
        console.log(err);
        //this.showAlertData();
      },() => {
        console.log("Data Request finished");
      });
    });
  }

  /*
  // Alert
  public showAlertData() {
    const alert = this.alertCtrl.create({
      title: 'Server Fehler!',
      subTitle: 'Konnte keine Verbindung zum Server herstellen.'  +'<br>'+ 'Versuchen Sie es später erneut.',
      buttons: [{
        text: 'OK',
        handler: () => {
        }
      }]
    });
    alert.present();
  }
  */


}

// pm2 start/stop server.js
