Leaflet.GeoSearch
All Contributors

Demo and Docs: smeijer.github.io/leaflet-geosearch

animation of geosearch

Installation
more docs @ https://smeijer.github.io/leaflet-geosearch/#installation

with npm:

npm install --save leaflet-geosearch
or yarn:

yarn add leaflet-geosearch
Browser support / Polyfills
more docs @ https://smeijer.github.io/leaflet-geosearch/#browser-support--polyfills

This library is written with the latest technologies in mind. Thereby it is required to include some polyfills when you wish to support older browsers. These polyfills are recommended for IE and Safari support:

babel-polyfill, for array.includes support.
unfetch, for fetch requests.
About
This library adds support for geocoding (address lookup, a.k.a. geoseaching) to your (web) application. It comes with controls to be embedded in your Leaflet map.

Check out the docs for various possibilities.

The library uses so-called "providers" to take care of building the correct service URL and parsing the retrieved data into a uniform format. Thanks to this architecture, it is pretty easy to add your own providers, so you can use your own geocoding service(s).

The control comes with a number of default providers:

Algolia
AMap
Bing
Esri
Geocode Earth
Google
LocationIQ
OpenCage
OpenStreetMap
Pelias
Mapbox
GeoApiFR
Geoapify
Although this project is still named leaflet-geosearch, this library is also usable without LeafletJS, and does not have any dependencies whatsoever.

Usage
more docs @ https://smeijer.github.io/leaflet-geosearch/usage

Let's first start with an little example on how to use this control without leaflet. For example as an address lookup on a webshop order form. Perhaps to search for the closest alternative package delivery point? Or to link it to your own custom map component.

// import
import { OpenStreetMapProvider } from 'leaflet-geosearch';

// setup
const provider = new OpenStreetMapProvider();

// search
const results = await provider.search({ query: input.value });
Of course, something like this should be bound to something like a form or input:

import { OpenStreetMapProvider } from 'leaflet-geosearch';

const form = document.querySelector('form');
const input = form.querySelector('input[type="text"]');

form.addEventListener('submit', async (event) => {
event.preventDefault();

const results = await provider.search({ query: input.value });
console.log(results); // » [{}, {}, {}, ...]
});
Instead of es6 async / await you can also use promises like:

provider.search({ query: '...' }).then(function (result) {
// do something with result;
});
Results
The search event of all providers return an array of result objects. The base structure is uniform between the providers. It provides a object like:

const result = {
x: Number, // lon,
y: Number, // lat,
label: String, // formatted address
bounds: [
[Number, Number], // s, w - lat, lon
[Number, Number], // n, e - lat, lon
],
raw: {}, // raw provider result
};
The contents of the raw property differ per provider. This is the unprocessed result from the 3th party service. This property is included for developer convenience. leaflet-geosearch does not use it. If you need to know the contents of this property, you should check the 3th party developer docs. (or use your debugger)

Providers
When OpenStreetMap does not match your needs; you can also choose to use the Algolia, Bing, Esri, Geocode Earth, Google, LocationIQ, OpenCage, or Pelias providers. Most of those providers do however require API keys. See the documentation pages on the relevant organisations on how to obtain these keys.

In case you decide to write your own provider, please consider submitting a PR to share your work with us.

Providers are unaware of any options you can give them. They are simple proxies to their endpoints. There is only one special property, and that is the params option. The difference being; that params will be included in the endpoint url. Often being used for API KEYS, where as the other attributes can be used for provider configuration.

Using with LeafletJS
This project comes with a leaflet control to hook the search providers into leaflet. The example below uses the OpenStreetMap Provider, but you can exchange this with on of the other included providers as well as your own custom made providers. Remember to setup the provider with a key when required (Google and Bing for example).

search control

import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

const provider = new OpenStreetMapProvider();

const searchControl = new GeoSearchControl({
provider: provider,
});

const map = new L.Map('map');
map.addControl(searchControl);
Using with react-leaflet
Usage with react-leaflet is similar to the usage with plain Leaflet. This example uses the new MapBoxProvider and adds an api key to the params list when accessing the remote API. Note the useMap hook which is the only notable diffrence to the leaflet example.

