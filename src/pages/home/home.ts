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
  map: any; // Leaflet Map
  lat: any; // Latitude of User Position Coords
  long: any; // Longitude of User Position Coords
  coords: any; // Coordinations of User Position
  dbdata: any; // Data received form Databank containing Illegal Trash
  jsondata: any; // Data received form Databank containing Illegal Trash
  marker: any; // Markers to be placed on the map
  timestamp: any; // Timestamp of USer Position Coords
  loconoff: boolean = true; // Boolean for updating Map view
  buttonColor: any; // ?? // Redundant Button
  watch: any; // Keeps watching user Position
  locationsubscription: any; // Subsription of watch
  bluedot: any; // The BlueDot showing users position
  testCheckboxResult: any; //?
  testCheckboxOpen: any; //?
  options: any //?
  data:any //?
  loading:any; // Loading Spinner Animation
  hausmuellarr: any = []; // Filtered Array from DB Data
  gruenabfallarr: any = []; // Filtered Array from DB Data
  sondermuellarr: any = []; // Filtered Array from DB Data
  sperrmuellarr: any = []; // Filtered Array from DB Data
  filterbool: boolean = false; // Indicates if Data was filtered
  markers:any; // Markers
  dataFromOtherPage: any = null; // Filtered Data Object
  hausmarker: any; // Layergroup single marker
  gruenabfall: any; // Layergroup single marker
  sondermuell: any; // Layergroup single marker
  spermuell: any; // Layergroup single marker
  fmarkers: any; //Layergroup of all Markers
  connectSubscription: any; // Network Connection subscription
  disconnectSubscription: any; // Network Disconnection subscription
  alert: any; // Alert Window
  filtercontainer: any; //Filterbutton





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
   * run mit: ionic serve / ionic cordova run android/browser
   * (Network check ist drin - bitte mal testen)
   * Filter added, neue arrays/layergroups könnten eingefärbt werden
   * Buttons added - style fehlt noch etwas
   * Welche Fehler treten auf die wir abfangen müssen?
   */

  /***
   * On Start
   */
  ionViewDidEnter() {
    //Create and present Loading Spinner
    this.loading = this.loadingCtrl.create({
      content: 'Checking Internet Connection',
      spinner: 'circles'
    });
    //this.loading.present();

    // Watch Network for Disconnection
    this.disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      //delete old LoadingSpinners, create new one, present it
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


    // Watch Network for Re-Connection
    this.connectSubscription = this.network.onConnect().subscribe(() => {
      //Dismiss Loading Spinner
      console.log('network connected!');
      if (this.loading != null) {
        this.loading.dismissAll();
        this.loading = null;
      }
      //Wait 2 seconds and (re)start the App
      setTimeout(() => {
        if (this.network.type != 'none') {
          this.startApp();
          console.log("have connection");
        }
      }, 2000);
    });


    // Start App if Network is Connected. Else Show Spinner no Connection
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
  }

  /***
   * Dismiss Spinners - Create Load App Spinner
   * Starts the Application by running loadmap() and getLocation()
   */
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
   * Get the Initial Position of the User
   * Starts showBlueDot() to display user position on the map
   * Starts followLocation() to keep watching Users Location changes
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

  /***
   * Get the Updated Position of the User by subcribing changes of watch using Geolocation
   * Starts showBlueDot() to display/update user position on the map
   * Starts follownav () to keep watching Users Location changes
   */
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

  /***
   * Creates or moves a Blue dot displaying the users position on the map
   * @param this.lat Latitude of Users Position
   * @param this.long Longitude of Users Position
   * @param this.bluedot Blue Dot (Leaflet Circle Marker) showing Users Location on the Map
   */
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
      console.log("moving bluedot");
      let latlng = leaflet.latLng(this.lat, this.long);

      this.bluedot.setLatLng(latlng);
      //.addTo(this.map);
      //this.bluedot.addTo(this.map);
    }
    this.bluedot.bindPopup('You are here'+'<br>'+ 'Latitude: ' + this.lat + '</br>' + 'Longitude: ' + this.long + '</br>');
  }

  /***
   * Gets called on Location changes by followLocation() this.watch/thislocationsubsciption
   * @param this.loconoff Boolean indicating if MapView will update on Users position or not
   * @param Changes NavigationButtonColor if required
   */
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

  /***
   * Gets called on startApp()
   * Creates a Leaflet Map
   * Adds Containers/Buttons on the Map (Navigation, Filter...)
   * Event Listener OnDrag turns off updating the Mapview on Location changes
   * Adds a Legend on the Map
   * Calls getDBData() when Map is loaded and ready
   */
  loadmap() {
    if (this.map != undefined) {
      console.log("map removed")
      this.map.remove();
    }
    this.map = leaflet.map("map"); //Already init oder undefined

    if(container != null){
      console.log("container");
      container._leaflet_id = null;
    }
    if(filtercontainer != null){
      console.log("filtercontainer");
      filtercontainer._leaflet_id = null;
    }



      leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(this.map);
      this.map.setZoom(25);
      this.map.setView([0, 0])


    //Create containers on the Map
    var container = leaflet.DomUtil.get('map');
    var filtercontainer = leaflet.DomUtil.get('map');
    var addcontainer = leaflet.DomUtil.get('map');

    // Button to follow Location
    var navigationbutton = leaflet.Control.extend({
      options: {
        position: 'topleft',
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

    // Button to filter Data
    var filterbutton = leaflet.Control.extend({
      options: {
        position: 'topright',
      },
      onAdd: function (map) {
        this.filtercontainer = leaflet.DomUtil.create('control');
        this.filtercontainer.type = "button";
        //this.filtercontainer.style.icon ='funnel';
        this.filtercontainer.style.backgroundImage = "url('/assets/icon/filter2.jpg')";
        this.filtercontainer.style.backgroundColor = "light";
        this.filtercontainer.style.backgroundSize = '100%';
        this.filtercontainer.style.width = '34px';
        this.filtercontainer.style.height = '34px';
        this.filtercontainer.style.borderStyle = 'solid';
        this.filtercontainer.style.borderWidth = '1px';
        this.filtercontainer.style.borderRadius= '3px';
        this.filtercontainer.style.borderColor = 'grey';
        this.filtercontainer.style.padding = '10px';

        this.filtercontainer.onclick = function() {
          if (this.filterbool == false) {
            //filtercontainer.style.backgroundImage = "url('/assets/icon/filter2.jpg')";
            this.filtercontainer.style.backgroundColor = "light";
            console.log("clicked false")
            this.openfilterbox();
          } else if (this.filterbool == true) {
            //filtercontainer.style.backgroundImage = "url('/assets/icon/filteron.jpg')";
            filtercontainer.style.backgroundColor = "primary";
            console.log("clicked true")
            this.openfilterbox();
          }
        }.bind(this)
        return this.filtercontainer;
      }.bind(this)
    });

    // Button to Submit Data
    var addbutton = leaflet.Control.extend({
      options: {
        position: 'bottomleft',
      },
      onAdd: function (map) {
        addcontainer = leaflet.DomUtil.create('control');
        addcontainer.type = "button";
        addcontainer.style.backgroundImage = "url('/assets/icon/navpfeilblue.jpg')";
        addcontainer.style.backgroundColor = "primary";
        addcontainer.style.backgroundSize = '100%';
        addcontainer.style.width = '34px';
        addcontainer.style.height = '34px';
        addcontainer.style.borderStyle = 'solid';
        addcontainer.style.borderWidth = '1px';
        addcontainer.style.borderRadius= '3px';
        addcontainer.style.borderColor = 'grey';

        addcontainer.onclick = function() {
            this.opencheckbox();
        }.bind(this)
        return addcontainer;
      }.bind(this)
    });

    // getting called when map is dragged
    // deactivates updating setview by setting loconoff = false
    // change ButtonTheme
    this.map.on("dragstart", function(e) {
        console.log("Dragging the Map")
        container.style.backgroundImage = "url('/assets/icon/navpfeilblack.jpg')";
        container.style.backgroundColor = "light";
        this.loconoff = false;
      }.bind(this)
    );

    // Getting called when Map is ready
    // retrive Data from Database getDBData()
    this.map.whenReady(function(e){
        console.log("Map is ready")
        this.mapinit = true;
        this.getDBData();
      }.bind(this)
    );

    // Adds a legend
    var legend = leaflet.control({position: 'bottomright'});
    legend.onAdd = this.getLegend;

    this.map.addControl(new navigationbutton());
    this.map.addControl(new filterbutton());
    this.map.addControl(new addbutton());

    legend.addTo(this.map);
    this.map.invalidateSize();
  }

  /***
   *
   */
  getLegend() {

    var div = leaflet.DomUtil.create('div', 'info legend');

    div.innerHTML += '<h3>Legende</h3>';
    div.innerHTML += '<svg height="20" width="20"> <circle cx="10" cy="10" r="5"' +
      'style="stroke-width:3; stroke:dodgerblue; fill: dodgerblue;fill-opacity: 0.4"/> </svg>';
    div.innerHTML += 'Standort' + '<br>';
    // Hier Bild von Marker
    div.innerHTML += '<img src="/assets/icon/marker.jpg">';
    div.innerHTML += 'Müllablagerung';

    return div;
  }

  /***
   * Gets called when Map is ready in loadmap()
   * uses restProvider to getData()
   * returns data to this.dbdata when finished
   * uses data to initiate setMarker(data)
   * @return data //Database Json Data containing Trash-Objects to be used for Markers on the Map
   */
  getDBData() {
    // Create Loading Spinner
    if (this.loading != null) {
      this.loading.dismissAll();
      this.loading = null;
    }
    this.loading = this.loadingCtrl.create({
      content: 'Getting Server Data',
      spinner: 'circles'
    });
    this.loading.present();

    // run getData() in restProvider
    // then setMarker()
    this.restProvider.getData()
      .then(data => {
        JSON.stringify(data, null,2);
        console.log(data);
        this.dbdata = data;

        this.setMarker(data);

        return (data)
      });
  }

  /***
   * Gets called in getDBData() when getData()request finished
   * @params data JsonData containing Marker Information (this.dbdata)
   * If No Data - show Alert
   * If data is not filtered create and show markers - create popups - page load finished
   * else run setFilterMarker()
   */
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
        //this.showBlueDot();
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

  /***
   * Gets called in setMarker() if Filterboolean is true
   * uses Data from Filterpage which is subscribed on push to the Page
   * Removes old markers
   * Creates new Layergroups of markers and ands them on the map
   * If data is  filtered create and show markers - create popups - page load finished
   */
  setFilterMarker(){
    if(this.markers!=null) {
      this.map.removeLayer(this.markers);
      this.markers = null;
    }
    if(this.marker!=null){
      this.marker = null;
    }

    this.fmarkers = new leaflet.layerGroup().addTo(this.map);

    this.hausmarker = new leaflet.layerGroup().addTo(this.map);
    this.gruenabfall = new leaflet.layerGroup().addTo(this.map);
    this.sondermuell = new leaflet.layerGroup().addTo(this.map);
    this.spermuell = new leaflet.layerGroup().addTo(this.map);

    console.log("setfilterMarker");

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
    //this.showBlueDot();
    this.fmarkers.addTo(this.map);
    console.log("Markers added");

    if (this.loading != null) {
      this.loading.dismissAll();
      this.loading = null;
    }
    this.events.unsubscribe('custom-user-events'); // unsubscribe this event
    console.log("filtermarker duchlaufen");
    this.filtercontainer.style.backgroundImage = "url('/assets/icon/filteron.jpg')";
  }


  /***
   * Opens Page to submit Data
   * pushes params data, coords and time to ChecboxPage
   */
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

  /***
   * Opens Page to filter data
   * @param data
   * pushes params data to Filterbox Page
   * Subscribing returend Data from filterbox.ts
   * @return filtered data
   */
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
      },{},function(e){
        console.log("data pushed");
      }
    );
  }

  /***
   * Opens Page to filter data
   * @param data
   * pushes params data to Filterbox Page
   * Subscribing returend Data from filterbox.ts
   * @return filtered data
   */
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

  /***
   * Ionic Lifecycle Event when Page closes
   */
  ionViewDidLeave() {
    console.log("didleave");
    //this.bluedot = null;
    if (this.loading != null) {
      this.loading.dismissAll();
      this.loading = null;
    }
  }
}


