"use strict"


function getMap(){
	// let mymap = L.map('map').setView([48.8737815, 2.3501649], 9);
	let mymap = L.map('map')
	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
		attribution : 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors,\
					   <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,\
					   Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom     : 18,
		id          : 'mapbox/streets-v11',
		tileSize    : 512,
		zoomOffset  : -1,
		accessToken : 'pk.eyJ1Ijoic29pbXVlbjExIiwiYSI6ImNrNzM0Y2RvcjA4YnMzaG1uaWVyZGxidjcifQ.Ed1yaeFJ8-4ntjFgWIjLAg'
	}).addTo(mymap);
	return mymap;
}

function getUserPosition(data, mymap){
	let position = new Array()
	const greenIcon = L.icon({
		iconUrl: '../img/leaf-green.png',
		// size of the icon
		iconSize:     [38, 95], 
		// size of the shadow
		shadowSize:   [50, 64],
		// point of the icon which will correspond to marker's location
		iconAnchor:   [22, 94], 
		// the same for the shadow
		shadowAnchor: [4, 62],  
		// point from which the popup should open relative to the iconAnchor
		popupAnchor:  [-3, -76] 
	});
	let options = {
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 0
	};
	function success(pos) {
		let crd = pos.coords;
		console.log(`Latitude : ${crd.latitude}`);
		console.log(`Longitude: ${crd.longitude}`);
		console.log(`More or less ${crd.accuracy} meters.`);
		position.push(crd.latitude)
		position.push(crd.longitude)
		mymap.setView([position[0], position[1]], 9);
		L.control.scale().addTo(mymap);
		buildMenu(mymap, data)
		// console.log(menu)
		setInterval(function(){
			// reset center of map when it changes
			// mymap.setView([position[0], position[1]]);
			removeMenu()
			buildMenu(mymap, data)
			setTimeout(function(){
				mymap.setView([position[0], position[1]]);
			}, 2000);
		}, 4000);
		L.marker([position[0], position[1]], {icon: greenIcon}).addTo(mymap).bindPopup('This is the user\'s position');
	}
	function error(err) {
		console.warn(`ERROR(${err.code}): ${err.message}`);
	}
	navigator.geolocation.getCurrentPosition(success, error, options);
}

function getJsonData(){
	let data = null;
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			data = JSON.parse(xhttp.responseText)
		}
	}
	xhttp.open("GET", "./js/restaurants.json", false);
	xhttp.send();
	return data
}

//function doesn't work yet
function getFilterValue(){
	let element = document.getElementById('elementid')
	let value = element.options[element.selectedIndex].value
	let text = element.options[element.selectedIndex].text
	return value
}

//function doesn't work yet
function filterTool(value){
	//empty	
	//empty	
}

// called in setInterval in getUserPosition()
function buildMenu(mymap, data){
	let menu = document.getElementsByClassName("sidenav")[0];
	let newDiv = document.createElement('div')
	let reviewP = document.createElement('p')
	placeRestaurants(data, mymap)
	menu.appendChild(newDiv);
	newDiv.appendChild(reviewP);

	function placeRestaurants(data, mymap){
		let markers = new Array();
		let i = 0;
		for (let restaurant of data) {
			markers[i] = L.marker([restaurant.lat, restaurant.long]).addTo(mymap);
			markers[i].bindPopup(restaurant.name)
			newDiv.innerHTML = restaurant.name;
			if (mymap.getBounds().contains(markers[i].getLatLng()) === true){
				for (let j = 0; j < data[i].ratings.length; j++){
					reviewP.innerHTML = data[i].name + " stars " + data[i].ratings[j].stars
				}
				console.log('hello ' + i)
				i = i + 1;
			}
		}
	}
}

// called in setInterval in getUserPosition()
function removeMenu(){
	let menu = document.getElementsByClassName('sidenav')
	console.log(menu)
	document.body.menu.removeChild('p')
	console.log('ok')
}

function getStreetView(){
	let panorama;
	panorama = new google.maps.StreetViewService(
		document.getElementById('street-view'),
		{
			position: {lat: 37.869260, lng: -122.254811},
			pov: {heading: 165, pitch: 0},
			zoom: 1
		});
}

window.onload = function(event){
	const data = getJsonData()
	const mymap = getMap()
	getUserPosition(data, mymap)
	// getStreetView()
}
