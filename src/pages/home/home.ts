import {Component, ElementRef, ViewChild} from '@angular/core';
import { NavController } from 'ionic-angular';

import leaflet from 'leaflet';
import { Geolocation } from '@ionic-native/geolocation';
import {RestProvider} from "../../providers/rest/rest";
import {ajax} from "rxjs/observable/dom/ajax";
import {ajaxPost} from "rxjs/observable/dom/AjaxObservable";

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

  constructor(
    public navCtrl: NavController,
    private geolocation: Geolocation,
    public restProvider: RestProvider
  ) {
  }

  ionViewDidEnter() {
    this.getDBData();
    this.getLocation();
    this.loadmap();
    this.followBlueDot();


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
      this.lat = resp.coords.latitude
      this.long = resp.coords.longitude
      // initial View
      this.map.setView([this.lat, this.long]);
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

/*
    let watch = this.geolocation.watchPosition();
    watch.subscribe((data) => {
      // data can be a set of coordinates, or an error (if an error occurred).
      this.lat = data.coords.latitude
      this.long = data.coords.longitude
      this.map.setView([this.lat, this.long]);
      console.log('LocationSucsess' + this.lat + this.long);

    });
    //this.showBlueDot(this.lat, this.long)
  }

*/




/*
  showBlueDot(lat,long){
    const bluedotoptions = {
      color: 'blue',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: leaflet.accuracy
    }

    console.log('Showing Blue dot' + lat + long);
    //let bluedot = leaflet.circle([lat, long],bluedotoptions).addTo(this.map);
    leaflet.marker([lat, long],bluedotoptions).addTo(this.map);

  }
  */


  followBlueDot() {
    let watch = this.geolocation.watchPosition();
    watch.subscribe((data) => {
      // data can be a set of coordinates, or an error (if an error occurred).
      this.lat = data.coords.latitude
      this.long = data.coords.longitude
      this.map.setView([this.lat, this.long]);
      console.log('LocationSucsess' + this.lat + this.long);
    });
  }



  loadmap() {

    // Define and add Leaflet Map with OSM TileLayer
    this.map = leaflet.map("map");
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attributions: 'OpenStreetMap',
    }).addTo(this.map);

    this.map.setZoom(17);
    //this.map.setView([this.lat, this.long]);
    console.log('MapLoadSuccsess');
  }

}
