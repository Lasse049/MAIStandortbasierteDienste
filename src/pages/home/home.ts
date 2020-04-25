import {Component, ElementRef, ViewChild} from '@angular/core';
import { NavController } from 'ionic-angular';

import leaflet from 'leaflet';
import { Geolocation } from '@ionic-native/geolocation';
import {RestProvider} from "../../providers/rest/rest";

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

  constructor(
    public navCtrl: NavController,
    private geolocation: Geolocation,
    public restProvider: RestProvider
    ) {
    this.getUsers();

  }

  ionViewDidEnter() {
    this.getLocation();
    this.loadmap();
  }

  getUsers() {
    this.restProvider.getData()
      .then(data => {
        if(data['trash'])
        this.dbdata = data;
        console.log(this.dbdata);
      });
  }

  /**
   * getData()
   * get Data from Database (Rest Provider)
   */
  getData(){
    this.restProvider.getData()
      /*
      .then(data => {
        if(data['status'] == 201){
          // convert data into JSON-string, no replacer, whitespace 2
          JSON.stringify(data, null,2);
          // call function setMarkerForDamage and handover data
          this.setMarkerForDamage(data);
        }
      });
      */
  }

  getLocation(){
    this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude
      this.long = resp.coords.longitude
    }).catch((error) => {
      console.log('Error getting location', error);
    });

    let watch = this.geolocation.watchPosition();
    watch.subscribe((data) => {
      // data can be a set of coordinates, or an error (if an error occurred).
      this.lat = data.coords.latitude
      this.long = data.coords.longitude
      console.log('LocationSucsess' + this.lat +this.long);
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
    this.map.setView([52, 8]);
    console.log('MapLoadSuccsess');
  }

}
