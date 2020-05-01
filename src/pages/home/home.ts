import {Component, ElementRef, ViewChild} from '@angular/core';
import { NavController } from 'ionic-angular';

import leaflet from 'leaflet';
import { Geolocation } from '@ionic-native/geolocation';
import {RestProvider} from "../../providers/rest/rest";
import {ajax} from "rxjs/observable/dom/ajax";
import {ajaxPost} from "rxjs/observable/dom/AjaxObservable";
import {CheckboxPage} from "../checkbox/checkbox";
import { AlertController } from 'ionic-angular';

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
  loconoff: boolean;
  buttonColor: any;
  watch: any;


  constructor(
    public navCtrl: NavController,
    public geolocation: Geolocation,
    public restProvider: RestProvider,
    public alertCtrl: AlertController
  ) {
  }


  ionViewDidEnter() {

    this.getDBData();
    this.getLocation();
    this.loadmap();


    //this.mapisdragged();
  }


  getDBData() {
    console.log("HelloWhat")
    this.restProvider.getData()
      .then(data => {
        console.log("GetDBData");
        JSON.stringify(data, null,2);
        console.log(data);
        this.setMarker(data);

      });
  }


  setMarker(data){
    //this.jsondata = JSON.stringify(data);
    this.jsondata = data.result;
    let markers = leaflet.layerGroup().addTo(this.map);
    console.log("setMarker");
    console.log(this.jsondata);

    for (let i = 0; i < this.jsondata.length; i++) {
      this.marker = new leaflet.marker([this.jsondata[i].latitude, this.jsondata[i].longitude]);

      if (this.jsondata[i].hausmuell == true) {
        this.marker.bindPopup('<br>' +this.jsondata[i].time + ' <br> Username: ' + this.jsondata[i].username + '<br>' + ' Hausmuell');
      } else if (this.jsondata[i].gruenabfall == true) {
        this.marker.bindPopup('<br>' + this.jsondata[i].time + ' <br> Username: ' + this.jsondata[i].username + '<br>' + ' Gruenabfall');
      } else if (this.jsondata[i].sperrmuell == true) {
        this.marker.bindPopup('<br>' + this.jsondata[i].time + ' <br> Username: ' + this.jsondata[i].username + '<br>' + ' Sperrmuell');
      } else if (this.jsondata[i].sondermuell == true) {
        this.marker.bindPopup('<br>' + this.jsondata[i].time + ' <br> Username: ' + this.jsondata[i].username + '<br>' + ' Sondermuell');
      }

      markers.addLayer(this.marker);
      console.log("for Markers");
    }

  }


  getLocation() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.long = resp.coords.longitude;
      this.timestamp = resp.timestamp;
      // initial View
      this.map.setView([this.lat, this.long]);
      this.watchlocation();
      this.showBlueDot();


    }).catch((error) => {
      console.log('Error getting location', error);
    });

  }


  showBlueDot(){
    console.log("Entered ShowBlueDot")
    const bluedotoptions = {
      color: '#1e90ff',
      fillColor: '#1e90ff',
      fillOpacity: 0.5,
      radius: 5
    }
    console.log('Creating Dot Options');
    //let bluedot = leaflet.circle([lat, long],bluedotoptions).addTo(this.map);
    let bluedot
    bluedot = leaflet.circleMarker([this.lat, this.long],bluedotoptions);
    //leaflet.circleMarker([this.lat, this.long],bluedotoptions).addTo(this.map);
    console.log('Showing Blue dot' + this.lat + this.long);

    bluedot.bindPopup('You are here'+'<br>'+ 'Latitude: ' + this.lat + '</br>' + 'Longitude: ' + this.long + '</br>');

    if(!bluedot){
      console.log("no bluedot");
      bluedot.addTo(this.map);
    } else {
      console.log("moving bluedot");
      let latlng = leaflet.latLng(this.lat, this.long);
      bluedot.setLatLng(latlng).addTo(this.map);
      //bluedot.addTo(this.map);
    }
  }


  watchlocation() {
    console.log("prelocation is: " + this.loconoff)
    this.watch = this.geolocation.watchPosition();
    this.watch.subscribe((data) => {
      // data can be a set of coordinates, or an error (if an error occurred).
      this.lat = data.coords.latitude
      this.long = data.coords.longitude
      this.timestamp = data.timestamp;
      //this.watch.setView = false;
      console.log("inloc: " + this.loconoff)
      console.log("watch" + this.watch)
      console.log(this.geopoint)
      console.log('LocationSucsess' + this.lat + this.long);

      console.log("followloc following locatio is: " + this.loconoff)

      console.log("after showbluedot following locatio is: " + this.loconoff)
      //this.showBlueDot();
      // If Button Felix acitve want to... und else nicht
      this.follownav();
      console.log("after navanaus following locatio is: " + this.loconoff)
     // this.map.setView([this.lat, this.long]);

    });
  }


  loadmap() {
    // Define and add Leaflet Map with OSM TileLayer
    this.map = leaflet.map("map");
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attributions: 'OpenStreetMap',
    }).addTo(this.map);

    this.map.setZoom(17);
    this.map.setView([0,0])
    //this.map.setView([this.lat, this.long]);

    console.log('MapLoadSuccsess');
    console.log("lat: " + this.lat + "long: " + this.long);

    this.map.on("dragstart", function(e) {
        console.log("Dragging the Map")
        //this.changebool();
        this.loconoff = false;
        console.log("watchmapdragged" + this.watch)
        //this.watch = this.geolocation.watchPosition();
        //this.watch = this.geolocation.clearWatch();
        //this.watch.clearWatch();
        //this.geolocation.clearWatch(this.watch);
        //Geolocation.clearWarch;
        console.log("post Drag: " + this.loconoff);
        //var marker = e.target;
        //var position = marker.getLatLng();
        //this.map.panTo(new leaflet.LatLng(position.lat, position.lng));
      }
    );

  }


  opencheckbox(){
    this.navCtrl.push(CheckboxPage);
  }


  zoomonlocation(){
    this.map.setView([this.lat, this.long], 17);
  }


  startstopfollow() {
    console.log("changebool")
    console.log(this.loconoff);

    this.loconoff = !this.loconoff;
    console.log(this.loconoff);
  }


  follownav() {
    console.log("navanaus")
    console.log(this.loconoff)
    if (this.loconoff === true) {
      //this.map.followLocation({watch:true, setView: true, zoom: 17})
      //this.watch.subscribe();
      this.map.setView([this.lat, this.long]);
      this.buttonColor = "primary";
    } else {
      //this.watch.unsubscribe();
      //this.watch.unsubscribe;
      //this.watch.unsubscribe();
      //this.map.followLocation({watch:true, setView: false, zoom: 17})
      this.buttonColor = "light";
    }
  }


  filter() {
    let alert = this.alertCtrl.create();

    alert.setTitle('Anzeigefilter');

    alert.addInput({
      type: 'checkbox',
      label: 'Sondermüll',
      value: 'value1',
      checked: true
    });

    alert.addInput({
      type: 'checkbox',
      label: 'Hausmüll',
      value: 'value2',
      checked: true
    });

    alert.addInput({
      type: 'checkbox',
      label: 'Grünabfälle',
      value: 'value3',
      checked: true
    });

    alert.addInput({
      type: 'checkbox',
      label: 'Sperrmüll',
      value: 'value4',
      checked: true
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'Okay',
     /* handler: data => {
        console.log('Checkbox data:', data);
        this.testCheckboxOpen = false;
        this.testCheckboxResult = data;
      }*/
    });
    alert.present();
  }

/*
  mapisdragged(){
    console.log("pre Drag: " + this.loconoff);
    this.map.on("dragstart", function(e) {
      console.log("Dragging the Map")
      //this.changebool();
      this.loconoff = false;
        console.log("watchmapdragged" + this.watch)
      //this.watch = this.geolocation.watchPosition();
      //this.watch = this.geolocation.clearWatch();
      //this.watch.clearWatch();
      //this.geolocation.clearWatch(this.watch);
      //Geolocation.clearWarch;
      console.log("post Drag: " + this.loconoff);
      //var marker = e.target;
      //var position = marker.getLatLng();
      //this.map.panTo(new leaflet.LatLng(position.lat, position.lng));
    }
    );
  }

 */


}



