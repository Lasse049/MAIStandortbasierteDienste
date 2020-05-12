import {Component, ElementRef, ViewChild} from '@angular/core';
import {Events, LoadingController, NavController, NavParams} from 'ionic-angular';

import leaflet from 'leaflet';
import { Geolocation } from '@ionic-native/geolocation';
import {RestProvider} from "../../providers/rest/rest";
import {CheckboxPage} from "../checkbox/checkbox";
import {FilterboxPage} from "../filterbox/filterbox";
import { AlertController } from 'ionic-angular';
import {e} from "@angular/core/src/render3";
import {catchError} from "rxjs/operators";
import {Platform} from 'ionic-angular';
import {DatePicker} from "@ionic-native/date-picker";
import 'leaflet-easybutton';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  //Class Variables
  map: any;
  lat: any;
  long: any;
  coords: any;
  dbdata: any;
  jsondata: any;
  marker: any;
  timestamp: any;
  geopoint: any;
  loconoff: boolean = true;
  buttonColor: any;
  watch: any;
  subscription: any;
  bluedot: any;
  testCheckboxResult: any;
  testCheckboxOpen: any;
  options: any
  data:any
  loading:any;
  hausmuellarr: any = [];
  gruenabfallarr: any = [];
  sondermuellarr: any = [];
  sperrmuellarr: any = [];
  filterbool: boolean = false;
  markers:any;
  dataFromOtherPage: any = null;
  hausmarker: any;
  gruenabfall: any;
  sondermuell: any;
  spermuell: any;
  fmarkers: any;
  fmarker: any;





  constructor(
    public navCtrl: NavController,
    public geolocation: Geolocation,
    public restProvider: RestProvider,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public platform: Platform,
    public navParams: NavParams,
    public events: Events
  ) {
  }



  /***
   * On Start
   */
  ionViewDidEnter() {
    this.loading = this.loadingCtrl.create({
      content: 'Loading App',
      spinner: 'circles'
    });

    this.loadmap();
    //Create Loading Spinner while App is not ready


    //If Map doesnt exist, Load it
    if (this.map == null) {
      console.log("map is null")
      //this.loadmap();
    }


    // Call Method GetLocation
    this.getLocation();

    console.log(this.hausmuellarr);
    console.log(this.gruenabfallarr);
    console.log(this.sperrmuellarr);
    console.log(this.sondermuellarr);
    console.log(this.filterbool);




    }

  /***
   * On Start
   */
  getLocation() {

    this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.long = resp.coords.longitude;
      this.timestamp = resp.timestamp;
      // initial View
      this.map.setView([this.lat, this.long]);
      this.showBlueDot();
      this.followLocation();

    }).catch((error) => {
      console.log('Error getting location', error);
    });

  }

  followLocation() {
    this.watch = this.geolocation.watchPosition();
    this.subscription = this.watch.subscribe((data) => {

      this.lat = data.coords.latitude
      this.long = data.coords.longitude
      this.timestamp = data.timestamp;

      //console.log('Location found at: ' + this.lat + " ; " + this.long);

      this.showBlueDot();
      this.follownav();

    });
  }

  showBlueDot(){

    if(this.bluedot == null){
      console.log("no bluedot");
      console.log('Creating Dot Options');
      const bluedotoptions = {
        color: '#1e90ff',
        fillColor: '#1e90ff',
        fillOpacity: 0.5,
        radius: 5
      }
      this.bluedot = leaflet.circleMarker([this.lat, this.long],bluedotoptions);
      this.bluedot.addTo(this.map);
      console.log("added bluedot");
    } else {
     // console.log("moving bluedot");
      let latlng = leaflet.latLng(this.lat, this.long);

      this.bluedot.setLatLng(latlng);
      //.addTo(this.map);
      //this.bluedot.addTo(this.map);
    }
    this.bluedot.bindPopup('You are here'+'<br>'+ 'Latitude: ' + this.lat + '</br>' + 'Longitude: ' + this.long + '</br>');
  }

  follownav() {
    //console.log(this.loconoff)
    if (this.loconoff) {
      //console.log("Follow GPS is on")
      this.buttonColor = "primary";
      this.map.setView([this.lat, this.long]);
    } else {
      //console.log("Follow GPS is OFF")
       this.buttonColor = "light";
    }
  }

  loadmap() {
   // if(this.mapinit!=true) {
      //this.map.remove();
      console.log("loading map");
      // Define and add Leaflet Map with OSM TileLayer

 //   }
    if (this.map != undefined) {
      console.log("map removed")
      this.map.remove();
    }
    var container = leaflet.DomUtil.get('map');
    if(container != null){
      console.log("container");
      container._leaflet_id = null;
    }

    this.map = leaflet.map("map"); //Already init oder undefined

    //this.map.createPane("map");
      leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attributions: 'OpenStreetMap',
      }).addTo(this.map);
      this.map.setZoom(25);
      this.map.setView([0, 0])

    //this.map.setView([this.lat, this.long]);
    console.log('MapLoadSuccsess');
    console.log("lat: " + this.lat + "long: " + this.long);
    //this.map.createPane("map","map");

    if (this.map!=null){
      console.log("map is not null")
    } else {
      console.log("map is null again")
    }

    /*LEAFLET EASY BUTTONCHANGEABLE
    var stateChangingButton = leaflet.easyButton({
      states: [{
        stateName: 'on',        // name the state
        icon:      '<img src="https://pdxcyclesafetymap.neocities.org/images/blackSkull.svg" style="width:16px">',
        title:     'zoom to a forest',      // like its title
        onclick: function(){
          console.log('buttonClicked');
          //this.startstopfollow();
        }
      }, {
        stateName: 'off',
        icon:      '<img src="https://pdxcyclesafetymap.neocities.org/images/blackSkull.svg" style="width:16px">',
        title:     'zoom to a school',
        onclick: function(){
          console.log('buttonClicked');
          //this.startstopfollow();
        }
      }]
    });

    stateChangingButton.addTo(this.map);
*/

