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
  data2: any;
  hausmuellarr: any = [];
  sperrmuellarr: any = [];
  sondermuellarr: any = [];
  guenabfallarr: any = [];


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
  filter2() {
    if (this.data != null) {
      let b = 0;
      let d = 0;
      let g = 0;
      this.data2 = this.data
      if(this.finput != null) {
        for (let a = 0; a < this.data2.length; a++) {
          if (this.data2[a].username == this.finput) {
            this.data2[d] = this.data2[a];
            d++;

            // console.log(this.hausmuellarr);
          }
        }
      }
      if(this.fdate!= null) {
        for (let c = 0; c < this.data2.length; c++) {
          if (this.data2[c].time == this.fdate) {
            this.data2[g] = this.data2[c];
            g++

            // console.log(this.hausmuellarr);
          }
        }
      }
      for (let i = 0; i < this.data2.length; i++) {
        if (this.data2[i].hausmuell == true) {
          this.hausmuellarr[b] = this.data2[i];

         // console.log(this.hausmuellarr);
        }
        if (this.data2[i].Sperrmuell == true) {
          this.sperrmuellarr[b] = this.data2[i];

         // console.log(this.sperrmuellarr);
        }
        if (this.data2[i].Sondermuell == true) {
          this.sondermuellarr[b] = this.data2[i];

          //console.log(this.sondermuellarr);
        }
        if (this.data2[i].Gruenabfall == true) {
          this.guenabfallarr[b] = this.data2[i];

          console.log(this.guenabfallarr);
        }
        b++;
      }
    }
  }

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
