const map = L.map('map').setView([34.0709, -118.444], 5);

let CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
});

CartoDB_Positron.addTo(map)
// create a new global scoped variable called 'scroller'
// you can think of this like the "map" with leaflet (i.e. const map = L.map('map'))
let scroller = scrollama();

//marker cluster group 
let mcg = L.markerClusterGroup({
    spiderfyOnMaxZoom: false,
	showCoverageOnHover: true,
	zoomToBoundsOnClick: true
}); 
// under59, sixtyfour, sixtynine, overseventy
let under59 = L.featureGroup.subGroup(mcg);
let sixtyfour= L.featureGroup.subGroup(mcg);
let sixtynine = L.featureGroup.subGroup(mcg);
let overseventy = L.featureGroup.subGroup(mcg);

let url = "https://spreadsheets.google.com/feeds/list/1S2rdXU_e0T-APmkcVG8Vjm7XB4og7CUjszqNqqztI14/od6/public/values?alt=json"
fetch(url)
	.then(response => {
		return response.json();
		})
    .then(data =>{
                console.log(data)
                formatData(data)
        }
)

let circleOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
}

let myFieldArray = []

function getDistinctValues(targetField){
    // find out how to add distinct values to an array 

    if (!myFieldArray.includes(targetField)){
        myFieldArray.push(targetField)
    } 
    return targetField
      // append values to array 
}

//visited before website?
var lastVisited = window.localStorage.getItem('last visited');

function recenter() {
    map.flyTo([34.0709, -118.444], 5);
}

function addMarker(thisData){
        // let story = data.ifpossiblepleaseelaborateaboutwhyyouarefearful.
        // console.log(story)
        let theStory;
        // console.log('thisData.fearful')
        // console.log(thisData.fearful.length)
        // console.log('thisData.notfearful')
        // console.log(thisData.notfearful.length)
        if (thisData.fearful.length > 0){
            theStory = thisData.fearful
            console.log('fearful greater than 0 ')
            console.log(thisData.fearful)
        }
        else if (thisData.notfearful.length > 0 ){
            theStory = thisData.notfearful
            console.log('not fearful greater than 0')
            console.log(thisData.notfearful)
        }
        else if (thisData.notfearful.length > 0 && thisData.fearful.length > 0){
            theStory = "Story not provided."
        }
        console.log(theStory)
        let data = {
            ['zip']: thisData.zipcode,
            ['city']: thisData.whatcitydoyouorthepersonyouarerepresentingcurrentlylivein,
            ['age']: thisData.howoldareyouorthepersonyouarerepresenting,
            ['relationship']: thisData.whatisyourrelationshipwiththepersonthatyouarefillingoutthissurveyfor,
            ['story']: theStory,
            ['lat']: thisData.lat,
            ['lng']: thisData.lng,
            ['fear']: thisData.areyoufearfulofgoingoutsideduetotheriseofasianamericanhatecrimes,
            ['iden']: thisData.doyouorthepersonyouarerepresentingidentifyasanasianamericanpacificislander,
            ['gender']: thisData.whatgenderdoyouorthepersonyouarerepresentingidentifyas

        }
        console.log(data)
        createButtons(data.lat,data.lng, data)
        getDistinctValues(data.age)

        console.log('all the distinct fields')
        console.log(myFieldArray)
        colorArray = ['green','blue','red','purple']
        circleOptions.fillColor = colorArray[myFieldArray.indexOf(data.age)]
        console.log("age")
        console.log(data.age)
        let popUp = `<h2>${data.city}</h2><h4> ${data.zip} </h4> `
        if (data.age == "under 59"){         
            
            under59.addLayer(L.circleMarker([data.lat,data.lng],circleOptions).bindPopup(popUp))
            return data.timestamp
        }
        else if (data.age == "60-64") {
            sixtyfour.addLayer(L.circleMarker([data.lat,data.lng],circleOptions).bindPopup(popUp))
        }
        else if (data.age == "65-69") {
            sixtynine.addLayer(L.circleMarker([data.lat,data.lng],circleOptions).bindPopup(popUp))
        }
        else {
            overseventy.addLayer(L.circleMarker([data.lat,data.lng],circleOptions).bindPopup(popUp))
        }
       
        return data   
}