/* LEAFLET EASY BUTTON
    leaflet.easyButton('fa-crosshairs fa-lg', function(btn, map){
      console.log('buttonClicked');
    }).addTo(this.map)
*/

/* // DAS FUNKTIONIERT KANN ABER NUR LOGGEN / KEINE METHODE AUFRUGEN (NOCH)
    leaflet.Control.MyControl = leaflet.Control.extend({
      onAdd: function(map) {
        var container = leaflet.DomUtil.create('ion-button', 'leaflet-bar my-control');

        container.innerHTML = 'My Control';
        container.onclick = function(){
          console.log('buttonClicked');
          //this.startstopfollow();
        }
        return container;
      },
      //ion-button (click)="opencheckbox()"
      onRemove: function(map) {
        // Nothing to do here
      }
    });

    leaflet.control.myControl = function(opts) {
      return new leaflet.Control.MyControl(opts);
    }

    leaflet.control.myControl({
      position: 'topright'
    }).addTo(this.map);
*/



/* ZOOM CONTROL ERWEITERN?
    this.map.control.zoom.extend(onAdd => {
      leaflet.DomEvent.on(leaflet.DomUtil.get('zomcontrnav'), 'click', function () {
        this.startstopfollow();
      });
      // your new method content
    });

 */

    this.map.whenReady(function(e){
        console.log("Map is ready")
        this.mapinit = true;
        this.maplodedsetmarker();
      }.bind(this)
    );

    this.map.on("dragstart", function(e) {
        console.log("Dragging the Map")
        this.loconoff = false;
      }.bind(this)
    );

    var legend = leaflet.control({position: 'bottomright'});
    legend.onAdd = this.getLegend;
    legend.addTo(this.map);

    this.map.invalidateSize();

  }

  getLegend() {

    var div = leaflet.DomUtil.create('div', 'info legend'),
        categories = ['eigener Standort','illegale Müllablagerung'],
        labels = [],
        from, to;

    div.innerHTML += '<h3>Legende</h3>';


    for (var i = 0; i < categories.length; i++) {
        from = categories[i];
        to = categories[i + 1];
        labels.push(
          '<i class="colorcircle"  + "></i> ' + from + (to ? '&ndash;' + to : '+'));
    }

    return div;
  }


  maplodedsetmarker(){
    this.getDBData();
    console.log("Map Loaded. Getting DB Data")
  }

  getDBData() {
    this.loading.present();
    console.log("Trying to connect to Server")
    this.restProvider.getData()
      .then(data => {
        JSON.stringify(data, null,2);
        console.log(data);
        this.dbdata = data;

        this.setMarker(data);

        return (data)
      });
  }

  setMarker(data){
    if(data == 404 || data == null || data == undefined){
      this.showAlertnoData();
    } else {
      if (this.filterbool==false) {
        this.jsondata = data.result;
        this.markers = new leaflet.layerGroup().addTo(this.map);
        console.log("setMarker");
        console.log(this.jsondata);

        for (let i = 0; i < this.jsondata.length; i++) {
          //Markerfarbe
          this.marker = new leaflet.marker([this.jsondata[i].latitude, this.jsondata[i].longitude],{color: 583470});

          if (this.jsondata[i].hausmuell == true) {
            this.marker.bindPopup('<br>' + this.jsondata[i].time + ' <br> Username: ' + this.jsondata[i].username + '<br>' + ' Hausmuell');
          } else if (this.jsondata[i].gruenabfall == true) {
            this.marker.bindPopup('<br>' + this.jsondata[i].time + ' <br> Username: ' + this.jsondata[i].username + '<br>' + ' Gruenabfall');
          } else if (this.jsondata[i].sperrmuell == true) {
            this.marker.bindPopup('<br>' + this.jsondata[i].time + ' <br> Username: ' + this.jsondata[i].username + '<br>' + ' Sperrmuell');
          } else if (this.jsondata[i].sondermuell == true) {
            this.marker.bindPopup('<br>' + this.jsondata[i].time + ' <br> Username: ' + this.jsondata[i].username + '<br>' + ' Sondermuell');
          }
          this.markers.addLayer(this.marker);
          console.log("Markers added");
        }
      } else {
        this.setFilterMarker();
      }
    }
    if (this.loading != null) {
      this.loading.dismissAll();
      this.loading = null;
    }
  }

  setFilterMarker(){
    if(this.markers!=null) {
      this.map.removeLayer(this.markers);
      this.markers = null;
    }
    if(this.marker!=null){
      this.marker = null;
    }

    this.fmarkers = new leaflet.layerGroup().addTo(this.map);

    //this.markers = new leaflet.layerGroup().addTo(this.map);
    console.log("IMHERE");

    this.hausmarker = new leaflet.layerGroup().addTo(this.map);
    this.gruenabfall = new leaflet.layerGroup().addTo(this.map);
    this.sondermuell = new leaflet.layerGroup().addTo(this.map);
    this.spermuell = new leaflet.layerGroup().addTo(this.map);
    console.log("setfilterMarker");
    //console.log(this.jsondata);
    //Markerfarbe


    if (this.hausmuellarr != undefined) {
      for (let i = 0; i < this.hausmuellarr.length; i++) {
        this.hausmarker = new leaflet.marker([this.hausmuellarr[i].latitude, this.hausmuellarr[i].longitude]);
        this.hausmarker.bindPopup('<br>' + this.hausmuellarr[i].time + ' <br> Username: ' + this.hausmuellarr[i].username + '<br>' + ' Hausmuell');
        this.fmarkers.addLayer(this.hausmarker);
      }
    }
    if (this.sperrmuellarr != undefined) {
      for (let i = 0; i < this.sperrmuellarr.length; i++) {
        this.spermuell = new leaflet.marker([this.sperrmuellarr[i].latitude, this.sperrmuellarr[i].longitude]);
        this.spermuell.bindPopup('<br>' + this.sperrmuellarr[i].time + ' <br> Username: ' + this.sperrmuellarr[i].username + '<br>' + ' Sperrmuell');
        this.fmarkers.addLayer(this.spermuell);}
    }
    if (this.gruenabfallarr != undefined) {
      for (let i = 0; i < this.gruenabfallarr.length; i++) {
        this.gruenabfall = new leaflet.marker([this.gruenabfallarr[i].latitude, this.gruenabfallarr[i].longitude]);
        this.gruenabfall.bindPopup('<br>' + this.gruenabfallarr[i].time + ' <br> Username: ' + this.gruenabfallarr[i].username + '<br>' + ' Gruenabfall');
        this.fmarkers.addLayer(this.gruenabfall);
      }
    }
    if (this.sondermuellarr != undefined) {
      for (let i = 0; i < this.sondermuellarr.length; i++) {
        this.sondermuell = new leaflet.marker([this.sondermuellarr[i].latitude, this.sondermuellarr[i].longitude]);
        this.sondermuell.bindPopup('<br>' + this.sondermuellarr[i].time + ' <br> Username: ' + this.sondermuellarr[i].username + '<br>' + ' Sondermuell');
        this.fmarkers.addLayer(this.sondermuell);
      }
    }
    console.log("ANDHERE");
    this.fmarkers.addTo(this.map);
    console.log("Markers added");

    if (this.loading != null) {
      this.loading.dismissAll();
      this.loading = null;
    }
    console.log("filtermarker duchlaufen");
  }


  //var dateTime = this.data[i].time;
  //var getdateTime = dateTime.split("T",1);


  opencheckbox(){
    this.navCtrl.push(CheckboxPage,
      {
        data:this.jsondata,
        long:this.long,
        lat:this.lat,
        time:this.timestamp,
      },{},function(e){
      console.log("data pushed");
      }
      );
  }

  openfilterbox(){
    this.events.subscribe('custom-user-events', (filterdata) => {
      console.log("subscribing filters");
      console.log(filterdata);
      this.dataFromOtherPage = filterdata;
      this.hausmuellarr = filterdata.hausmuellarr;
      this.gruenabfallarr = filterdata.gruenabfallarr;
      this.sperrmuellarr = filterdata.sperrmuelarr;
      this.sondermuellarr = filterdata.sondermuell;
      this.filterbool = filterdata.filterbool;
      this.jsondata = filterdata.origindata;
      console.log("Received data: " + filterdata);


      console.log(this.hausmuellarr);
      console.log(this.gruenabfallarr);
      console.log(this.sperrmuellarr);
      console.log(this.sondermuellarr);
      console.log(this.filterbool);
      /*
        hausmuellarr:this.hausmuellarr,
        sperrmuelarr:this.sperrmuellarr,
        gruenabfallarr:this.guenabfallarr,
        sondermuell:this.sondermuellarr,
        console.log(filterdata);
        */
      console.log(filterdata);
      //this.events.unsubscribe('custom-user-events'); // unsubscribe this event
    })
    this.navCtrl.push(FilterboxPage,
      {
        data:this.jsondata,
        map:this.map,
      },{},function(e){
        console.log("data pushed");
      }
    );
  }

  zoomonlocation(){
    this.map.setView([this.lat, this.long], 17);
  }


  startstopfollow() {
    console.log("changebool")
    this.loconoff = !this.loconoff;
    this.follownav();
  }


  showAlertnoData() {
    const alert = this.alertCtrl.create({
      title: 'Keine Verbindung zum Server!',
      subTitle: 'App nur eingeschränkt nutzbar.',
      buttons: [{
        text: 'OK',
        handler: () => {
          if (this.loading != null) {
            this.loading.dismissAll();
            this.loading = null;
          }
          this.platform.exitApp()
        }
      }]
    });
    alert.present();
  }


  ionViewDidLeave() {
    if (this.loading != null) {
      this.loading.dismissAll();
      this.loading = null;
    }
    if(this.subscription!=null) {
      this.subscription.unsubscribe();
    }
    if(this.map) {
      //this.map.off();
      //this.map.remove();
      //this.map.remove(); // Removes the map completly incl div
    }

    //this.map.removeLayer(this.markers);
  }

  simplemethod2(){
    console.log("its simple for tests")
  }
}


