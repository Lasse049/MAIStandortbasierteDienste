import {Component, ElementRef, ViewChild} from '@angular/core';
import {LoadingController, NavController} from 'ionic-angular';

import leaflet from 'leaflet';
import { Geolocation } from '@ionic-native/geolocation';
import {RestProvider} from "../../providers/rest/rest";
import {CheckboxPage} from "../checkbox/checkbox";
import {FilterboxPage} from "../filterbox/filterbox";
import { AlertController } from 'ionic-angular';
import {e} from "@angular/core/src/render3";
import {catchError} from "rxjs/operators";
import {Platform} from 'ionic-angular';


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
  y: any
  loading:any;


  constructor(
    public navCtrl: NavController,
    public geolocation: Geolocation,
    public restProvider: RestProvider,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public platform: Platform,
  ) {
  }

  /***
   * On Start
   */
  ionViewDidEnter() {

    //Create Loading Spinner while App is not ready
    this.loading = this.loadingCtrl.create({
      content: 'Loading App',
      spinner: 'circles'
    });

    // Call Method GetLocation
    this.getLocation();

    //If Map doesnt exist, Load it
    if (this.map == null) {
      this.loadmap();
    }
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
    // Define and add Leaflet Map with OSM TileLayer
    this.map = leaflet.map("map");
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attributions: 'OpenStreetMap',
    }).addTo(this.map);
    this.map.setZoom(25);
    this.map.setView([0,0])
    //this.map.setView([this.lat, this.long]);
    console.log('MapLoadSuccsess');
    console.log("lat: " + this.lat + "long: " + this.long);


    this.map.whenReady(function(e){
        console.log("Map is ready")
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
    if(data == 404){
      this.showAlertnoData();
    } else {
      this.jsondata = data.result;
      let markers = leaflet.layerGroup().addTo(this.map);
      console.log("setMarker");
      console.log(this.jsondata);

      for (let i = 0; i < this.jsondata.length; i++) {
        //Markerfarbe
        this.marker = new leaflet.marker([this.jsondata[i].latitude, this.jsondata[i].longitude]);

        if (this.jsondata[i].hausmuell == true) {
          this.marker.bindPopup('<br>' + this.jsondata[i].time + ' <br> Username: ' + this.jsondata[i].username + '<br>' + ' Hausmuell');
        } else if (this.jsondata[i].gruenabfall == true) {
          this.marker.bindPopup('<br>' + this.jsondata[i].time + ' <br> Username: ' + this.jsondata[i].username + '<br>' + ' Gruenabfall');
        } else if (this.jsondata[i].sperrmuell == true) {
          this.marker.bindPopup('<br>' + this.jsondata[i].time + ' <br> Username: ' + this.jsondata[i].username + '<br>' + ' Sperrmuell');
        } else if (this.jsondata[i].sondermuell == true) {
          this.marker.bindPopup('<br>' + this.jsondata[i].time + ' <br> Username: ' + this.jsondata[i].username + '<br>' + ' Sondermuell');
        }
        markers.addLayer(this.marker);
        console.log("Markers added");
      }
      if (this.loading != null) {
        this.loading.dismissAll();
        this.loading = null;
      }
    }
  }

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
    this.navCtrl.push(FilterboxPage,
      {
        data:this.jsondata,
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
          this.loading.dismissAll();
          this.loading = null;
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
  }

  /*
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


   */
  /*
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
*/


  simplemethod2(){
    console.log("its simple for tests")
  }


}


