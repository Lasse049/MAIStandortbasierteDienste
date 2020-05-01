import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {HomePage} from "../home/home";
import {root} from "rxjs/util/root";
import { AlertController } from 'ionic-angular';


@Component({
  selector: 'page-checkbox',
  templateUrl: 'checkbox.html'
})
export class CheckboxPage {
  Hausmuell: boolean;
  Sondermuell: boolean;
  Gruenabfall: boolean;
  Sperrmuell: boolean;
  root: any;
  input: any;

  constructor(public navCtrl: NavController,public alertCtrl: AlertController) {

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

  absend() {
    if (this.Hausmuell== false && this.Gruenabfall == false && this.Sperrmuell == false && this.Sondermuell == false) {
    this.showAlertma()
      if (this.input == null) {
        this.showAlertnu()
      }
  } else {
    //senden einfügen
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

}