/**
 *
 filter() {
    let alert = this.alertCtrl.create();

    alert.setTitle('Anzeigefilter');

    alert.addInput({
      type: 'checkbox',
      label: 'Sondermüll',
      value: 'value1',

    });

    alert.addInput({
      type: 'checkbox',
      label: 'Hausmüll',
      value: 'value2',

    });

    alert.addInput({
      type: 'checkbox',
      label: 'Grünabfälle',
      value: 'value3',

    });

    alert.addInput({
      type: 'checkbox',
      label: 'Sperrmüll',
      value: 'value4',

    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'Okay',
      handler: data => {
         console.log('Checkbox data:', data);
         this.testCheckboxOpen = false;
         this.testCheckboxResult = data;
       }
    });

  }


filter(data) {

  this.jsondata = data.result;
  // -) Loop and set the array item checked to match current setting
  let AlertInputs = this.jsondata.filter((Item) => {
    // add 'checked' to each object in our array
    Item['checked'] = Item['label'] === this.options.PauseAfter
    return Item
  })
  // -) Setup alert
  let Alert = this.alertCtrl.create({
    title: 'Pause After Selection',
    message: 'Make a selection...',
    // https://ionicframework.com/docs/components/#alert-radio
    inputs:
    AlertInputs,
    buttons: [{
      text: 'Ok',
      handler: (data) => {
        // INOTE: storing the label, but you can store the index :)
        this.options.PauseAfter = this.jsondata[data].label
      }
    },
    ]
  });
  // Show the alert
  Alert.present();
}
**/


