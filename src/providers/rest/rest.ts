import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the RestProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class RestProvider {
  dburl:string = "http://igf-srv-lehre.igf.uni-osnabrueck.de:37996";
  constructor(public http: HttpClient) {
    console.log('Hello RestProvider Provider');
  }

  public  getData() {
    return new Promise(resolve => {
      this.http.get(this.dburl + '/getData').subscribe(data => {
        resolve(data);
      }, err => {
        console.log(err);
      });
    });
  }

}
