import {Component} from '@angular/core';
import {Events, LoadingController, NavController, NavParams} from 'ionic-angular';
import leaflet from 'leaflet';
import { Geolocation } from '@ionic-native/geolocation';
import {RestProvider} from "../../providers/rest/rest";
import {CheckboxPage} from "../checkbox/checkbox";
import {FilterboxPage} from "../filterbox/filterbox";
import { AlertController } from 'ionic-angular';
import {Platform} from 'ionic-angular';
import {Network} from "@ionic-native/network/";

/**
 *
 * An App which show a Map with users Location
 * Can Receive Trash from Databse and Send Trash to server :)
 * Can Filter Trash, Display it on the map, creates popups
 * Uncrashable
 *
 * HomePage!
 * Loads a Map, shows users position, creates controls
 *
 * @author Lasse Hybbeneth
 * @author Felix
 * @author Tristan
 */


// Angular Metadata
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})


export class HomePage {

  //Class Variables

  // Map and Marker Variables
  map: any; // Leaflet Map
  lat: any; // Latitude of User Position Coords
  long: any; // Longitude of User Position Coords
  coords: any; // Coordinations of User Position
  jsondata: any; // Data received form Databank containing Illegal Trash
  timestamp: any; // Timestamp of USer Position Coords
  loconoff: boolean = true; // Boolean for updating Map view
  bluedot: any; // The BlueDot showing users position
  markers:any; // Markers Layer Group

  // LoadingControl and Alerts
  loading:any; // Loading Spinner Animation
  alert: any; // Alert Window

  // For Filtered Markers/Data
  filtercontainer: any; //Filterbutton
  filteralert:any; // Alert Window for filters
  filtereddata: any = []; // Filtered Array from DB Data
  filterbool: boolean; // Indicates if Data was filtered
  dataFromOtherPage: any = null; // Filtered Data Object
  hausmarker: any; // Layergroup single marker
  gruenabfall: any; // Layergroup single marker
  sondermuell: any; // Layergroup single marker
  spermuell: any; // Layergroup single marker
  fmarkers: any; //Layergroup of all Filtered Markers

  // Network Subscriptions
  connectSubscription: any; // Network Connection subscription
  disconnectSubscription: any; // Network Disconnection subscription

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

