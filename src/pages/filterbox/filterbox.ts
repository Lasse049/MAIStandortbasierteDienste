import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {HomePage} from "../home/home";
import {root} from "rxjs/util/root";
//import { DatePicker } from '@ionic-native/date-picker';
import { AlertController } from 'ionic-angular';
import { DatePicker } from '@ionic-native/date-picker';



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
    public navParams: NavParams,
    public datePicker: DatePicker
  )
  {
    this.data = this.navParams.get('data');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FilterboxPage');
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

  /*
  calendar(){
    this.datePicker.show({
      date: new Date(),
      mode: 'date'
      //allowFutureDates: false,
      //androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
    }).then(
      date => this.setdate(date)
      ,
      err => console.log('Error occurred while getting date: ', err)
    );
  }

  setdate(date){
    this.fdate=date;
    console.log('Got date: ', date)
  }

   */

  filter() {
    //this.navCtrl.setRoot(HomePage);
    console.log('hallo');
    console.log(this.fdate);
  }

  back() {
    //this.navCtrl.setRoot(HomePage);
    console.log('hallo');
    console.log(this.fdate);
  }



  ionViewDidLeave() {
    //Send Data back to home
  }


}
