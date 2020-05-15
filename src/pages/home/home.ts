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
  jsondata: any; // Data received form Databank containing Illegal Trash
  timestamp: any; // Timestamp of USer Position Coords
  loconoff: boolean = true; // Boolean for updating Map view
  watch: any; // Keeps watching user Position
  locationsubscription: any; // Subsription of watch
  bluedot: any; // The BlueDot showing users position
  loading:any; // Loading Spinner Animation
  hausmuellarr: any = []; // Filtered Array from DB Data
  gruenabfallarr: any = []; // Filtered Array from DB Data
  sondermuellarr: any = []; // Filtered Array from DB Data
  sperrmuellarr: any = []; // Filtered Array from DB Data
  filterbool: boolean; // Indicates if Data was filtered
  markers:any; // Markers Layer Group
  dataFromOtherPage: any = null; // Filtered Data Object
  hausmarker: any; // Layergroup single marker
  gruenabfall: any; // Layergroup single marker
  sondermuell: any; // Layergroup single marker
  spermuell: any; // Layergroup single marker
  fmarkers: any; //Layergroup of all Filtered Markers
  connectSubscription: any; // Network Connection subscription
  disconnectSubscription: any; // Network Disconnection subscription
  alert: any; // Alert Window
  filtercontainer: any; //Filterbutton
  //markerarr: any = [];
  filteralert:any;

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
  ) {

  }

