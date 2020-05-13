import {Component, ElementRef, ViewChild} from '@angular/core';
import {Events, LoadingController, NavController, NavParams} from 'ionic-angular';
import leaflet from 'leaflet';
import { Geolocation } from '@ionic-native/geolocation';
import {RestProvider} from "../../providers/rest/rest";
import {CheckboxPage} from "../checkbox/checkbox";
import {FilterboxPage} from "../filterbox/filterbox";
import { AlertController } from 'ionic-angular';
import {Platform} from 'ionic-angular';
import {Network} from "@ionic-native/network/";


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
  locationsubscription: any;
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
  connectSubscription: any;
  disconnectSubscription: any;
  alert: any;





  constructor(
    public navCtrl: NavController,
    public geolocation: Geolocation,
    public restProvider: RestProvider,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public platform: Platform,
    public navParams: NavParams,
    public events: Events,
    public network: Network,
    // Fehlermeldung ignorieren
  ) {

  }

  /***
   * FYI
   * Aktuelle Serverdatei: server22.js
   * run mit: ionic cordova run android/browser
   * ionic serve geht nichtmehr weil plugins jetzt platformabhängig installiert werden
   * (Network check ist drin - bitte mal testen)
   * Filter added, neue arrays/layergroups könnten eingefärbt werden
   * Button added (oben links), sieht kacke aus.
   * Welche Fehler treten auf die wir abfangen müssen?
   */

  /***
   * On Start
   */
  ionViewDidEnter() {
    this.loading = this.loadingCtrl.create({
      content: 'Checking Internet Connection',
      spinner: 'circles'
    });
// watch network for a disconnection
    this.disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      if (this.loading != null) {
        this.loading.dismissAll();
        this.loading = null;
      }
      this.loading = this.loadingCtrl.create({
        content: 'No Internet Connection',
        spinner: 'circles'
      });
      this.loading.present();
      console.log('network was disconnected');
    });

    // stop disconnect watch
    //disconnectSubscription.unsubscribe();


// watch network for a connection
    this.connectSubscription = this.network.onConnect().subscribe(() => {
      console.log('network connected!');
      if (this.loading != null) {
        this.loading.dismissAll();
        this.loading = null;
      }
      setTimeout(() => {
        if (this.network.type != 'none') {
          this.startApp();
          console.log("have connection");
        }
      }, 2000);
    });



    console.log("networktype");
    console.log(this.network.type);
    if(this.network.type == 'none'){
      if (this.loading == null) {
        this.loading = this.loadingCtrl.create({
          content: 'No Internet Connection',
          spinner: 'circles'
        });
        this.loading.present();
        console.log("no connection")
      }
    } else {
      this.startApp()
    }
    // stop connect watch
    //disconnectSubscription.unsubscribe();
    //connectSubscription.unsubscribe();

  }

  startApp(){
    if (this.loading != null) {
      this.loading.dismissAll();
      this.loading = null;
    }
    this.loading = this.loadingCtrl.create({
      content: 'Loading App',
      spinner: 'circles'
    });
    this.loading.present();
    this.loadmap();
    this.getLocation();
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
    this.locationsubscription = this.watch.subscribe((data) => {

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
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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

    // Add custom Button
    var myControl = leaflet.Control.extend({
      options: {
        position: 'topleft',
        //padding: '0px',
        //marginLeft: '1000px'
      },
      onAdd: function (map) {
        container = leaflet.DomUtil.create('control');
        container.type = "button";
        container.style.backgroundImage = "url('/assets/icon/navpfeilblue.jpg')";
        container.style.backgroundColor = "primary";
        container.style.backgroundSize = '100%';
        container.style.width = '34px';
        container.style.height = '34px';
        container.style.borderStyle = 'solid';
        container.style.borderWidth = '1px';
        container.style.borderRadius= '3px';
        container.style.borderColor = 'grey';
        //container.style.marginRight = '2000px';
        //container.position = 'top'

//        container.style.border.style.solid;

/*
        #btn3{
          background-color: rgba(255, 255, 255, 0.9);
          width: 45px;
          height: 45px;
          margin-top: 2%;
          margin-right: 12px;
          border-style: solid;
          border-width: 0.5px;
          border-color: grey;
          border-radius: 3px;
        }

 */

        this.map.on("dragstart", function(e) {
            console.log("Dragging the Map")
          container.style.backgroundImage = "url('/assets/icon/navpfeilblack.jpg')";
          container.style.backgroundColor = "light";
            this.loconoff = false;
          }.bind(this)
        );

        container.onclick = function() {
          if (this.loconoff == true) {
            container.style.backgroundImage = "url('/assets/icon/navpfeilblack.jpg')";
            container.style.backgroundColor = "light";
            console.log("clicked false")
            this.startstopfollow();
            this.loconoff = false;
          } else if (this.loconoff == false) {
            container.style.background
            container.style.backgroundImage = "url('/assets/icon/navpfeilblue.jpg')";
            container.style.backgroundColor = "primary";
            console.log("clicked true")
            this.startstopfollow();
            this.loconoff = true;
          }
        }.bind(this)
        return container;


      }.bind(this)
    });



    this.map.whenReady(function(e){
        console.log("Map is ready")
        this.mapinit = true;
        this.getDBData();
      }.bind(this)
    );

    var legend = leaflet.control({position: 'bottomright'});
    legend.onAdd = this.getLegend;
    
    this.map.addControl(new myControl());
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
      if (this.alert!=null){
        this.alert.dismiss();
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
    this.events.unsubscribe('custom-user-events'); // unsubscribe this event
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
    this.alert = this.alertCtrl.create({
      title: 'Keine Verbindung zum Server!',
      subTitle: 'App nur eingeschränkt nutzbar.',
      buttons: [{
        text: 'OK',
        handler: () => {
          if (this.loading != null) {
            this.loading.dismissAll();
            this.loading = null;
          }
          // Close App
          //this.platform.exitApp()
        }
      }]
    });
    this.alert.present();
  }


  ionViewDidLeave() {
    if (this.loading != null) {
      this.loading.dismissAll();
      this.loading = null;
    }
    if(this.locationsubscription!=null) {
      this.locationsubscription.unsubscribe();
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


