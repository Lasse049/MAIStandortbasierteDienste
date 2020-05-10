import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the RestProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class RestProvider {

  dburl:string = "http://igf-srv-lehre.igf.uni-osnabrueck.de:33859/getData";

  constructor(public http: HttpClient) {
  }

  public  getData() {
    return new Promise(resolve => {
      this.http.get(this.dburl).subscribe(data => {
        resolve(data);
        console.log(data);
      }, err => {
        console.log("Data request failed due to Server issues");
        console.log(err);
        
      },() => {
        console.log("Data received from the Server");
      });
    });
  }

}

// pm2 start/stop server.js