//todo Felix: Filter, Popups, Style, Fehler abfangen, Kommentieren, Fehler abfangen, Text
//todo Tristan: Legende, Permission, Style, Fehler abfangen, Kommentieren, Fehler abfangen, Text
//todo Lasse: Kommentieren, Style, Fehler abfangen,Text

  /***
   * On Start
   */
  ionViewDidEnter() {

    // Watch Network for Disconnection
    this.disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      //delete old LoadingSpinners, create new one, present it
      this.dismissLoading()
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
      this.dismissLoading();
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
    this.dismissLoading();
    this.loading = this.loadingCtrl.create({
      content: 'Loading App',
      spinner: 'circles'
    });
    this.loading.present();
    this.loadmap();
    //this.getLocation();
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
    // Save remove Map if existent
    if (this.map != undefined && this.map != null) {
      // Prevent loss of Blue dot by Page changes by removing it from the map and setting it null
      if(this.bluedot!=null) {
        this.map.removeLayer(this.bluedot);
        this.bluedot = null;
        console.log("bluedot removed on loadmap");
      }
      console.log("map removed");
      this.map.remove();
      this.map=null;

    }


    // Save remove old containers if existent
    if(container != null){
      console.log("container");
      container._leaflet_id = null;
    }
    if(this.filtercontainer != null){
      console.log("filtercontainer");
      this.filtercontainer._leaflet_id = null;
    }
    if(addcontainer != null){
      console.log("filtercontainer");
      addcontainer._leaflet_id = null;
    }

    // Define and add Leaflet Map using Open Street Map
    this.map = leaflet.map("map"); //Already init oder undefined
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    // try run showBlueDot in case location is there already
    this.showBlueDot();


    // set  initial zoom and view if no location found yet
    if (this.lat == null || this.lat == undefined) {
      this.map.setZoom(6);
      this.map.setView([51.163361, 10.447683])
    } else {
      this.map.setZoom(17);
      this.map.setView([this.lat, this.long]);
    }

    //Create containers for buttons on the Map
    var container = leaflet.DomUtil.get('map');
    this.filtercontainer = leaflet.DomUtil.get('map');
    var addcontainer = leaflet.DomUtil.get('map');

    // Button to follow Location
    var navigationbutton = leaflet.Control.extend({
      options: {
        position: 'topleft',
      },
      onAdd: function (map) {
        container = leaflet.DomUtil.create('control');
        container.type = "button";
        container.style.backgroundImage = "url('/assets/icon/bxs-navigation.svg')";
        container.style.backgroundColor = "white";
        container.style.backgroundSize = '100%';
        container.style.width = '34px';
        container.style.height = '34px';
        container.style.borderStyle = 'solid';
        container.style.borderWidth = '1px';
        container.style.borderRadius= '3px';
        container.style.borderColor = 'grey';

        // Onclick change Button style and change boolean this.loconoff
        container.onclick = function() {
          if (this.loconoff == true) {
            container.style.backgroundImage = "url('/assets/icon/bx-navigation.svg')";
            //container.style.backgroundColor = "light";
            this.loconoff = false;
          } else if (this.loconoff == false) {
            container.style.backgroundImage = "url('/assets/icon/bxs-navigation.svg')";
            //container.style.backgroundColor = "primary";
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
        this.filtercontainer.style.backgroundImage = "url('/assets/icon/funnel-outline.svg')";
        this.filtercontainer.style.backgroundColor = "light";
        this.filtercontainer.style.backgroundSize = '100%';
        this.filtercontainer.style.width = '50px';
        this.filtercontainer.style.height = '50px';
        this.filtercontainer.style.borderStyle = 'solid';
        this.filtercontainer.style.borderWidth = '0px';
        this.filtercontainer.style.borderRadius= '3px';
        this.filtercontainer.style.borderColor = 'grey';
        this.filtercontainer.style.padding = '10px';
        this.filtercontainer.style.marginLeft = '0px';
        this.filtercontainer.style.marginBottom = '10px';
        this.filtercontainer.style.marginRight = '18px';


        this.filtercontainer.onclick = function() {
          if(this.jsondata != null){
          if (this.filterbool == false|| this.filterbool == undefined) {
            this.filtercontainer.style.backgroundImage = "url('/assets/icon/funnel-outline.svg')";
            //this.filtercontainer.style.backgroundColor = "light";
            this.openfilterbox();
          } else if (this.filterbool == true) {
            this.filtercontainer.style.backgroundImage = "url('/assets/icon/funnel.svg')";
            //filtercontainer.style.backgroundColor = "primary";
            this.openfilterbox();
          }
        }else{
            this.dismissAlert();
            this.showAlertnoData();
          }}
        .bind(this)
        return this.filtercontainer;
      }.bind(this)
    });

    // Button to Submit Data
    var addbutton = leaflet.Control.extend({
      options: {
        position: 'bottomright',
      },
      onAdd: function (map) {
        addcontainer = leaflet.DomUtil.create('control');
        addcontainer.type = "button";
        addcontainer.style.backgroundImage = "url('/assets/icon/add.svg')";
        addcontainer.style.backgroundColor = "primary";
        addcontainer.style.backgroundSize = '100%';
        addcontainer.style.width = '70px';
        addcontainer.style.height = '70px';
        addcontainer.style.borderStyle = 'solid';
        addcontainer.style.borderWidth = '0px';
        addcontainer.style.borderRadius= '3px';
        addcontainer.style.borderColor = 'grey';
        addcontainer.style.marginLeft = '10px';
        addcontainer.style.marginBottom = '10px';

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
        container.style.backgroundImage = "url('/assets/icon/bx-navigation.svg')";
        container.style.backgroundColor = "white";
        this.loconoff = false;
      }.bind(this)
    );

    // Getting called when Map is ready
    // retrive Data from Database getDBData()
    this.map.whenReady(function(e){
        console.log("Map is ready")
        this.mapinit = true;
        this.getLocation();
      this.getDBData();
      }.bind(this)
    );

    // Adds a legend
    var legend = leaflet.control({position: 'bottomleft'});
    legend.onAdd = this.getLegend;

    this.map.addControl(new navigationbutton());
    this.map.addControl(new addbutton());
    this.map.addControl(new filterbutton());
    legend.addTo(this.map);

    this.map.invalidateSize();
  }


  /***
   *
   */
  getLegend() {

    var div = leaflet.DomUtil.create('div', 'info legend');

    div.innerHTML += '<h3>Legende</h3>';
    //div.innerHTML += '<font size="3" style="display: block; line-height: 28px; margin-bottom: 6px"><b>Legende</b></font>';
    div.innerHTML += '<svg height="28" width="20" style="display: block; float: left"> <circle cx="10" cy="14" r="6"' +
      'style="stroke-width:3; stroke:#1e90ff; fill: #1e90ff;fill-opacity: 0.4"/> </svg> ' +
      '<font size="2" style="display: block; line-height: 28px; margin-left: 30px">Standort</font>';
    div.innerHTML += '<img style="margin-right: 12px""; src="/assets/icon/marker-icon-2x-blue.png"> ' +
      '<font size="2">Müllablagerung</font>';

    return div;
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
      this.map.setZoom(17);
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
  showBlueDot() {
    if (this.lat != null && this.long != null) {
      if (this.bluedot == null) {
        console.log("no bluedot");
        console.log('Creating Dot Options');
        const bluedotoptions = {
          color: '#1e90ff',
          fillColor: '#1e90ff',
          fillOpacity: 0.5,
          radius: 5
        }
        this.bluedot = leaflet.circleMarker([this.lat, this.long], bluedotoptions);
        this.bluedot.addTo(this.map);
        console.log("added bluedot");
      } else {
        console.log("moving bluedot");
        let latlng = leaflet.latLng(this.lat, this.long);

        this.bluedot.setLatLng(latlng);
      }
      this.bluedot.bindPopup(' <b> Ihre Position:  </b>' + '<br>' + 'Latitude: ' + this.lat + '</br>' + 'Longitude: ' + this.long + '</br>');
    } else {
    console.log("no location");
    }
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
      this.map.setZoom(17);
      this.map.setView([this.lat, this.long]);
    } else {
      //console.log("Follow GPS is OFF")
    }
  }


  /***
   * Gets called when Map is ready in loadmap()
   * uses restProvider to getData()
   * returns data to this.dbdata when finished
   * uses data to initiate setMarker(data)
   * @return data //Database Json Data containing Trash-Objects to be used for Markers on the Map
   */
  getDBData() {

    // run getData() in restProvider
    // then setMarker()
    this.restProvider.getData()
      .then(data => {
        JSON.stringify(data, null,2);
        console.log(data);

        this.setMarker(data);

        return (data)
      });
  }


  /***
   * Gets called in getDBData() when getData()request finished
   * @params data JsonData containing Marker Information
   * If No Data - show Alert
   * If data is not filtered create and show markers - create popups - page load finished
   * else run setFilterMarker()
   */
  setMarker(data){
    console.log('filterbool!!')
    console.log(this.filterbool)
    //remove old markers if existent
    if(this.markers!=null) {
      this.map.removeLayer(this.markers);
      this.markers = null;
    }
    // if data wasnt filtered before
    if (this.filterbool==false || this.filterbool == undefined) {
      // if data is empty throw error with an Alert
      if(this.filterbool== false){
        this.showAlertnofilter();
      }
      if(data == 404 || data == null || data == undefined){
        console.log("404nodata");
        this.dismissLoading();
        this.dismissAlert();
        this.showAlertnoData();
      } else {
        // not filtered, data no empty or error, set markers
        this.setDefaultMarker(data)
        // Dismiss alerts as program finished with succsess
        this.dismissAlert();
        // Program finished and shows data or alert. dismiss loading spinner
        this.dismissLoading();
      }
    } else {
      // this.filterbool == true, set filtered markers
      this.setFilterMarker();
      // Dismiss alerts as program finished with succsess
      this.dismissAlert();
      // Program finished and shows data or alert. dismiss loading spinner
      this.dismissLoading();
    }
    this.dismissLoading();
    }




  /***
   * Gets called in setMarker() if Filterboolean is false
   * @param data jsondata containing Trash information from getDBData() / setMarker()
   * Removes old markers
   * Creates new Layergroups of markers with popups and ands them on the map
   */
  setDefaultMarker(data){
    this.jsondata = data.result;
    this.markers = new leaflet.layerGroup().addTo(this.map);
    console.log("setMarker");
    console.log(this.jsondata);


    //addcontainer.style.backgroundImage = ;
    for (let i = 0; i < this.jsondata.length; i++) {
      //Markerfarbe
      let onemarker = new leaflet.marker([this.jsondata[i].latitude, this.jsondata[i].longitude]);

      let markerarr = [];
      if (this.jsondata[i].hausmuell == true) {
        markerarr.push('<br> Hausmüll');
      }
      if (this.jsondata[i].gruenabfall == true) {
        markerarr.push('<br> Grünabfall');
      }
      if (this.jsondata[i].sperrmuell == true) {
        markerarr.push('<br> Sperrmüll');
      }
      if (this.jsondata[i].sondermuell == true) {
        markerarr.push('<br> Sondermüll');
      }
      //this.marker.bindPopup('<br>' + this.jsondata[i].time + ' <br> Gemeldet von: ' + this.jsondata[i].username + '<br>' + markerarr);
      onemarker.bindPopup('<b>Vorgefundene Abfallarten:</b> ' + markerarr + '<br> <b>Gemeldet von: </b> ' + this.jsondata[i].username);
      this.markers.addLayer(onemarker);
    }
    console.log("DefaultMarkersadded");
  }




  /***
   * Gets called in setMarker() if Filterboolean is true
   * uses Data from Filterpage which is subscribed on push to the Page
   * Removes old markers
   * Creates new Layergroups of markers and ands them on the map
   * If data is  filtered create and show markers - create popups - page load finished
   */
  setFilterMarker(){
    // Create Layer groups
    this.fmarkers = new leaflet.layerGroup().addTo(this.map);
    // Create Sub-Layer groups
    this.hausmarker = new leaflet.layerGroup().addTo(this.map);
    this.gruenabfall = new leaflet.layerGroup().addTo(this.map);
    this.sondermuell = new leaflet.layerGroup().addTo(this.map);
    this.spermuell = new leaflet.layerGroup().addTo(this.map);

    console.log("setfilterMarker");

    //addcontainer.style.backgroundImage = ;
    for (let i = 0; i < this.hausmuellarr.length; i++) {
      //Markerfarbe
      let hausmarker = new leaflet.marker([this.hausmuellarr[i].latitude, this.hausmuellarr[i].longitude]);

      let markerarr = [];
      if (this.hausmuellarr[i].hausmuell == true) {
        markerarr.push('<br> Hausmüll');
      }
      if (this.hausmuellarr[i].gruenabfall == true) {
        markerarr.push('<br> Grünabfall');
      }
      if (this.hausmuellarr[i].sperrmuell == true) {
        markerarr.push('<br> Sperrmüll');
      }
      if (this.hausmuellarr[i].sondermuell == true) {
        markerarr.push('<br> Sondermüll');
      }
      //this.marker.bindPopup('<br>' + this.jsondata[i].time + ' <br> Gemeldet von: ' + this.jsondata[i].username + '<br>' + markerarr);
      hausmarker.bindPopup('<b>Vorgefundene Abfallarten:</b> ' + markerarr + '<br> <b>Gemeldet von: </b> ' + this.hausmuellarr[i].username);
      this.fmarkers.addLayer(hausmarker);
    }
    console.log("filterMarkersadded");
    /*
    // run through Array if its not undefined. set markers, bind popups, add to layergroup fmakers
    if (this.hausmuellarr != undefined) {
      for (let i = 0; i < this.hausmuellarr.length; i++) {
        this.hausmarker = new leaflet.marker([this.hausmuellarr[i].latitude, this.hausmuellarr[i].longitude]);
        this.hausmarker.bindPopup('<br>' + this.hausmuellarr[i].time + ' <br> Username: ' + this.hausmuellarr[i].username + '<br>' + ' Hausmuell');
        this.fmarkers.addLayer(this.hausmarker);
      }
    }
    console.log('okayklappt')
    if (this.sperrmuellarr != undefined) {
      for (let i = 0; i < this.sperrmuellarr.length; i++) {
        this.spermuell = new leaflet.marker([this.sperrmuellarr[i].latitude, this.sperrmuellarr[i].longitude]);
        this.spermuell.bindPopup('<br>' + this.sperrmuellarr[i].time + ' <br> Username: ' + this.sperrmuellarr[i].username + '<br>' + ' Sperrmuell');
        this.fmarkers.addLayer(this.spermuell);
      }
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
        console.log('klappt auch ganz toll')
      }
    }
    // Add Layergroup Filteredmakers fmakers to map
    this.fmarkers.addTo(this.map);

    console.log("fMarkers added");
*/
    // unsubscribe event to collect data from filter
    this.events.unsubscribe('custom-user-events'); // unsubscribe this event

    // Set Filterbutton Image on used status (blue)
    this.filtercontainer.style.backgroundImage = "url('/assets/icon/funnel.svg')";
  }


  /***
   * Opens Page to submit Data
   * pushes params data, coords and time to ChecboxPage
   */
  opencheckbox(){
    if(this.lat!=null) {
      this.navCtrl.push(CheckboxPage,
        {
          data: this.jsondata,
          long: this.long,
          lat: this.lat,
          time: this.timestamp,
        }, {}, function (e) {
          console.log("data pushed");
        }
      );
    } else{
      this.showAlertnoLoc();
    }
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
      this.sondermuellarr = filterdata.sondermuellarr;
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

  // Dismiss Loading Spinner and set in null
  dismissLoading(){
    while (this.loading != null) {
      this.loading.dismissAll();
      this.loading = null;
    }
  }

  // Dismiss Alert Window and set in null
  dismissAlert(){
    while (this.alert!=null){
      this.alert.dismiss();
      this.alert = null;
    }
  }


  /***
   *
   */
  showAlertnoLoc() {
    // remove alert if existent
    this.dismissAlert();
    // create new alert
    this.alert = this.alertCtrl.create({
      title: 'Konnte keinen Standort finden!',
      subTitle: 'Benötige GPS Daten zum Melden von Müllablagerungen.',
      buttons: [
        {
          text: 'OK',
          handler: () => {
          }
        }]
    });


    // Present the alert
    this.alert.present();
  }
  showAlertnofilter() {
    // remove alert if existent
    this.dismissAlert();
    // create new alert
    this.filteralert = this.alertCtrl.create({
      title: 'Filterfehler!',
      subTitle: 'Die Daten konnten nach den von Ihnen eingegebenen Kriterien nicht gefiltert werden.',
      buttons: [
        {
          text: 'OK',
          handler: () => {
          }
        }]
    });


    // Present the alert
    this.filteralert.present();
  }
  /***
   *
   */
  showAlertnoData() {
    // remove alert if existent
    this.dismissAlert();
    // create new alert
    this.alert = this.alertCtrl.create({
      title: 'Keine Verbindung zum Server!',
      subTitle: 'App nur eingeschränkt nutzbar.',
      buttons: [
        // Retry Button dismisses loading spinner and fires startApp()
        {
          text: 'Retry',
          handler: () => {
            this.dismissLoading()
            this.startApp()
          }
        },
        // OK Button dismisses loading
        {
        text: 'OK',
        handler: () => {
          this.dismissLoading()
          // Close App
          //this.platform.exitApp()
        }
      }]
    });
    // Present the alert
    this.alert.present();
  }

  /***
   * Ionic Lifecycle Event when Page closes
   * dismiss all loading and Alert windows
   */
  ionViewDidLeave() {
    console.log("didleave");
    this.dismissAlert();
    this.dismissLoading();
  }
}


