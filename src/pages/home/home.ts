import {Component, ElementRef, ViewChild} from '@angular/core';
import { NavController } from 'ionic-angular';

import leaflet from 'leaflet';
import { Geolocation } from '@ionic-native/geolocation';
import {RestProvider} from "../../providers/rest/rest";
import {CheckboxPage} from "../checkbox/checkbox";
import {FilterboxPage} from "../filterbox/filterbox";
import { AlertController } from 'ionic-angular';
import {e} from "@angular/core/src/render3";



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

  constructor(
    public navCtrl: NavController,
    public geolocation: Geolocation,
    public restProvider: RestProvider,
    public alertCtrl: AlertController
  ) {
  }


  ionViewDidEnter() {


    this.getLocation();
    this.loadmap();
    //this.getLocation();
    //this.loadmap();


    //this.mapisdragged();
  }


  getDBData() {
    console.log("HelloWhat")
    this.restProvider.getData()
      .then(data => {
        console.log("GetDBData");
        JSON.stringify(data, null,2);
        console.log(data);
        this.dbdata = data;


        this.setMarker(data);


        return (data)
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
      this.showBlueDot();
      this.followLocation();

    }).catch((error) => {
      console.log('Error getting location', error);
    });

  }


  showBlueDot(){
    console.log("Entered ShowBlueDot")


    //let bluedot = leaflet.circle([lat, long],bluedotoptions).addTo(this.map);


    //leaflet.circleMarker([this.lat, this.long],bluedotoptions).addTo(this.map);

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
      console.log("moving bluedot");
      let latlng = leaflet.latLng(this.lat, this.long);

      this.bluedot.setLatLng(latlng);
        //.addTo(this.map);
      //this.bluedot.addTo(this.map);
    }
    console.log('Showing Blue dot' + this.lat + this.long);
    this.bluedot.bindPopup('You are here'+'<br>'+ 'Latitude: ' + this.lat + '</br>' + 'Longitude: ' + this.long + '</br>');
  }


  followLocation() {
    console.log("prelocation is: " + this.loconoff)
    this.watch = this.geolocation.watchPosition();
    this.subscription = this.watch.subscribe((data) => {
      // data can be a set of coordinates, or an error (if an error occurred).
      this.lat = data.coords.latitude
      this.long = data.coords.longitude
      this.timestamp = data.timestamp;
      //this.watch.setView = false;
      console.log('LocationSucsess' + this.lat + this.long);

      this.showBlueDot();
      this.follownav();

    });
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

/*
    this.map.on("whenReady", function(e){
        console.log("map is ready event triggered")
        this.maplodedsetmarker();
    }.bind(this)
    );
    */


    this.map.whenReady(function(e){
      console.log("map is ready event triggered")
      this.maplodedsetmarker();
    }.bind(this)
    );

    //this.map.on("ready")



    this.map.on("dragend", function(e) {
        console.log("Dragging the Map")
        //let something = e.latlng;
          //console.log(something);
      //this.simplemethod();
        //this.changebool();
        this.loconoff = false;
        //this.follownav();
        //console.log("watchmapdragged" + this.watch)
        //this.watch = this.geolocation.watchPosition();
        //this.watch = this.geolocation.clearWatch();
        //this.watch.clearWatch();
        //this.geolocation.clearWatch(this.watch);
        //Geolocation.clearWarch;
        console.log("post Drag: " + this.loconoff);
        //var marker = e.target;
        //var position = marker.getLatLng();
        //this.map.panTo(new leaflet.LatLng(position.lat, position.lng));
      }.bind(this)


    );



  }

  follownav() {
    console.log("navanaus")
    console.log(this.loconoff)
    if (this.loconoff) {
      console.log("follownav is on")
      this.buttonColor = "primary";
      //this.map.followLocation({watch:true, setView: true, zoom: 17})
      //this.watch.subscribe();
      this.map.setView([this.lat, this.long]);
      //this.map.stopLocate();
      /*
      this.map.locate({
        watch: true,
        setView: true,
        zoom: 15
      })
      */
    } else {
      console.log("follownav is OFF")
      //this.watch.subscription.unsubscribe();
      /*
      this.map.locate({
        watch: true,
        setView: false,
        zoom: 15
      })
      */

      //this.map.stopLocate();
      //this.watch.unsubscribe();
      //this.watch.unsubscribe;
      //this.watch.unsubscribe();
      //this.map.followLocation({watch:true, setView: false, zoom: 17})
      this.buttonColor = "light";
    }
  }


  simplemethod2(){
    console.log("its simple")
  }

  maplodedsetmarker(){
      this.getDBData();
    console.log("its simple")
  }

  opencheckbox(){
    this.navCtrl.push(CheckboxPage);
  }

  openfilterbox(){
    this.navCtrl.push(FilterboxPage);
  }


  zoomonlocation(){
    this.map.setView([this.lat, this.long], 17);
  }


  startstopfollow() {
    console.log("changebool")
    this.loconoff = !this.loconoff;
    this.follownav();
  }
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
    alert.present();
  }

}


