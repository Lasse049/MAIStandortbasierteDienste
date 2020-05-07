import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {HomePage} from "../home/home";
import {root} from "rxjs/util/root";
//import { DatePicker } from '@ionic-native/date-picker';
import { AlertController } from 'ionic-angular';



@IonicPage()
@Component({
  selector: 'page-filterbox',
  templateUrl: 'filterbox.html',
})
export class FilterboxPage {
  fHausmuell: boolean;
  fSondermuell: boolean;
  fGruenabfall: boolean;
  fSperrmuell: boolean;
  root: any;
  finput: any;
  fdate: any;
  data: any;


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams)
  {
    this.data = this.navParams.get('data');
  }
  datesave (){
    console.log('datum ist:'+this.fdate);
  }
  updateHausmuell() {
    console.log('Hausmuell new state:' + this.fHausmuell);
  }

  updateSondermuell() {
    console.log('Sondermuells new state:' + this.fSondermuell);
  }
  updateGruenabfall() {
    console.log('Gruenabfall new state:' + this.fGruenabfall);

  }
  updateSperrmuell() {
    console.log('Sperrmuells new state:' + this.fSperrmuell);

  }

  anzeige() {
    //this.navCtrl.setRoot(HomePage);
    console.log('hallo');
    console.log(this.fdate);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FilterboxPage');
  }

  ionViewDidLeave() {
    //Send Data back to home
  }


}
