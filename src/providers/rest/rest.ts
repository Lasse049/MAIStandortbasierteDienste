import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';

/***
 *  Rest Provider
 *  Verbindet sich mit http://igf-srv-lehre.igf.uni-osnabrueck.de auf Port 44458 und führt getData aus
 */
@Injectable()
export class RestProvider {

  // Server URL:PORT/METHOD
  dburl:string = "http://igf-srv-lehre.igf.uni-osnabrueck.de:44458/getData";
  constructor(public http: HttpClient, public alertCtrl: AlertController) {
  }

  // Sends a getData request
  // If answering, resolve data (and give it to home)
  // if request failed resolve an object with value 404
  public  getData() {
    return new Promise(resolve => {
      this.http.get(this.dburl)
        .subscribe(data => {
        resolve(data);
      }, err => {
          resolve(404);
      },() => {
      });
    });
  }
}


