async function radiusAdressesFunction(fileContent){

    try {

        let markersToDisplay = [];
        let totalUniqueScreens = new Set();
        let unfoundAdresses = [];

        let myIcon = L.icon({
            iconUrl: './img/blue-yellow-pin.png',
            iconSize: [45, 45],
            iconAnchor: [22.5, 45],
            popupAnchor: [0, -45]
        });

        for (let address of fileContent) {

            await new Promise(resolve => setTimeout(resolve, 500)); // adding a 0,5 sec delay -> ajust it if necessary

            let screensPerPoint = new Set();

            let addressLng;
            let addressLat;
            let data;

            if (address["Country"].toLowerCase()  == "portugal"){ // first API call with nominatim for Portugal addresses. I did'nt find any gov API.

                let portugalURL = `https://nominatim.openstreetmap.org/search?street=${address["Street address"]}&city=${address["City"]}&country=${address["Country"]}&format=json`
                let response = await fetch(portugalURL);
                data = await response.json();

                addressLng = parseFloat(data[0].lon);
                addressLat = parseFloat(data[0].lat);

            } else if (address["Country"].toLowerCase()  == "spain" // second API call with a gov API from Spain. Works better.
                    || address["Country"].toLowerCase()  == "españa"
                    || address["Country"].toLowerCase()  == "espagne"){

                address["Street address"] = removeSpecialCharacters(address["Street address"]);
                address["City"] = removeSpecialCharacters(address["City"]);
    
                data = await new Promise((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: `https://www.cartociudad.es/geocoder/api/geocoder/findJsonp?q=${address["Street address"]},${address["City"]}`,
                        dataType: 'jsonp',
                        success: function (data) {
                            resolve(data);
                        },
                        error: function (error) {
                            reject(error);
                        }
                    });
                });

                console.log(address["Street address"])
                console.log(address["City"])

                addressLng = data.lng;
                addressLat = data.lat;

            }

            if (data.length == 0) { // If the address is not found, create an object of its data

                let unfoundData = {};

                unfoundData["Name"] = address["Name"];
                unfoundData["Street address"] = address["Street address"];
                unfoundData["ZIP code"] = address["ZIP code"];
                unfoundData["City"] = address["City"];
                unfoundData["Country"] = address["Country"];
                unfoundData["Radius (meters)"] = address["Radius (meters)"];

                unfoundAdresses.push(unfoundData)

                continue;

            };

            let pointTurfFrom = turf.point([addressLng, addressLat])

            ttdScreensLayer.eachLayer(function (layer) {
        
                let pointTurfTo = turf.point([layer.feature.geometry.coordinates[0], layer.feature.geometry.coordinates[1]]);

                let distance = turf.distance(pointTurfFrom, pointTurfTo, { units: "meters" });
                if (distance < address["Radius (meters)"] && !totalUniqueScreens.has(layer)) {
                    totalUniqueScreens.add(layer);
                };
                if (distance < address["Radius (meters)"]) {
                    screensPerPoint.add(layer);
                };
            });

            selectedCPM = []

            screensPerPoint.forEach(layer => {

                selectedCPM.push(layer.feature.properties[`FloorCPM($)`]);

            });

            var cpmAverage = (selectedCPM.reduce((acc, val) => acc + val, 0) / selectedCPM.length).toFixed(2)

            let popupUserContent =
            `
            <div class="first-row-popup"><span class="popup-title">${address["Name"] != null ? address["Name"] : "-"}</span><div class="popup-badge popup-adress-tag">Adress</div></div><br>
            <span style="font-weight:600">Adresse</span> : ${address["Street address"]}, ${address["ZIP code"]}, ${address["City"]}<br>
            <span style="font-weight:600">Radius</span> : ${address["Radius (meters)"]}m<br><br>
            <hr><br>
            <div class="forecast-popup">
            <div class="screens-section forecast-section">
                <img src="./img/screens.svg" alt="" class="screens-img-popup">
                <span class="span-img-popup">${screensPerPoint.size}</span>
            </div>
            <div class="cpm-section forecast-section">
                <img src="./img/cpm.svg" alt="" class="cpm-img-popup">
                <span class="span-img-popup">${cpmAverage == "NaN" ? "- " : cpmAverage}$</span>
            </div>
            <div class="contacts-section forecast-section">
                <img src="./img/contacts.svg" alt="" class="contacts-img-popup">
                <span class="span-img-popup">--</span>
            </div>
            </div>
            `;

            let marker = L.marker([addressLat, addressLng], {
                icon: myIcon
            });

            marker.bindPopup(popupUserContent,{closeButton: false});

            marker.on('click', function(e) {
                leafletMap.setView(e.target.getLatLng(), 12);
            });
            
            let circle = L.circle([addressLat, addressLng], {
                radius: address["Radius (meters)"],
                fillColor: "blue",
                fillOpacity: 0.1,
            });

            markersToDisplay.push(marker, circle);

        }

        userCsvLayer.addLayer(L.layerGroup(markersToDisplay));

        totalUniqueScreens.forEach(screen => {
        clusterMarkers.addLayer(screen);
        })

        if (unfoundAdresses.length > 0){ // if we have unfound addresses -> download a file with all the missing addresses.

            let workbook = XLSX.utils.book_new();
            let worksheet = XLSX.utils.json_to_sheet(unfoundAdresses);
            XLSX.utils.book_append_sheet(workbook, worksheet, "test");
            downloadWorkbook(workbook, "unfound_adresses.xlsx");

        };

        return {fileType:"radius adresses file",status:"processing: OK",totalScreens:totalUniqueScreens.size,userLayer:markersToDisplay.length/2};

    } catch(error) {

        console.log(error);
        return {fileType:"radius adresses file",status:"processing: NOT OK",errorMessage:error.message};

    };

};
