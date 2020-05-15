import { Component } from '@angular/core';
import {Events, IonicPage, NavController, NavParams} from 'ionic-angular';
import { DatePicker } from '@ionic-native/date-picker';


@IonicPage()
@Component({
  selector: 'page-filterbox',
  templateUrl: 'filterbox.html',
})

/**
 * Filter Page!

 *
 * @author Lasse Hybbeneth
 * @author Felix
 * @author Tristan
 */


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
  filterboolean: any = false;// boolean for recognising if there is some filter working
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

  filter2() {                                             //Filterfunktion - started when Button is clicked
    // braucht die nächste zeile wirklich?
    //this.data = JSON.parse(JSON.stringify(this.data));
    console.log('button works!!')
    if(this.finput != undefined){
      if(this.finput[0] == null){
        this.finput = null
      }
    }
    console.log(this.finput)
    //if(this.finput!=null|| ){
    if (this.data != null) {                             // Only works when there are data from the Server
      let g = 0;                                         // counting Variable
      console.log(this.finput)
      if(this.finput != null && this.fdate != null){     // if there is an input for username and date
        for (let a = 0; a < this.data.length; a++) {
          var dateTime = this.data[a].time;
          var getdateTime = dateTime.split("T",1);
          if (this.data[a].username == this.finput && getdateTime == this.fdate) {
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

      if(((this.fdate != null ||this.finput != null)||(this.finput != undefined || this.fdate != undefined)) && (this.fSperrmuell == undefined || this.fSperrmuell == false) && (this.fHausmuell == undefined || this.fHausmuell == false) && (this.fGruenabfall == undefined || this.fGruenabfall == false) && (this.fSperrmuell == undefined|| this.fSperrmuell == false)){
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
         }else
         if (this.namearr[i].gruenabfall == true && this.fGruenabfall == true && this.fGruenabfall != undefined) {
           this.hausmuellarr.push(this.namearr[i]);
           console.log("gruen");
           console.log(this.guenabfallarr);

         } else
         if (this.namearr[i].sondermuell == true && this.fSondermuell == true && this.fSondermuell != undefined) {
           this.hausmuellarr.push(this.namearr[i]);
           console.log("sonder");
           console.log(this.sondermuellarr);

         } else
         if (this.namearr[i].sperrmuell == true && this.fSperrmuell == true && this.fSperrmuell != undefined) {
           this.hausmuellarr.push(this.namearr[i]);
           console.log("sper");
           console.log(this.sperrmuellarr);

         };
       }
    }
    // fitlerbool nur true wenn auch gefilter wurde und daten nicht null/leer sind!!
    // if ((this.hausmuellarr == undefined ||this.hausmuellarr == null)&&(this.guenabfallarr == undefined ||this.guenabfallarr == null)&&(this.sondermuellarr == undefined ||this.sondermuellarr == null)&&(this.sperrmuellarr == undefined ||this.sperrmuellarr == null)){
    if(this.hausmuellarr.length== 0 && this.guenabfallarr.length == 0 && this.sondermuellarr.length == 0 && this.sperrmuellarr.length == 0) {
    this.filterboolean=false;
    } else {
      this.filterboolean = true;

    }

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
      //this.filterboolean=false;
      let filterdata = {
        origindata: this.originialdata,
        //filterbool: this.filterboolean
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
