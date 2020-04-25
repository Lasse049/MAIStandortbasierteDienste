import {Component, ElementRef, ViewChild} from '@angular/core';
import { NavController } from 'ionic-angular';

import leaflet from 'leaflet';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  //Class Variables
  map: any;

  constructor(public navCtrl: NavController) {

  }

  ionViewDidEnter() {
    this.loadmap();
  }

  loadmap() {

    // Define and add Leaflet Map with OSM TileLayer
    this.map = leaflet.map("map");
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attributions: 'OpenStreetMap',
    }).addTo(this.map);

    this.map.setZoom(17);
    //this.map.setView([this.lat, this.long]);
    this.map.setView([53, 8]);
  }

}
