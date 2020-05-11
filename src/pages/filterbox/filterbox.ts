import { Component } from '@angular/core';
import {Events, IonicPage, NavController, NavParams} from 'ionic-angular';
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
  data2: any = [];
  hausmuellarr: any = [];
  sperrmuellarr: any = [];
  sondermuellarr: any = [];
  guenabfallarr: any = [];
  namearr: any = [];
  datearr: any = [];
  filterboolean: any;
  originialdata:any;


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public datePicker: DatePicker,
    public events: Events
  ) {
    this.data = this.navParams.get('data');
    this.originialdata = this.data;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FilterboxPage');
  }

  datesave() {
    console.log('datum ist:' + this.fdate);
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
    // braucht die nächste zeile wirklich?
    //this.data = JSON.parse(JSON.stringify(this.data));
    console.log('button works')
    // console.log('namearr' + this.namearr)
    //if(this.finput!=null|| ){
    if (this.data != null) {
      let b = 0;
      let d = 0;
      let g = 0;

      console.log(this.finput)
      if (this.finput != null) {
        for (let a = 0; a < this.data.length; a++) {
          if (this.data[a].username == this.finput) {
            this.namearr[g] = this.data[a];
            g++;
          }
        }
      }
      console.log(this.namearr)
      console.log(this.fdate)

      console.log(this.datearr)


      // NameArry Hausmuell was?
      //this.namearr = JSON.parse(JSON.stringify(this.namearr));
       for (let i = 0; i < this.namearr.length; i++) {
         if (this.namearr[i].hausmuell== true) {
           this.hausmuellarr.push(this.namearr[i]);
           console.log("hausmuellarr");
           console.log(this.hausmuellarr);
         }
         if (this.namearr[i].gruenabfall == true) {
           this.guenabfallarr.push(this.namearr[i]);
           console.log("gruen");
           console.log(this.guenabfallarr);
           b++
         };
       }

    }
    this.filterboolean=true;
    let filterdata = {
      hausmuellarr:this.hausmuellarr,
      sperrmuelarr:this.sperrmuellarr,
      gruenabfallarr:this.guenabfallarr,
      sondermuell:this.sondermuellarr,
      filterbool: this.filterboolean,
      origindata: this.originialdata
    };

    this.navCtrl.pop().then(() => {
      // Trigger custom event and pass data to be send back
      this.events.publish('custom-user-events', filterdata);
    });
    }


    back(){
      this.filterboolean=false;
      let filterdata = {
        origindata: this.originialdata,
        filterbool: this.filterboolean
      }
      ;
      this.navCtrl.pop().then(() => {
        // Trigger custom event and pass data to be send back
        this.events.publish('custom-user-events', filterdata);
        //this.navCtrl.pop();
      });
    }

}