  /***
   * Ionic Lifecycle Event
   * Fired when page loades
   * Checks Internet Connection
   * Subscribes Network Connection/Disconnection
   * Shows Loading Spinner
   * Starts the App with startApp()
   */
  ionViewDidEnter() {

    // Watch Network for Disconnection
    this.disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      //delete old LoadingSpinners, create new one, present it
      this.dismissLoading()
      this.loading = this.loadingCtrl.create({
        content: 'Keine Internetverbindung!',
        spinner: 'circles'
      });
      this.loading.present();
    });


    // Watch Network for Re-Connection
    this.connectSubscription = this.network.onConnect().subscribe(() => {
      //Dismiss Loading Spinner
      //Wait 2 seconds and (re)start the App if map wasnt loaded or data from database is empty
      setTimeout(() => {
        if (this.network.type != 'none') {
          if(this.map==null||this.jsondata==null||this.jsondata==404||this.jsondata==undefined){
            this.dismissLoading();
            this.startApp();
          }
          else {
            this.dismissLoading();
          }
        }
      }, 2000);
    });


    // Start App if Network is Connected. Else Show Spinner no Connection
    if(this.network.type == 'none'){
      if (this.loading == null) {
        this.loading = this.loadingCtrl.create({
          content: 'Keine Internetverbindung!',
          spinner: 'circles'
        });
        this.loading.present();
      }
    } else {
      //Start the App
      this.startApp()
    }
  }


  /***
   * Dismiss Spinners - Create Load App Spinner
   * Starts the Application by running loadmap()
   */
  startApp(){
    // Dismiss loading to prevent Errors, create and present Loading Spinner
    this.dismissLoading();
    this.loading = this.loadingCtrl.create({
      content: 'Lade...',
      spinner: 'circles'
    });
    this.loading.present();
    this.loadmap();
  }

  /***
   * Gets called on startApp()
   * Creates a Leaflet Map
   * Adds Containers/Buttons on the Map (Navigation, Filter, Add)
   * Event Listener OnDrag turns off updating the Mapview on Location changes
   * Adds a Legend on the Map
   * Calls getDBData() when Map is loaded and ready
   */
  loadmap() {
    // Save remove Map if existent
    if (this.map != undefined) {
      // Prevent loss of Blue dot by Page changes by removing it from the map and setting it null
      if(this.bluedot!=null) {
        this.map.removeLayer(this.bluedot);
        this.bluedot = null;
      }
      this.map.remove();
      this.map=null;
    }
    // Save remove old containers if existent
    if(container != null){
      container._leaflet_id = null;
    }
    if(this.filtercontainer != null){
      this.filtercontainer._leaflet_id = null;
    }
    if(addcontainer != null){
      addcontainer._leaflet_id = null;
    }

    // Define and add Leaflet Map using Open Street Map
    this.map = leaflet.map("map");
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);


    // set  initial zoom and view if no location found yet
    // use middle of germany
    if (this.lat == null) {
      this.map.setZoom(6);
      this.map.setView([51.163361, 10.447683])
    } else {
      this.map.setZoom(17);
      this.map.setView([this.lat, this.long]);
    }

    //Create containers for buttons on the Map using leaflet domutil
    var container = leaflet.DomUtil.get('map');
    this.filtercontainer = leaflet.DomUtil.get('map');
    var addcontainer = leaflet.DomUtil.get('map');

    // Create a Button to follow Location
    // Active ImageButton State is blue, inactive white
    var navigationbutton = leaflet.Control.extend({
      options: {
        position: 'topleft',
      },
      onAdd: function (map) {
        //Create a Container (Button) on the map using leaflet DomUtil
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
            this.loconoff = false;
          } else if (this.loconoff == false) {
            container.style.backgroundImage = "url('/assets/icon/bxs-navigation.svg')";
            this.loconoff = true;
          }
        }.bind(this)
        return container;
      }.bind(this)
    });

    // Create a Button to filter Data
    var filterbutton = leaflet.Control.extend({
      options: {
        position: 'topright',
      },
      onAdd: function (map) {
        //Create a Container (Button) on the map using leaflet DomUtil
        this.filtercontainer = leaflet.DomUtil.create('control');
        this.filtercontainer.type = "button";
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

        //onclick open filter box
        //prevents loading filter page if no data is found/no connection to server established
        //Change container (Button) Theme to show if data was filtered or not
        this.filtercontainer.onclick = function() {
          if(this.jsondata != null){
            //data is there, go and filter data
          if (this.filterbool == false|| this.filterbool == undefined) {
            this.filtercontainer.style.backgroundImage = "url('/assets/icon/funnel-outline.svg')";
            this.openfilterbox();
          } else if (this.filterbool == true) {
            this.filtercontainer.style.backgroundImage = "url('/assets/icon/funnel.svg')";
            this.openfilterbox();
          }
        }else{
            // No Data to filter, do not run filter page
            this.dismissAlert();
            this.showAlertnoData();
          }}
        .bind(this)
        return this.filtercontainer;
      }.bind(this)
    });

    // Create a Button to Submit Data
    var addbutton = leaflet.Control.extend({
      options: {
        position: 'bottomright',
      },
      onAdd: function (map) {
        //Create a Container (Button) on the map using leaflet DomUtil
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

        // Onclick open Add page (opencheckboxpage)
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
        container.style.backgroundImage = "url('/assets/icon/bx-navigation.svg')";
        container.style.backgroundColor = "white";
        this.loconoff = false;
      }.bind(this)
    );

    // Getting called when Map is ready
    // Map is ready -> get Location
    // retrive Data from Database getDBData()
    this.map.whenReady(function(e){
        this.mapinit = true;
        this.getLocation();
        this.getDBData();
      }.bind(this)
    );

    // Adds a legend on the Map
    var legend = leaflet.control({position: 'bottomleft'});
    legend.onAdd = this.getLegend;

    // Add all Creations on the Map
    this.map.addControl(new navigationbutton());
    this.map.addControl(new addbutton());
    this.map.addControl(new filterbutton());
    legend.addTo(this.map);

    // Refresh the Map
    this.map.invalidateSize();
  }

  /***
   * creates a legend based on innerHTML
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
   * @param this.lat Geolocation Latitude
   * @param this.long Geolocation Longitude
   * @param this.timestamp Geolocation Timestamp
   * @param map The Map
   */
  getLocation() {
    //Requests the Current Position of the User and responds with coordinates and timestamp
    this.geolocation.getCurrentPosition().then((resp) => {
      // On Sucsess
      this.lat = resp.coords.latitude;
      this.long = resp.coords.longitude;
      this.timestamp = resp.timestamp;

      // set initial View on coords
      this.map.setZoom(17);
      this.map.setView([this.lat, this.long]);

      // Start Method to Display a blue dot(circle) on the map and get position updates
      this.showBlueDot();
      this.followLocation();

      // No Location? Do nothing. Cant show a blue dot or follow nothing
    }).catch((error) => {
    });
  }


  /***
   * Get the Updated Position of the User by subcribing changes of watch using Geolocation
   * Starts showBlueDot() to display/update user position on the map
   * Starts follownav () to enable automatic map view updates on location changes
   */
  followLocation() {
      // Watch and Subscribe Location Changes
      let watch = this.geolocation.watchPosition();
      watch.subscribe((data) => {

        // Keep updating Location Params
        this.lat = data.coords.latitude
        this.long = data.coords.longitude
        this.timestamp = data.timestamp;

        // Move Bluedot and check if Mapview needs an update m
        this.showBlueDot();
        this.follownav();
    });
  }


  /***
   * Creates or moves a Blue dot displaying the users position on the map
   * @param this.lat Latitude of Users Position
   * @param this.long Longitude of Users Position
   * @param this.bluedot Blue Dot (Leaflet Circle Marker) showing Users Location on the Map
   * @param this.map The Map
   */
  showBlueDot() {
    if (this.lat != null && this.long != null) {
      // No Bluedot? Create one
      if (this.bluedot == null) {
        // Style a blue Dot
        const bluedotoptions = {
          color: '#1e90ff',
          fillColor: '#1e90ff',
          fillOpacity: 0.5,
          radius: 5
        }
        //Create a Leaflet CircleMarker using given coordinates and bluedotoptions and put in on the map
        this.bluedot = leaflet.circleMarker([this.lat, this.long], bluedotoptions);
        this.bluedot.addTo(this.map);
      } else {
        // Already have a marker! just update its position
        let latlng = leaflet.latLng(this.lat, this.long);
        this.bluedot.setLatLng(latlng);
      }
      // Bind a popup to be displayed on clicking the marker
      this.bluedot.bindPopup(' <b> Ihre Position:  </b>' + '<br>' + 'Latitude: ' + this.lat + '</br>' + 'Longitude: ' + this.long + '</br>');
    } else {
        this.showAlertnoLoc();
    }
  }

  /***
   * Gets called on Location changes by followLocation() this.watch/this.locationsubsciption
   * @param this.loconoff Boolean indicating if MapView will update on Users position or not
   * Changes NavigationButtonColor if required
   */
  follownav() {
    if (this.loconoff) {
      // Keep zoom set to 17 and update view on current position
      this.map.setZoom(17);
      this.map.setView([this.lat, this.long]);
    } else {
      // no Mapview updates wanted. do nothing
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
    // Makes data a json object
    // then use data to setMarker(data)
    this.restProvider.getData()
      .then(data => {
        JSON.stringify(data, null,2);
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
    //remove old markers if existent
    if(this.markers!=null) {
      this.map.removeLayer(this.markers);
      this.markers = null;
    }
    if(this.fmarkers!=null) {
      this.map.removeLayer(this.fmarkers);
      this.markers = null;
    }

    // if data wasnt filtered
    if (this.filterbool== false || this.filterbool == undefined) {
      // could not filter data (wrong day/name/impossible) but we have data so not getting double alert for filter and data
      if(this.filterbool== false && data!=404){
        this.dismissAlert();
        this.showAlertnofilter();
        this.filterbool = undefined;
      }
      // Didnt get any data from the server or request failed
      if(data == 404 || data == null || data == undefined){
        // dismiss all loading and alert. cant continues. show alert "no data"
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
    // Finished, dismiss loadin
    this.dismissLoading();
    }




  /***
   * Gets called in setMarker() if Filterboolean is false
   * @param data jsondata containing Trash information from getDBData() / setMarker()
   * Removes old markers
   * Creates new Layergroups of markers with popups and ands them on the map
   */
  setDefaultMarker(data){
    // transfer data to classvar
    this.jsondata = data.result;

    //Create a Layer Group and place it on the map
    this.markers = new leaflet.layerGroup().addTo(this.map);

    // run through received data json array
    for (let i = 0; i < this.jsondata.length; i++) {

      // Create a marker using datas latitude and longitude
      let onemarker = new leaflet.marker([this.jsondata[i].latitude, this.jsondata[i].longitude]);

      //Create an Array with Found Trash Kinds as String
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

      // Bind a popup to the Marker showing Information
      onemarker.bindPopup('<b>Vorgefundene Abfallarten:</b> ' + markerarr + '<br> <b>Gemeldet von: </b> ' + this.jsondata[i].username);

      // Add Marker to markers LayerGroup (group already on the map)
      this.markers.addLayer(onemarker);
    }
  }

  /***
   * Gets called in setMarker() if Filterboolean is true
   * uses Data from Filterpage which is subscribed on push to the Page
   * Creates Layergroups of markers and ands them on the map
   */
  setFilterMarker(){
    // Create Layer group
    this.fmarkers = new leaflet.layerGroup().addTo(this.map);

    // run through received data json array
    for (let i = 0; i < this.filtereddata.length; i++) {

      // Create a marker using filtered data latitude and longitude
      let onefiltermarker = new leaflet.marker([this.filtereddata[i].latitude, this.filtereddata[i].longitude]);

      let markerarr = [];
      if (this.filtereddata[i].hausmuell == true) {
        markerarr.push('<br> Hausmüll');
      }
      if (this.filtereddata[i].gruenabfall == true) {
        markerarr.push('<br> Grünabfall');
      }
      if (this.filtereddata[i].sperrmuell == true) {
        markerarr.push('<br> Sperrmüll');
      }
      if (this.filtereddata[i].sondermuell == true) {
        markerarr.push('<br> Sondermüll');
      }
      //this.marker.bindPopup('<br>' + this.jsondata[i].time + ' <br> Gemeldet von: ' + this.jsondata[i].username + '<br>' + markerarr);
      onefiltermarker.bindPopup('<b>Vorgefundene Abfallarten:</b> ' + markerarr + '<br> <b>Gemeldet von: </b> ' + this.filtereddata[i].username);
      this.fmarkers.addLayer(onefiltermarker);
    }

    // unsubscribe event to collect data from filter
    this.events.unsubscribe('custom-user-events'); // unsubscribe this event

    // Set Filterbutton Image on used status (blue)
    this.filtercontainer.style.backgroundImage = "url('/assets/icon/funnel.svg')";
  }


  /***
   * Opens Page to submit Data (new found Trash)
   * pushes params data, coords and time to ChecboxPage
   * @param this.jsondata
   * @param this.lat
   * @param this.long
   * @param this.timestamp

   *
   */
  opencheckbox(){
    // If Required Location was found, open CheckboxPage where data can be submitted
    if(this.lat!=null) {
      this.navCtrl.push(CheckboxPage,
        {
          data: this.jsondata,
          long: this.long,
          lat: this.lat,
          time: this.timestamp,
        }, {}, function (e) {
        }
      );
    } else{
      // Need Location to submit Data. Dont open page and show alert
      this.showAlertnoLoc();
    }
  }


  /***
   * Opens Page to filter data
   * @param this.data // prevent loss of data on any dc events
   * pushes params data to Filterbox Page
   * Subscribing returend Data from filterbox.ts
   * @return filtered data
   *     @param this.dataFromOtherPage filtered object
   *     @param this.hausmueelarr array containing trashmarkers where at least hausmuell was true
   *     @param this.gruenabfallarr array containing trashmarkers where at least hausmuell was true
   *     @param this.sperrmuellarr array containing trashmarkers where at least sperrmuell was true
   *     @param this.sondermuellarr array containing trashmarkers where at least sondermuell was true
   *     @param this.filterbool boolean indicating if data was filtered or not
   *      true if filtered, false if it wasnt possible. else it stays undefined
   *     @param this.jsondata passes back the original data
   */
  openfilterbox(){
    // Subscribe Event to get Data from Filter Page
    this.events.subscribe('custom-user-events', (filterdata) => {
      this.dataFromOtherPage = filterdata;
      this.filtereddata = filterdata.fildata;
      this.filterbool = filterdata.filterbool;
      this.jsondata = filterdata.origindata;
    })
    // Open Filter Page
    this.navCtrl.push(FilterboxPage,
      {
        // Push data to prevent loss
        data:this.jsondata,
      },{},function(e){
      }
    );
  }


  /**
   *  Dismiss Loading Spinner and set in null
   */
  dismissLoading(){
    while (this.loading != null) {
      this.loading.dismissAll();
      this.loading = null;
    }
  }

  /**
   *  Dismiss Alert Windos and set in null
   */
  dismissAlert(){
    while (this.alert!=null){
      this.alert.dismiss();
      this.alert = null;
    }
  }


  /***
   * Simple Notification alert to let user know that no Location was found
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

  /***
   *  Simple Notification alert to let user know that data wasnt filtered
   */
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
   *  Notifys the user that no data was found. gives option to restart the app (possible app shutdown commented)
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
            this.getDBData()
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
    this.dismissAlert();
    this.dismissLoading();
  }
}


