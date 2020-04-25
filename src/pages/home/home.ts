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

    this.map = leaflet.map("map");
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attributions: 'OpenStreetMap',
    }).addTo(this.map);

  }

}
