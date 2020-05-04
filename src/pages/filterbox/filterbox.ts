import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {HomePage} from "../home/home";
import {root} from "rxjs/util/root";
import { AlertController } from 'ionic-angular';



@IonicPage()
@Component({
  selector: 'page-filterbox',
  templateUrl: 'filterbox.html',
})
export class FilterboxPage {
  Hausmuell: boolean;
  Sondermuell: boolean;
  Gruenabfall: boolean;
  Sperrmuell: boolean;
  root: any;
  input: any;


  constructor(public navCtrl: NavController, public navParams: NavParams) {
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

  ionViewDidLoad() {
    console.log('ionViewDidLoad FilterboxPage');
  }

}
