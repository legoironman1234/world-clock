import { location_names } from "./locations.js";

const map = L.map('map', {
    minZoom: 1.5,
    maxZoom: 10,
});

const OSM_attribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
    attribution: OSM_attribution,
    noWrap: false
    
}).addTo(map);

map.setView([27,0],0);


const URL = 'IATAairports.json';
let airports = new Map()

let location_lat = new Map();
let location_lon = new Map();
let location_tz = new Map();

let markers = []
let tooltips = []

fetch(URL)
    .then(response => response.json())
    .then(data => {
        data.forEach(item => {            
            airports.set(item.iata, item);
        });
        makeMarkers(airports)
    })
    .catch(error => {
        console.error('Error fetching JSON data:', error);
    });


function makeMarkers (airports) {
    findCityInfo(airports)
    plotMarkers()
    plotTooltips()

    setInterval(function() {
        displayTimes()
    }, 1000)
}

function findCityInfo (airports) {
    // console.log(location_names)
    location_names.forEach(name => {
        let lat = 0; let lon = 0; let tz = "UTC";
        if (name != "UTC" && name != "GMT") {
            //If UTC, the default should do
            const port = airports.get(name)
            lat = port.lat; lon = port.lon; tz = port.tz;            
        }
        // console.log(name, lat, lon, tz)
        // TODO: Make this a json object instead (one key multiple values)
        setInfo(name, lat, lon, tz)
    })
}

function setInfo(name, lat, lon, tz) {
    location_lon.set(name, lat); 
    location_lat.set(name, lon); 
    location_tz.set(name, tz);
}

function plotMarkers () {
    location_names.forEach(name => {
        const lat = location_lat.get(name)
        const lon = location_lon.get(name)
        const Icon = L.icon({
            iconUrl: 'img/black-dot.png',
            iconSize:     [7,7], // size of the icon
        });
        const marker = L.marker([lon, lat], {icon: Icon});
        // marker.bindPopup(name);
        
        marker.addTo(map);
        
        markers.push(marker)
    })
}

function plotTooltips () {
    const times = document.querySelectorAll("output")
    for (let i = 0; i < times.length; i++) {
        const name = location_names[i]
        const lat = location_lat.get(name)
        const lon = location_lon.get(name)
        const time_str = times[i].innerHTML
        const time = time_str.substring(0, time_str.length - 3)

        const tooltip = L.tooltip({
            permanent: true
        })
            .setLatLng([lon, lat])
            .setContent(`${name}<br/>${time}`)
            .addTo(map);

        tooltips.push(tooltip)
    }
}

function displayTimes() {
    const times = document.querySelectorAll("output")
    for (let i = 0; i < times.length; i++) {
        const name = location_names[i]
        
        const time_str = times[i].innerHTML
        const time = time_str.substring(0, time_str.length - 3)

        const tooltip = tooltips[i]

        tooltip.setContent(`${name}<br/>${time}`)
    }
}