function createButtons(lat,lng,data){
    const newDiv = document.createElement("div"); // adds a new button
    
    let cardContent =  `<h2>${data.city}</h2> <div class='story'> <p> Age: ${data.age} </p> <p> Asian American/Pacific Islander: ${data.iden} </p> <p> Gender identity: ${data.gender} </p> <p>Fearful of going outside: ${data.fear} </p>  Story: ${data.story}</div>`
    newDiv.id = "button"+data.story; // gives the button a unique id
    newDiv.innerHTML = cardContent; // gives it the HTML content
    newDiv.setAttribute("class","card") // add the class called "step" to the button or div
    newDiv.setAttribute("data-step",newDiv.id) // add a data-step for the button id to know which step we are on
    newDiv.setAttribute("lat",lat); // sets the latitude 
    newDiv.setAttribute("lng",lng); // sets the longitude 
    newDiv.addEventListener('click', function(){
        map.flyTo([lat,lng], 15); //this is the flyTo from Leaflet

    })
    const spaceForButtons = document.getElementById('contents')
    spaceForButtons.appendChild(newDiv);//this adds the button to our page.
}

let allLayers;
let testLayer;

function formatData(theData){
        const formattedData = [] /* this arry will eventually be populated with the contents of the spreadsheet's rows */
        const rows = theData.feed.entry
        for(const row of rows) {
          const formattedRow = {}
          for(const key in row) {
            if(key.startsWith("gsx$")) {
                  formattedRow[key.replace("gsx$", "")] = row[key].$t
            }
          }
          formattedData.push(formattedRow)
        }
        console.log(formattedData)
        formattedData.forEach(addMarker)    
        testLayer = overseventy;
        allLayers = L.featureGroup([under59, sixtyfour, sixtynine, overseventy]);
        mcg.addTo(map)
        // console.log(allLayers)
        allLayers.addTo(map)
        map.fitBounds(allLayers.getBounds()); 
        startModal()
        document.getElementById("myBtn").click() // simulate click to start modal
        // setup the instance, pass callback functions
        // use the scrollama scroller variable to set it up
        scroller
        .setup({
            step: ".card", // this is the name of the class that we are using to.card into, it is called "step", not very original
        })
        // do something when you enter a "step":
        .onStepEnter((response) => {
            // you can access these objects: { element, index, direction }
            // use the function to use element attributes of the button 
            // it contains the lat/lng: 
            scrollStepper(response.element.attributes)
        })
        .onStepExit((response) => {
            // { element, index, direction }
            // left this in case you want something to happen when someone
            // steps out of a div to know what story they are on.
        });
}
function scrollStepper(thisStep){
    // optional: console log the step data attributes:
    // console.log("you are in thisStep: "+thisStep)
    let thisLat = thisStep.lat.value
    let thisLng = thisStep.lng.value
    // tell the map to fly to this step's lat/lng pair:
    map.flyTo([thisLat,thisLng])
}
let layers = {

	'<i style="background: green; border-radius: 50%;"></i> Under 59 yrs old ': under59,
	'<i style="background: red; border-radius: 50%;"></i> 60-64 yrs old': sixtyfour,
    '<i style="background: purple; border-radius: 50%;"></i>65-69 yrs old': sixtynine,
	'<i style="background: blue; border-radius: 50%;"></i> Over 70 yrs old': overseventy
}

L.control.layers(null,layers,{collapsed: false}).addTo(map)



function startModal(){

    var modal = document.getElementById("myModal");

    // Get the button that opens the modal
    var btn = document.getElementById("myBtn");
    
    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];
    
    // // When the user clicks the button, open the modal 
    // btn.onclick = function() {
    //   modal.style.display = "block";
    // }
    document.getElementById("myBtn").onclick = function() {
        modal.style.display = "block";};
    
    // document.getElementById("turnOff59").onclick = function() {
    //     if (map.hasLayer(under59)){
    //         map.removeLayer(under59)

    //     }
    //     else{
    //         map.addLayer(under59)
    //     }
    // }
    
    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
      modal.style.display = "none";
    }
    
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
}
// setup resize event for scrollama incase someone wants to resize the page...
window.addEventListener("resize", scroller.resize);