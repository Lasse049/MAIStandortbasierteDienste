import { Component } from '@angular/core';
import {Events, IonicPage, NavController, NavParams} from 'ionic-angular';
import { DatePicker } from '@ionic-native/date-picker';


@IonicPage()

// Angular Metadata
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
  fname: any; // usernamefilterinput
  fdate: any; //datefilterinput
  data: any; //Data of Server got from homepage
  fildata: any = []; // Array for ofiltered data
  prefilter: any = []; // Array to filter Data by username oder date
  filterboolean: any = false;// boolean for recognising if there is some filter working
  originialdata:any; // orginaldata from the server

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
  }

  datesave() {
  }

  updateHausmuell() {
  }

  updateSondermuell() {
  }

  updateGruenabfall() {
  }

  updateSperrmuell() {
  }

  filter() {                                             //Filterfunktion - started when Button is clicked

    if(this.fname != undefined){  // if fname (set in the Filterbox.html) is not undefined/ when there is/was an input..
      if(this.fname[0] == null){  // ...and If there is no entry in fname... (when text is deleted)...
        this.fname = null         // ...fname is set null
      }
    }

    if (this.data != null) {                             // Only works when there are data from the Server
      let g = 0;                                         // counting Variable
      if(this.fname != null && this.fdate != null){     // if there is an input for username and date
        for (let a = 0; a < this.data.length; a++) {     // for every entry of the dataset ...
          var dateTime = this.data[a].time;              //... extract date and time from the entry
          var getdateTime = dateTime.split("T",1); // and split the Date and the Time/ Date is saved in getdateTime
          if (this.data[a].username == this.fname && getdateTime == this.fdate) { //if the name and the date of the Datasetentry is equal to the entry in the Filterboxpage...
            this.prefilter[g] = this.data[a];              // the datasetentry is written in the prefilter
            g++                                          // the index of the prefilter is increased
          }
        }
      } else {                                           // if there is only a entry for a name or date on the Filterboxpage
        if (this.fname != null) {                       // if there is a entry in fname
          for (let a = 0; a < this.data.length; a++) {   // for every entry of the dataset ...
            if (this.data[a].username == this.fname) {  // if the nameentry of the dataset is equal to the entry given on the Filterboxpage
              this.prefilter[g] = this.data[a];            // the datasetentry is written in the prefilter
              g++;                                       // the index of the prefilter is increased
            }
          }
        } else {                                         // if there is no entry for a name on the Filterboxpage
          if (this.fdate != null) {                      // if there is a entry for a date on the Filterboxpage
            for (let a = 0; a < this.data.length; a++) { // for every entry of the dataset ...
              var dateTime = this.data[a].time;          // extract date and time from the entry
              var getdateTime = dateTime.split("T",1); // and split the Date and the Time / Date is saved in getdateTime
              if (getdateTime == this.fdate) {           // if the getdateTime of the dataset is equal to the entry given on the Filterboxpage
                this.prefilter[g] = this.data[a];          // the datasetentry is written in the prefilter
                g++;                                     // the index of the prefilter is increased
              }
            }
          }
        }
      }
      if (this.fdate == null && this.fname == null){   // if there is no entry for a name or a date on the Filterboxpage
        for (let a = 0; a < this.data.length; a++) {    // for every entry of the dataset
          this.prefilter[g] = this.data[a];               // the datasetentry is written in the prefilter
          g++;                                          // the index of the prefilter is increased
        }
      }


// if a date and or a name is given on the Filterboxpage but there is no Type of Trash chosen all Types are set true
      if(((this.fdate != null ||this.fname != null)||(this.fname != undefined || this.fdate != undefined)) && (this.fSperrmuell == undefined || this.fSperrmuell == false) && (this.fHausmuell == undefined || this.fHausmuell == false) && (this.fGruenabfall == undefined || this.fGruenabfall == false) && (this.fSperrmuell == undefined|| this.fSperrmuell == false)){
        this.fHausmuell = true;
        this.fSperrmuell = true;
        this.fGruenabfall = true;
        this.fSondermuell  = true;

      }
      /*  For every entry of the Dataset the status of the boolean of the trashtypes is checked.
          if one of the on the Filterboxpage selected trashtypes in the datasetentry is true the data is pushed in the hausmuelarr
      */
       for (let i = 0; i < this.prefilter.length; i++) {
         if (this.prefilter[i].hausmuell== true && this.fHausmuell == true && this.fHausmuell != undefined) {
           this.fildata.push(this.prefilter[i]);
         }else
         if (this.prefilter[i].gruenabfall == true && this.fGruenabfall == true && this.fGruenabfall != undefined) {
           this.fildata.push(this.prefilter[i]);
         } else
         if (this.prefilter[i].sondermuell == true && this.fSondermuell == true && this.fSondermuell != undefined) {
           this.fildata.push(this.prefilter[i]);
         } else
         if (this.prefilter[i].sperrmuell == true && this.fSperrmuell == true && this.fSperrmuell != undefined) {
           this.fildata.push(this.prefilter[i]);
         };
       }
    }
  // if there are no data pushed into the hausmuellarr because there is no dataentry of the dataset that equals the set filter
  // the filterboolean is set false
  // if there is data in the hausmuellarr the filterboolean is set true
    if(this.fildata.length == 0) {
    this.filterboolean=false;
    } else {
      this.filterboolean = true;

    }

    // create object with filtered data, boolean indicationg if its filtered and the original data
    let filterdata = {
      fildata:   this.fildata,
      filterbool: this.filterboolean,
      origindata: this.originialdata
    };

    // go back to the Homepage and send filtered data to it
    this.navCtrl.pop().then(() => {
      // Trigger custom event and pass data to be send back
      this.events.publish('custom-user-events', filterdata);
    });
    }

    // Function to go back to the Homepage and als send the original data to it
    back(){
      let filterdata = {
        origindata: this.originialdata,

      }
      ;
      this.navCtrl.pop().then(() => {
        // Trigger custom event and pass data to be send back
        this.events.publish('custom-user-events', filterdata);
      });
    }

}

