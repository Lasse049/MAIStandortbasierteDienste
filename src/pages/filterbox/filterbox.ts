import { Component } from '@angular/core';
import {Events, IonicPage, NavController, NavParams} from 'ionic-angular';
import {HomePage} from "../home/home";
import {root} from "rxjs/util/root";
//import { DatePicker } from '@ionic-native/date-picker';
import { AlertController } from 'ionic-angular';
import { DatePicker } from '@ionic-native/date-picker';
import set = Reflect.set;



@IonicPage()
@Component({
  selector: 'page-filterbox',
  templateUrl: 'filterbox.html',
})
export class FilterboxPage {
  fHausmuell: boolean; // filter boolean for Hausmüll
  fSondermuell: boolean; // filter boolean for Sondermüll
  fGruenabfall: boolean; // filter boolean for Grünabfall
  fSperrmuell: boolean; // filter boolean for Sperrmüll
  root: any; // for the way back to the homepage
  finput: any; // usernamefilterinput
  fdate: any; //datefilterinput
  data: any; //Data of Server got from homepage
  data2: any = [];
  hausmuellarr: any = []; // Array for only Hausmülldata
  sperrmuellarr: any = []; // Array for only Sperrmüll
  sondermuellarr: any = [];// Array for only Sondermüll
  guenabfallarr: any = []; // Array for only Grünabfall
  namearr: any = []; // Array to filter Data by username oder date
  datearr: any = [];
  filterboolean: any;// boolean for recognising if there is some filter working
  originialdata:any; // orginaldata from the server
 b:boolean

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
  parseDate(date){
    for (let a = 0; a < 10; a++){
          this.namearr[a] = this.data.date[a];
    }
  }
  filter2() {                                             //Filterfunktion - started when Button is clicked
    // braucht die nächste zeile wirklich?
    //this.data = JSON.parse(JSON.stringify(this.data));
    console.log('button works')
    // console.log('namearr' + this.namearr)
    //if(this.finput!=null|| ){
    if (this.data != null) {                             // Only works when there are data from the Server

      let d = 0;
      let g = 0;                                         // counting Variable


      console.log(this.finput)
      if(this.finput != null && this.fdate != null){     // if there is an input for username and date
        for (let a = 0; a < this.data.length; a++) {
          if (this.data[a].username == this.finput && this.data[a].time == this.fdate) {
            this.namearr[g] = this.data[a];
            g++;
          }
        }
      } else {
        if (this.finput != null) {
          for (let a = 0; a < this.data.length; a++) {
            if (this.data[a].username == this.finput) {
              this.namearr[g] = this.data[a];
              g++;
            }
          }
        } else {
          if (this.fdate != null) {
            for (let a = 0; a < this.data.length; a++) {
              var dateTime = this.data[a].time;
              var getdateTime = dateTime.split("T",1);
              if (getdateTime == this.fdate) {
             // if (this.fdate.compareTo(this.data[a].time) == 0){
                this.namearr[g] = this.data[a];
                g++;
              }
            }
          }
        }
      }
      if (this.fdate == null && this.finput == null){
        for (let a = 0; a < this.data.length; a++) {
          this.namearr[g] = this.data[a];
          g++;
        }
      }
      console.log(this.namearr)
      console.log(this.fdate)

      console.log(this.datearr)

      if(((this.fdate != null ||this.finput != null)||(this.finput != undefined || this.fdate == undefined)) && (this.fSperrmuell == undefined || this.fSperrmuell == false) && (this.fHausmuell == undefined || this.fHausmuell == false) && (this.fGruenabfall == undefined || this.fGruenabfall == false) && (this.fSperrmuell == undefined|| this.fSperrmuell == false)){
        this.fHausmuell = true;
        this.fSperrmuell = true;
        this.fGruenabfall = true;
        this.fSondermuell  = true;

      }
      // NameArry Hausmuell was?
      //this.namearr = JSON.parse(JSON.stringify(this.namearr));
       for (let i = 0; i < this.namearr.length; i++) {
         if (this.namearr[i].hausmuell== true && this.fHausmuell == true && this.fHausmuell != undefined) {
           this.hausmuellarr.push(this.namearr[i]);
           console.log("hausmuellarr");
           console.log(this.hausmuellarr);
         }
         if (this.namearr[i].gruenabfall == true && this.fGruenabfall == true && this.fGruenabfall != undefined) {
           this.guenabfallarr.push(this.namearr[i]);
           console.log("gruen");
           console.log(this.guenabfallarr);

         };
         if (this.namearr[i].sondermuell == true && this.fSondermuell == true && this.fSondermuell != undefined) {
           this.sondermuellarr.push(this.namearr[i]);
           console.log("sonder");
           console.log(this.sondermuellarr);

         };
         if (this.namearr[i].sperrmuell == true && this.fSperrmuell == true && this.fSperrmuell != undefined) {
           this.sperrmuellarr.push(this.namearr[i]);
           console.log("sper");
           console.log(this.sperrmuellarr);

         };
       }
    }
    // fitlerbool sollte nur true sein wenn auch gefilter wurde und daten nicht null/leer sind!!
    this.filterboolean=true;
    let filterdata = {
      hausmuellarr:this.hausmuellarr,
      sperrmuelarr:this.sperrmuellarr,
      gruenabfallarr:this.guenabfallarr,
      sondermuellarr:this.sondermuellarr,
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

//var dateTime = this.data[i].time;
//var getdateTime = dateTime.split("T",1);