import { GeoSearchControl, MapBoxProvider } from 'leaflet-geosearch';
import { useMap } from 'react-leaflet';
import "leaflet-geosearch/assets/css/leaflet.css";

const SearchField = ({ apiKey }) => {
const provider = new MapBoxProvider({
params: {
access_token: apiKey,
},
});

// @ts-ignore
const searchControl = new GeoSearchControl({
provider: provider,
});

const map = useMap();
useEffect(() => {
map.addControl(searchControl);
return () => map.removeControl(searchControl);
}, []);

return null;
};
The useEffect hook used in SearchField even allows for conditional rendering of the search field.

import { MapContainer } from 'react-leaflet';
const MyMap = () => {
// ...
return (
<MapContainer>
{showSearch && <SearchField apiKey={apiKey} />}

      {/* ... */}
    </MapContainer>

);
};
GeoSearchControl
There are some configurable options like setting the position of the search input and whether or not a marker should be displayed at the position of the search result.

search button There are two visual styles of this control. One is the more 'leaflet-way' by putting the search control under a button (see image above). And one where the search control is permanently shown as a search bar (see image under using with LeafletJS).

Render style

This render style can be set by the optional style option.

new GeoSearchControl({
provider: myProvider, // required
style: 'bar', // optional: bar|button - default button
}).addTo(map);
AutoComplete

Auto complete can be configured by the parameters autoComplete and autoCompleteDelay. A little delay is required to not DDOS the server on every keystroke.

new GeoSearchControl({
provider: myProvider, // required
autoComplete: true, // optional: true|false - default true
autoCompleteDelay: 250, // optional: number - default 250
}).addTo(map);
Show result

There are a number of options to adjust the way results are visualized.

new GeoSearchControl({
provider: myProvider, // required
showMarker: true, // optional: true|false - default true
showPopup: false, // optional: true|false - default false
marker: {
// optional: L.Marker - default L.Icon.Default
icon: new L.Icon.Default(),
draggable: false,
},
popupFormat: ({ query, result }) => result.label, // optional: function - default returns result label,
resultFormat: ({ result }) => result.label, // optional: function - default returns result label
maxMarkers: 1, // optional: number - default 1
retainZoomLevel: false, // optional: true|false - default false
animateZoom: true, // optional: true|false - default true
autoClose: false, // optional: true|false - default false
searchLabel: 'Enter address', // optional: string - default 'Enter address'
keepResult: false, // optional: true|false - default false
updateMap: true, // optional: true|false - default true
});
showMarker and showPopup determine whether or not to show a marker and/or open a popup with the location text.

marker can be set to any instance of a (custom) L.Icon.

popupFormat is callback function for displaying text on popup.

resultFormat is callback function for modifying the search result texts (e. g. in order to hide address components or change its ordering).

maxMarker determines how many last results are kept in memory. Default 1, but perhaps you want to show the last x results when searching for new queries as well.

retainZoomLevel is a setting that fixes the zoomlevel. Default behaviour is to zoom and pan to the search result. With retainZoomLevel on true, the map is only panned.

animateZoom controls whether or not the pan/zoom moment is being animated.

autoClose closes the result list if a result is selected by click/enter.

keepResult is used to keep the selected result in the search field. This prevents markers to disappear while using the autoClose feature.

updateMap controls whether or not the map re-centers on the selection.

Events

geosearch/showlocation is fired when location is chosen from the result list.

map.on('geosearch/showlocation', yourEventHandler);
geosearch/marker/dragend is fired when marker has been dragged.

map.on('geosearch/marker/dragend', yourEventHandler);
Development
Checkout the providers to see how easy it is to write your own. For research it can be interesting to see the difference between Bing and the others; because Bing does not support CORS, and requires jsonp to be used instead.

In case you decide to write your own provider, please consider submitting a PR to share your work with us.

You can use the docs as "development environment". Please run npm run start to get up and running. The docs will refresh when you change source files.
