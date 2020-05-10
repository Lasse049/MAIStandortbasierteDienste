import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import {catchError, timeout} from "rxjs/operators";
import {of} from "rxjs/observable/of";

/*
  Generated class for the RestProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class RestProvider {

  //dburl:string = "http://igf-srv-lehre.igf.uni-osnabrueck.de:33859/getData";
  dburl:string = "http://igf-srv-lehre.igf.uni-osnabrueck.de:44458/getData";
  constructor(public http: HttpClient, public alertCtrl: AlertController) {
  }
//20000
  public  getData() {
    return new Promise(resolve => {
      this.http.get(this.dburl)
        .pipe(timeout(20000), catchError(error => of(404)))
        .subscribe(data => {
        resolve(data);
        console.log(data);
      }, err => {
        console.log("Data request failed due to Server issues");
        console.log(err);
        this.showAlertData();
      },() => {
        console.log("Data Request finished");
      });
    });
  }


  // Alert sollte nicht hier hin - in home ts
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


}

// pm2 start/stop server.js
