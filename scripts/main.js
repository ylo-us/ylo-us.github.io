var sendButton = document.getElementById("getRequest"),
    requestOption = document.getElementById("options"),
    requestContent = document.getElementById("optionsContent"),
    divContent = document.getElementById("content"),
    tripMode = document.getElementById("trips");
var optionCollapse = true;
var leavePrice = 0;
var finalLeaveResult = [],
    finalReturnResult = [];

createSelections("adultNum", 10, 1);
createSelections("childNum", 10);
createSelections("stopNum", 4, 0);
setMinDate();

//======================================================================================
function createSelections(id, numOfOptions, defaultVal) {
    var form = document.getElementById(id);
    var selection = document.createElement("select");
    selection.setAttribute("id", "select_"+id);
    form.appendChild(selection);

    for (var i = 0; i < numOfOptions; i++) {
        var selectionOption = document.createElement("option");
        selectionOption.setAttribute("value", i);
        selectionOption.setAttribute("id", id+i);
        var selectionOptionText = document.createTextNode(i);
        selectionOption.appendChild(selectionOptionText);
        selection.appendChild(selectionOption);
    }
    
    if (defaultVal) {
        var temp = document.getElementById(id+defaultVal);
        temp.setAttribute("selected", "selected");
    }

}

//======================================================================================
function setMinDate() {
    var currentDate = new Date();
    var day = currentDate.getDate();
    var month = currentDate.getMonth() + 1;
    var year = currentDate.getFullYear();
    if (month < 10) {
        month = "0" + month.toString();
    } else {
        month = month.toString();
    }
    if (day < 10) {
        day = "0" + day.toString();
    } else {
        day = day.toString();
    }
    var minDate = year + "-" + month + "-" + day;
    document.getElementById("leaveDate").setAttribute("min", minDate);
    document.getElementById("leaveDate").setAttribute("value", minDate);
    document.getElementById("returnDate").setAttribute("min", minDate);
}

//======================================================================================
function setLocaleTime(timeStr) {
    timeStr = timeStr.replace("T", " ");
    var idx_cal = timeStr.lastIndexOf(":");
    var hr_cal = parseInt(timeStr.substr((idx_cal-3), 3));
    timeStr = timeStr.slice(0, idx_cal-3) + " UTC " + timeStr.slice(idx_cal-3);
    return timeStr;
    
}

//======================================================================================
function buildResultBlock(Element, attribute, attributeVal, parentNode, infoTxt) {
    var myElement = document.createElement(Element);
    myElement.setAttribute(attribute, attributeVal);
    var myDivResults = document.createElement("div");
    myDivResults.setAttribute("class", "divResults");
    if (infoTxt !== undefined) {
        var txtNode = document.createTextNode(infoTxt);
        myElement.appendChild(txtNode);
    }    
    myDivResults.appendChild(myElement);
    parentNode.appendChild(myDivResults);
}

//======================================================================================
tripMode.addEventListener("click", function() {
    var returnDateLabel = document.getElementById("returnDateShown");
    var returnDate = document.getElementById("returnDate");
    
    if (document.getElementById("oneWay").checked) {
        returnDateLabel.setAttribute("style", "display: none");
    }
    else if (document.getElementById("roundTrip").checked) {   
        returnDateLabel.setAttribute("style", "display: block");
        returnDate.setAttribute("min", document.getElementById("leaveDate").value);  
        console.log(document.getElementById("leaveDate").value);
        document.getElementById("returnDateDiv").style.backgroundColor = "yellow";
        window.setTimeout(function() {
            document.getElementById("returnDateDiv").style.backgroundColor = "azure";    
        }, 300);
        
    }
})

//======================================================================================
requestOption.addEventListener("click", function() {
    
    optionCollapse = !optionCollapse;
    if(optionCollapse) {
        requestOption.setAttribute("aria-expanded", "false");
        //requestContent.setAttribute("style", "margin-top: -10px;");     
        divContent.setAttribute("style", "overflow: hidden; display: none;");
    }
    else {
        requestOption.setAttribute("aria-expanded", "true");
        //requestContent.setAttribute("style", "margin-top: 0px;");
        divContent.setAttribute("style", "overflow: hidden;");
    }
})

//======================================================================================
sendButton.addEventListener("click", function() {
    
    var solutionsVal = document.getElementById("solution").value,
        maxPriceVal = document.getElementById("price").value,
        stopValUser = document.getElementById("stopNum").value,
        leaveTripNode = document.getElementById("resultLeaveTrip"),
        showPrice = document.getElementById("showPrice");
        returnTripNode = document.getElementById("resultReturnTrip");
    
    while (leaveTripNode.firstChild) {
        leaveTripNode.removeChild(leaveTripNode.firstChild);
    }
    
    while (returnTripNode.firstChild) {
        returnTripNode.removeChild(returnTripNode.firstChild);
    }
    
    while (showPrice.firstChild) {
        showPrice.removeChild(showPrice.firstChild);
    }
    
    

    finalLeaveResult = [];
    finalReturnResult = [];
    
    jsonRequestLeaveTrip = {
        request: {
             passengers: {
                adultCount: parseInt(document.getElementById("select_adultNum").value),
                childCount: parseInt(document.getElementById("select_childNum").value),
            },
            slice: [
                {
                    origin: document.getElementById("origin").value.toUpperCase(),
                    destination: document.getElementById("destination").value.toUpperCase(),
                    date: document.getElementById("leaveDate").value                
                }
            ],
            refundable: document.getElementById("refund").checked
        }
    }
    
    if (document.getElementById("roundTrip").checked) {
        jsonRequestReturnTrip = {
            request: {
                passengers: {
                    adultCount: parseInt(document.getElementById("select_adultNum").value),
                    childCount: parseInt(document.getElementById("select_childNum").value),
                },
            slice: [
                {
                    origin: document.getElementById("destination").value.toUpperCase(),
                    destination: document.getElementById("origin").value.toUpperCase(),
                    date: document.getElementById("returnDate").value                
                }
            ],
            refundable: document.getElementById("refund").checked
            }
        }
    }

    if (maxPriceVal != "" && document.getElementById("oneWay").checked) {
        jsonRequestLeaveTrip.request["maxPrice"] = "USD" + maxPriceVal;
    }
    else if (maxPriceVal != "" && document.getElementById("roundTrip").checked) {
        jsonRequestLeaveTrip.request["maxPrice"] = "USD" + maxPriceVal;
        jsonRequestReturnTrip.request["maxPrice"] = "USD" + maxPriceVal;
    };

    if (solutionsVal != "" && document.getElementById("oneWay").checked) {
        jsonRequestLeaveTrip.request["solutions"] = parseInt(solutionsVal);
        getData(jsonRequestLeaveTrip, "resultLeaveTrip", "Leave", finalLeaveResult);
        //console.log(jsonRequestLeaveTrip);
    }
    else if (solutionsVal != "" && document.getElementById("roundTrip").checked) {
        jsonRequestLeaveTrip.request["solutions"] = parseInt(solutionsVal);
        jsonRequestReturnTrip.request["solutions"] = parseInt(solutionsVal);
        
        console.log(jsonRequestLeaveTrip);
        console.log(jsonRequestReturnTrip);
        
        getData(jsonRequestLeaveTrip, "resultLeaveTrip", "Leave", finalLeaveResult);
        getData(jsonRequestReturnTrip, "resultReturnTrip", "Return", finalReturnResult);
    }
    else {
        alert("Please tell me the max number of results you want to know");
    };
    
})

//======================================================================================

function selectTrip(id) {
    
    var allButtons = document.getElementsByName("tripSel");
    var selectionIdx = id.substring(id.length - 1, id.length) - 1;
    var leaveTrips = [],
        returnTrips = [];
    
    for (var i = 0; i < allButtons.length; i++) {
        var sel = allButtons[i].getAttribute("id");
        if (sel.substring(0, 5).toLowerCase() === "leave") {
            leaveTrips.push(allButtons[i]);
        }
        else if (sel.substring(0, 6).toLowerCase() === "return") {
            returnTrips.push(allButtons[i]);
        }
    }
    
    var p = document.getElementById("showPrice");
    while (p.firstChild) {
        p.removeChild(p.firstChild);                    
    }
    
    if (document.getElementById("oneWay").checked) {
        makeSelection(leaveTrips);
        if (budget !== "") {
            for (var i = 0; i < returnTrips.length; i++) {
                var sel = returnTrips[i].getAttribute("id")
                var price = parseFloat(finalLeaveResult[selectionIdx].saleTotal.substring(3));
                console.log(budget - price);
                if ((budget - price) < parseFloat(finalleaveResult[i].saleTotal.substring(3))) {
                    document.getElementById(sel).parentElement.parentElement.setAttribute("style", "opacity: 0.2");
                    document.getElementById(sel).setAttribute("disabled", "true");
                } else if (document.getElementById(sel).parentElement.parentElement.hasAttribute("style")) {
                    document.getElementById(sel).parentElement.parentElement.removeAttribute("style");
                    document.getElementById(sel).removeAttribute("disabled");
                } 
            }
        }        
        leavePrice = finalLeaveResult[selectionIdx].saleTotal.substring(3);
        
        var allAmount = document.createTextNode("$" + leavePrice);
        p.appendChild(allAmount);
    }
    else if (document.getElementById("roundTrip").checked && id.substring(0,5).toLowerCase() === "leave") {
        makeSelection(leaveTrips);
        totalPrice = 0;
        var budget = document.getElementById("price").value;
        if (document.getElementById("leaveDate").value == document.getElementById("returnDate").value) {
            for (var i = 0; i < returnTrips.length; i++) {
                var sel = returnTrips[i].getAttribute("id")
                var arrivalTimeHour = finalLeaveResult[selectionIdx].slice[0].segment[finalLeaveResult[selectionIdx].slice[0].segment.length - 1].leg[0].arrivalTime.substring(11, 13);
                var departureTimeHour = finalReturnResult[i].slice[0].segment[0].leg[0].departureTime.substring(11, 13);
                var price = parseFloat(finalLeaveResult[selectionIdx].saleTotal.substring(3));
                if (document.getElementById(sel).checked) {
                    document.getElementById(sel).checked = false;
                }
                
                if (departureTimeHour <= arrivalTimeHour) {
                    document.getElementById(sel).parentElement.parentElement.setAttribute("style", "opacity: 0.2");
                    document.getElementById(sel).setAttribute("disabled", "true");                                        
                } else if (document.getElementById(sel).parentElement.parentElement.hasAttribute("style")) {
                    document.getElementById(sel).parentElement.parentElement.removeAttribute("style");
                    document.getElementById(sel).removeAttribute("disabled");
                }
                if (budget !== "" && (budget - price) < parseFloat(finalReturnResult[i].saleTotal.substring(3))) {
                    document.getElementById(sel).parentElement.parentElement.setAttribute("style", "opacity: 0.2");
                    document.getElementById(sel).setAttribute("disabled", "true");
                }
                
            }
        } else if (budget !== "") {
            for (var i = 0; i < returnTrips.length; i++) {
                var sel = returnTrips[i].getAttribute("id")
                var price = parseFloat(finalLeaveResult[selectionIdx].saleTotal.substring(3));
                console.log(budget - price);
                if ((budget - price) < parseFloat(finalReturnResult[i].saleTotal.substring(3))) {
                    document.getElementById(sel).parentElement.parentElement.setAttribute("style", "opacity: 0.2");
                    document.getElementById(sel).setAttribute("disabled", "true");
                } else if (document.getElementById(sel).parentElement.parentElement.hasAttribute("style")) {
                    document.getElementById(sel).parentElement.parentElement.removeAttribute("style");
                    document.getElementById(sel).removeAttribute("disabled");
                } 
            }
        }
        leavePrice = parseFloat(finalLeaveResult[selectionIdx].saleTotal.substring(3));
        
    }
    else if (document.getElementById("roundTrip").checked && id.substring(0,6).toLowerCase() === "return") {
        makeSelection(returnTrips);
        var totalPrice = leavePrice + parseFloat(finalReturnResult[selectionIdx].saleTotal.substring(3));
        var allAmount = document.createTextNode("$" + totalPrice);
        p.appendChild(allAmount);
    }
}

//======================================================================================
function makeSelection(tripObj) {
    
    for (var i = 0; i < tripObj.length; i++) {
        var sel = tripObj[i].getAttribute("id");
        if (!document.getElementById(sel).checked) {
            document.getElementById(sel).parentElement.parentElement.setAttribute("style", "opacity: 0.2");
        }
        else {
            document.getElementById(sel).parentElement.parentElement.removeAttribute("style");
        }
    }
    
}

//======================================================================================
function getData(jsonRequestObj, targetDivID, tripDirection, storedArray) {
    //console.log(jsonRequestObj);

    var holder = JSON.stringify(jsonRequestObj);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://www.googleapis.com/qpxExpress/v1/trips/search?key=AIzaSyCdpM_bMNykHOs2j4HDfOSsgCR8TE5HCqE");
    xhr.setRequestHeader("Content-Type", "application/json");
    
    for (var idx = 0; idx < document.getElementsByClassName("line").length; idx++) {
            document.getElementsByClassName("line")[idx].style.display = "inline-block";    
    } 

    xhr.send(holder);
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            //create result block
            for (var idx = 0; idx < document.getElementsByClassName("line").length; idx++) {
                document.getElementsByClassName("line")[idx].style.display = "none";    
            }
                        
            if (xhr.status == 200 || xhr.status == 304) {
                var results = JSON.parse(xhr.responseText);
                //console.log(xhr.responseText);
                //console.log(results);
                var stops = 0;
                var resultText = "";   
                
                if (results.trips.tripOption !== undefined) {
                    var numResults = results.trips.tripOption.length;
                    
                    
                    for (var i = 0; i < numResults; i++) {
                        stops = results.trips.tripOption[i].slice[0].segment.length - 1;
                        if (stops <= document.getElementById("select_stopNum").value) {
                            storedArray.push(results.trips.tripOption[i]);
                        }                        
                    }
                    
                    //console.log(finalResult);
                    
                    if (storedArray.length < 1 && document.getElementById("resultLeaveTrip").firstChild == null) {
                        buildResultBlock("h3", "id", tripDirection + "h3", document.getElementById("resultLeaveTrip"), "Sorry... No result was found. Please add more stops.");
                    }
                    else {
                        var myForm = document.createElement("form");
                        myForm.setAttribute("id", tripDirection + "Trip");
                        for (var i = 0; i < storedArray.length; i++) {
                            stops = storedArray[i].slice[0].segment.length - 1;

                            var myFieldSet = document.createElement("fieldset");
                            myFieldSet.setAttribute("id", tripDirection + "Fieldset" + (i + 1));
                            var myLegend = document.createElement("legend");
                            var legendTxt = document.createTextNode(tripDirection + "Option" + (i + 1));
                            myLegend.appendChild(legendTxt);
                            myFieldSet.appendChild(myLegend);
                            myForm.appendChild(myFieldSet);
                            document.getElementById(targetDivID).appendChild(myForm);

                            buildResultBlock("input", "id", tripDirection + "button" + (i + 1), myFieldSet);
                            document.getElementById(tripDirection + "button" + (i + 1)).setAttribute("type", "radio");
                            document.getElementById(tripDirection + "button" + (i + 1)).setAttribute("class", "selectRadio");
                            document.getElementById(tripDirection + "button" + (i + 1)).setAttribute("name", "tripSel");
                            document.getElementById(tripDirection + "button" + (i + 1)).setAttribute("onclick", "selectTrip(this.id)");
                                                        
                            buildResultBlock("label", "class", "priceOption" + (i + 1), myFieldSet, "Price: " + storedArray[i].saleTotal);
                            buildResultBlock("label", "class", "durationOption" + (i + 1), myFieldSet, "Flight Duration: " + storedArray[i].slice[0].duration + " mins");
                            for (var j = 0; j <= stops; j++) {
                                buildResultBlock("ul", "id", tripDirection + "Stop" + (i + 1) + (j + 1), myFieldSet);
                                buildResultBlock("li", "id", tripDirection + "ListOfStop" + (i + 1) + (j + 1), document.getElementById(tripDirection + "Stop" + (i + 1) + (j + 1)), storedArray[i].slice[0].segment[j].flight.carrier + storedArray[i].slice[0].segment[j].flight.number + " from: " + storedArray[i].slice[0].segment[j].leg[0].origin + "-->" + "to: " + storedArray[i].slice[0].segment[j].leg[0].destination);
                                buildResultBlock("p", "class", "departingTime", document.getElementById(tripDirection + "ListOfStop" + (i + 1) + (j + 1)), "Departure Time: " + setLocaleTime(storedArray[i].slice[0].segment[j].leg[0].departureTime));
                                buildResultBlock("p", "class", "arrivalTime", document.getElementById(tripDirection + "ListOfStop" + (i + 1) + (j + 1)), "Arrival Time: " + setLocaleTime(storedArray[i].slice[0].segment[j].leg[0].arrivalTime));

                            }
                        }
                    }
                }
                else {
                    var resultTable = document.createElement("table");
                    var tableNode = document.createTextNode("No Result Was Found");
                    resultTable.appendChild(tableNode);
                    resultTable.setAttribute("id", "resultTable");
                    document.getElementById(targetDivID).appendChild(resultTable);    
                }                
            }
            else {
                var resultTable = document.createElement("table");
                var tableNode = document.createTextNode("No Result Was Found");
                resultTable.appendChild(tableNode);
                resultTable.setAttribute("id", "resultTable");
                document.getElementById("resultLeaveTrip").appendChild(resultTable);
                var resultTr = document.getElementById("resultTable").insertRow(i);
                var trText = resultTr.insertCell(0);
                trText.innerHTML = "Ooops!! Something went wrong..." + "</br>" + "Please Double Check Your Input Fields" + "</br>" + "HTTP status code: " + xhr.status;
                document.getElementById(targetDivID).appendChild(resultTable);
            }
        }
        
    }
}


//====================================================================================================================
            
/*            
var trip1 = {
 "kind": "qpxExpress#tripsSearch",
 "trips": {
  "kind": "qpxexpress#tripOptions",
  "requestId": "fEMz0XkXNPqcARbfw0OTqm",
  "data": {
   "kind": "qpxexpress#data",
   "airport": [
    {
     "kind": "qpxexpress#airportData",
     "code": "SAN",
     "city": "SAN",
     "name": "San Diego Lindbergh Field"
    },
    {
     "kind": "qpxexpress#airportData",
     "code": "SFO",
     "city": "SFO",
     "name": "San Francisco International"
    }
   ],
   "city": [
    {
     "kind": "qpxexpress#cityData",
     "code": "SAN",
     "name": "San Diego"
    },
    {
     "kind": "qpxexpress#cityData",
     "code": "SFO",
     "name": "San Francisco"
    }
   ],
   "aircraft": [
    {
     "kind": "qpxexpress#aircraftData",
     "code": "319",
     "name": "Airbus A319"
    },
    {
     "kind": "qpxexpress#aircraftData",
     "code": "320",
     "name": "Airbus A320"
    }
   ],
   "tax": [
    {
     "kind": "qpxexpress#taxData",
     "id": "ZP",
     "name": "US Flight Segment Tax"
    },
    {
     "kind": "qpxexpress#taxData",
     "id": "AY_001",
     "name": "US September 11th Security Fee"
    },
    {
     "kind": "qpxexpress#taxData",
     "id": "US_001",
     "name": "US Transportation Tax"
    },
    {
     "kind": "qpxexpress#taxData",
     "id": "XF",
     "name": "US Passenger Facility Charge"
    }
   ],
   "carrier": [
    {
     "kind": "qpxexpress#carrierData",
     "code": "VX",
     "name": "Virgin America Inc."
    }
   ]
  },
  "tripOption": [
   {
    "kind": "qpxexpress#tripOption",
    "saleTotal": "USD80.10",
    "id": "Mcu8jAozBGCMb3nt102FKJ002",
    "slice": [
     {
      "kind": "qpxexpress#sliceInfo",
      "duration": 90,
      "segment": [
       {
        "kind": "qpxexpress#segmentInfo",
        "duration": 90,
        "flight": {
         "carrier": "VX",
         "number": "950"
        },
        "id": "GEmamRaPJSNsdme9",
        "cabin": "COACH",
        "bookingCode": "S",
        "bookingCodeCount": 7,
        "marriedSegmentGroup": "0",
        "leg": [
         {
          "kind": "qpxexpress#legInfo",
          "id": "LWJ+qEPEolYeXHQg",
          "aircraft": "319",
          "arrivalTime": "2016-06-29T08:50-07:00",
          "departureTime": "2016-06-29T07:20-07:00",
          "origin": "SFO",
          "destination": "SAN",
          "originTerminal": "2",
          "destinationTerminal": "2",
          "duration": 90,
          "onTimePerformance": 95,
          "mileage": 447,
          "secure": true
         }
        ]
       }
      ]
     }
    ],
    "pricing": [
     {
      "kind": "qpxexpress#pricingInfo",
      "fare": [
       {
        "kind": "qpxexpress#fareInfo",
        "id": "ASGsaKMVq7aQ789uvvhzwwn8p6BGzGyGYAJshNeQlvq2",
        "carrier": "VX",
        "origin": "SFO",
        "destination": "SAN",
        "basisCode": "S21TWSSL"
       }
      ],
      "segmentPricing": [
       {
        "kind": "qpxexpress#segmentPricing",
        "fareId": "ASGsaKMVq7aQ789uvvhzwwn8p6BGzGyGYAJshNeQlvq2",
        "segmentId": "GEmamRaPJSNsdme9"
       }
      ],
      "baseFareTotal": "USD68.84",
      "saleFareTotal": "USD68.84",
      "saleTaxTotal": "USD19.26",
      "saleTotal": "USD81.10",
      "passengers": {
       "kind": "qpxexpress#passengerCounts",
       "adultCount": 1
      },
      "tax": [
       {
        "kind": "qpxexpress#taxInfo",
        "id": "US_001",
        "chargeType": "GOVERNMENT",
        "code": "US",
        "country": "US",
        "salePrice": "USD5.16"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "AY_001",
        "chargeType": "GOVERNMENT",
        "code": "AY",
        "country": "US",
        "salePrice": "USD5.60"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "XF",
        "chargeType": "GOVERNMENT",
        "code": "XF",
        "country": "US",
        "salePrice": "USD4.50"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "ZP",
        "chargeType": "GOVERNMENT",
        "code": "ZP",
        "country": "US",
        "salePrice": "USD4.00"
       }
      ],
      "fareCalculation": "SFO VX SAN 68.84S21TWSSL USD 68.84 END ZP SFO XT 5.16US 4.00ZP 5.60AY 4.50XF SFO4.50",
      "latestTicketingTime": "2016-06-08T23:59-04:00",
      "ptc": "ADT"
     }
    ]
   },
   {
    "kind": "qpxexpress#tripOption",
    "saleTotal": "USD82.10",
    "id": "Mcu8jAozBGCMb3nt102FKJ003",
    "slice": [
     {
      "kind": "qpxexpress#sliceInfo",
      "duration": 90,
      "segment": [
       {
        "kind": "qpxexpress#segmentInfo",
        "duration": 90,
        "flight": {
         "carrier": "VX",
         "number": "954"
        },
        "id": "GvPWVb34aMZBaAdO",
        "cabin": "COACH",
        "bookingCode": "S",
        "bookingCodeCount": 7,
        "marriedSegmentGroup": "0",
        "leg": [
         {
          "kind": "qpxexpress#legInfo",
          "id": "L0X5up--78uSzZHd",
          "aircraft": "320",
          "arrivalTime": "2016-06-29T13:35-07:00",
          "departureTime": "2016-06-29T12:05-07:00",
          "origin": "SFO",
          "destination": "SAN",
          "originTerminal": "2",
          "destinationTerminal": "2",
          "duration": 90,
          "onTimePerformance": 60,
          "mileage": 447,
          "secure": true
         }
        ]
       }
      ]
     }
    ],
    "pricing": [
     {
      "kind": "qpxexpress#pricingInfo",
      "fare": [
       {
        "kind": "qpxexpress#fareInfo",
        "id": "ASGsaKMVq7aQ789uvvhzwwn8p6BGzGyGYAJshNeQlvq2",
        "carrier": "VX",
        "origin": "SFO",
        "destination": "SAN",
        "basisCode": "S21TWSSL"
       }
      ],
      "segmentPricing": [
       {
        "kind": "qpxexpress#segmentPricing",
        "fareId": "ASGsaKMVq7aQ789uvvhzwwn8p6BGzGyGYAJshNeQlvq2",
        "segmentId": "GvPWVb34aMZBaAdO"
       }
      ],
      "baseFareTotal": "USD68.84",
      "saleFareTotal": "USD68.84",
      "saleTaxTotal": "USD19.26",
      "saleTotal": "USD83.10",
      "passengers": {
       "kind": "qpxexpress#passengerCounts",
       "adultCount": 1
      },
      "tax": [
       {
        "kind": "qpxexpress#taxInfo",
        "id": "US_001",
        "chargeType": "GOVERNMENT",
        "code": "US",
        "country": "US",
        "salePrice": "USD5.16"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "AY_001",
        "chargeType": "GOVERNMENT",
        "code": "AY",
        "country": "US",
        "salePrice": "USD5.60"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "XF",
        "chargeType": "GOVERNMENT",
        "code": "XF",
        "country": "US",
        "salePrice": "USD4.50"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "ZP",
        "chargeType": "GOVERNMENT",
        "code": "ZP",
        "country": "US",
        "salePrice": "USD4.00"
       }
      ],
      "fareCalculation": "SFO VX SAN 68.84S21TWSSL USD 68.84 END ZP SFO XT 5.16US 4.00ZP 5.60AY 4.50XF SFO4.50",
      "latestTicketingTime": "2016-06-08T23:59-04:00",
      "ptc": "ADT"
     }
    ]
   },
   {
    "kind": "qpxexpress#tripOption",
    "saleTotal": "USD84.10",
    "id": "Mcu8jAozBGCMb3nt102FKJ001",
    "slice": [
     {
      "kind": "qpxexpress#sliceInfo",
      "duration": 90,
      "segment": [
       {
        "kind": "qpxexpress#segmentInfo",
        "duration": 90,
        "flight": {
         "carrier": "VX",
         "number": "751"
        },
        "id": "G6UYqadnWec5gEa-",
        "cabin": "COACH",
        "bookingCode": "S",
        "bookingCodeCount": 7,
        "marriedSegmentGroup": "0",
        "leg": [
         {
          "kind": "qpxexpress#legInfo",
          "id": "LdWarpTn0EtsAsG7",
          "aircraft": "320",
          "arrivalTime": "2016-06-29T11:35-07:00",
          "departureTime": "2016-06-29T10:05-07:00",
          "origin": "SFO",
          "destination": "SAN",
          "originTerminal": "2",
          "destinationTerminal": "2",
          "duration": 90,
          "onTimePerformance": 100,
          "mileage": 447,
          "secure": true
         }
        ]
       }
      ]
     }
    ],
    "pricing": [
     {
      "kind": "qpxexpress#pricingInfo",
      "fare": [
       {
        "kind": "qpxexpress#fareInfo",
        "id": "ASGsaKMVq7aQ789uvvhzwwn8p6BGzGyGYAJshNeQlvq2",
        "carrier": "VX",
        "origin": "SFO",
        "destination": "SAN",
        "basisCode": "S21TWSSL"
       }
      ],
      "segmentPricing": [
       {
        "kind": "qpxexpress#segmentPricing",
        "fareId": "ASGsaKMVq7aQ789uvvhzwwn8p6BGzGyGYAJshNeQlvq2",
        "segmentId": "G6UYqadnWec5gEa-"
       }
      ],
      "baseFareTotal": "USD68.84",
      "saleFareTotal": "USD68.84",
      "saleTaxTotal": "USD19.26",
      "saleTotal": "USD84.10",
      "passengers": {
       "kind": "qpxexpress#passengerCounts",
       "adultCount": 1
      },
      "tax": [
       {
        "kind": "qpxexpress#taxInfo",
        "id": "US_001",
        "chargeType": "GOVERNMENT",
        "code": "US",
        "country": "US",
        "salePrice": "USD5.16"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "AY_001",
        "chargeType": "GOVERNMENT",
        "code": "AY",
        "country": "US",
        "salePrice": "USD5.60"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "XF",
        "chargeType": "GOVERNMENT",
        "code": "XF",
        "country": "US",
        "salePrice": "USD4.50"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "ZP",
        "chargeType": "GOVERNMENT",
        "code": "ZP",
        "country": "US",
        "salePrice": "USD4.00"
       }
      ],
      "fareCalculation": "SFO VX SAN 68.84S21TWSSL USD 68.84 END ZP SFO XT 5.16US 4.00ZP 5.60AY 4.50XF SFO4.50",
      "latestTicketingTime": "2016-06-08T23:59-04:00",
      "ptc": "ADT"
     }
    ]
   },
   {
    "kind": "qpxexpress#tripOption",
    "saleTotal": "USD85.10",
    "id": "Mcu8jAozBGCMb3nt102FKJ004",
    "slice": [
     {
      "kind": "qpxexpress#sliceInfo",
      "duration": 90,
      "segment": [
       {
        "kind": "qpxexpress#segmentInfo",
        "duration": 90,
        "flight": {
         "carrier": "VX",
         "number": "958"
        },
        "id": "GK2w4LAYo13Qy9Ki",
        "cabin": "COACH",
        "bookingCode": "S",
        "bookingCodeCount": 7,
        "marriedSegmentGroup": "0",
        "leg": [
         {
          "kind": "qpxexpress#legInfo",
          "id": "L6xboutc1vrRRyxD",
          "aircraft": "320",
          "arrivalTime": "2016-06-29T16:40-07:00",
          "departureTime": "2016-06-29T15:10-07:00",
          "origin": "SFO",
          "destination": "SAN",
          "originTerminal": "2",
          "destinationTerminal": "2",
          "duration": 90,
          "onTimePerformance": 77,
          "mileage": 447,
          "secure": true
         }
        ]
       }
      ]
     }
    ],
    "pricing": [
     {
      "kind": "qpxexpress#pricingInfo",
      "fare": [
       {
        "kind": "qpxexpress#fareInfo",
        "id": "ASGsaKMVq7aQ789uvvhzwwn8p6BGzGyGYAJshNeQlvq2",
        "carrier": "VX",
        "origin": "SFO",
        "destination": "SAN",
        "basisCode": "S21TWSSL"
       }
      ],
      "segmentPricing": [
       {
        "kind": "qpxexpress#segmentPricing",
        "fareId": "ASGsaKMVq7aQ789uvvhzwwn8p6BGzGyGYAJshNeQlvq2",
        "segmentId": "GK2w4LAYo13Qy9Ki"
       }
      ],
      "baseFareTotal": "USD68.84",
      "saleFareTotal": "USD68.84",
      "saleTaxTotal": "USD19.26",
      "saleTotal": "USD86.10",
      "passengers": {
       "kind": "qpxexpress#passengerCounts",
       "adultCount": 1
      },
      "tax": [
       {
        "kind": "qpxexpress#taxInfo",
        "id": "US_001",
        "chargeType": "GOVERNMENT",
        "code": "US",
        "country": "US",
        "salePrice": "USD5.16"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "AY_001",
        "chargeType": "GOVERNMENT",
        "code": "AY",
        "country": "US",
        "salePrice": "USD5.60"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "XF",
        "chargeType": "GOVERNMENT",
        "code": "XF",
        "country": "US",
        "salePrice": "USD4.50"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "ZP",
        "chargeType": "GOVERNMENT",
        "code": "ZP",
        "country": "US",
        "salePrice": "USD4.00"
       }
      ],
      "fareCalculation": "SFO VX SAN 68.84S21TWSSL USD 68.84 END ZP SFO XT 5.16US 4.00ZP 5.60AY 4.50XF SFO4.50",
      "latestTicketingTime": "2016-06-08T23:59-04:00",
      "ptc": "ADT"
     }
    ]
   },
   {
    "kind": "qpxexpress#tripOption",
    "saleTotal": "USD87.10",
    "id": "Mcu8jAozBGCMb3nt102FKJ005",
    "slice": [
     {
      "kind": "qpxexpress#sliceInfo",
      "duration": 90,
      "segment": [
       {
        "kind": "qpxexpress#segmentInfo",
        "duration": 90,
        "flight": {
         "carrier": "VX",
         "number": "960"
        },
        "id": "GZuAQLoJfQIOn5Nl",
        "cabin": "COACH",
        "bookingCode": "S",
        "bookingCodeCount": 7,
        "marriedSegmentGroup": "0",
        "leg": [
         {
          "kind": "qpxexpress#legInfo",
          "id": "LRz8CJBnUiRowOsb",
          "aircraft": "320",
          "arrivalTime": "2016-06-29T18:45-07:00",
          "departureTime": "2016-06-29T17:15-07:00",
          "origin": "SFO",
          "destination": "SAN",
          "originTerminal": "2",
          "destinationTerminal": "2",
          "duration": 90,
          "onTimePerformance": 76,
          "mileage": 447,
          "secure": true
         }
        ]
       }
      ]
     }
    ],
    "pricing": [
     {
      "kind": "qpxexpress#pricingInfo",
      "fare": [
       {
        "kind": "qpxexpress#fareInfo",
        "id": "ASGsaKMVq7aQ789uvvhzwwn8p6BGzGyGYAJshNeQlvq2",
        "carrier": "VX",
        "origin": "SFO",
        "destination": "SAN",
        "basisCode": "S21TWSSL"
       }
      ],
      "segmentPricing": [
       {
        "kind": "qpxexpress#segmentPricing",
        "fareId": "ASGsaKMVq7aQ789uvvhzwwn8p6BGzGyGYAJshNeQlvq2",
        "segmentId": "GZuAQLoJfQIOn5Nl"
       }
      ],
      "baseFareTotal": "USD68.84",
      "saleFareTotal": "USD68.84",
      "saleTaxTotal": "USD19.26",
      "saleTotal": "USD88.10",
      "passengers": {
       "kind": "qpxexpress#passengerCounts",
       "adultCount": 1
      },
      "tax": [
       {
        "kind": "qpxexpress#taxInfo",
        "id": "US_001",
        "chargeType": "GOVERNMENT",
        "code": "US",
        "country": "US",
        "salePrice": "USD5.16"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "AY_001",
        "chargeType": "GOVERNMENT",
        "code": "AY",
        "country": "US",
        "salePrice": "USD5.60"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "XF",
        "chargeType": "GOVERNMENT",
        "code": "XF",
        "country": "US",
        "salePrice": "USD4.50"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "ZP",
        "chargeType": "GOVERNMENT",
        "code": "ZP",
        "country": "US",
        "salePrice": "USD4.00"
       }
      ],
      "fareCalculation": "SFO VX SAN 68.84S21TWSSL USD 68.84 END ZP SFO XT 5.16US 4.00ZP 5.60AY 4.50XF SFO4.50",
      "latestTicketingTime": "2016-06-08T23:59-04:00",
      "ptc": "ADT"
     }
    ]
   }
  ]
 }
}

var trip2 = {
 "kind": "qpxExpress#tripsSearch",
 "trips": {
  "kind": "qpxexpress#tripOptions",
  "requestId": "AnFOd6ZPufFY6i0e80OTqm",
  "data": {
   "kind": "qpxexpress#data",
   "airport": [
    {
     "kind": "qpxexpress#airportData",
     "code": "SAN",
     "city": "SAN",
     "name": "San Diego Lindbergh Field"
    },
    {
     "kind": "qpxexpress#airportData",
     "code": "SFO",
     "city": "SFO",
     "name": "San Francisco International"
    }
   ],
   "city": [
    {
     "kind": "qpxexpress#cityData",
     "code": "SAN",
     "name": "San Diego"
    },
    {
     "kind": "qpxexpress#cityData",
     "code": "SFO",
     "name": "San Francisco"
    }
   ],
   "aircraft": [
    {
     "kind": "qpxexpress#aircraftData",
     "code": "320",
     "name": "Airbus A320"
    }
   ],
   "tax": [
    {
     "kind": "qpxexpress#taxData",
     "id": "ZP",
     "name": "US Flight Segment Tax"
    },
    {
     "kind": "qpxexpress#taxData",
     "id": "AY_001",
     "name": "US September 11th Security Fee"
    },
    {
     "kind": "qpxexpress#taxData",
     "id": "US_001",
     "name": "US Transportation Tax"
    },
    {
     "kind": "qpxexpress#taxData",
     "id": "XF",
     "name": "US Passenger Facility Charge"
    }
   ],
   "carrier": [
    {
     "kind": "qpxexpress#carrierData",
     "code": "VX",
     "name": "Virgin America Inc."
    }
   ]
  },
  "tripOption": [
   {
    "kind": "qpxexpress#tripOption",
    "saleTotal": "USD248.10",
    "id": "4TwN60Km4d0VeC9PnePOE4004",
    "slice": [
     {
      "kind": "qpxexpress#sliceInfo",
      "duration": 90,
      "segment": [
       {
        "kind": "qpxexpress#segmentInfo",
        "duration": 90,
        "flight": {
         "carrier": "VX",
         "number": "969"
        },
        "id": "GDJ9CA4Q-uwH65xW",
        "cabin": "PREMIUM_COACH",
        "bookingCode": "Q",
        "bookingCodeCount": 5,
        "marriedSegmentGroup": "0",
        "leg": [
         {
          "kind": "qpxexpress#legInfo",
          "id": "LZ0XKeZMMooSzOvw",
          "aircraft": "320",
          "arrivalTime": "2016-06-08T21:10-07:00",
          "departureTime": "2016-06-08T19:40-07:00",
          "origin": "SAN",
          "destination": "SFO",
          "originTerminal": "2",
          "destinationTerminal": "2",
          "duration": 90,
          "onTimePerformance": 55,
          "mileage": 447,
          "secure": true
         }
        ]
       }
      ]
     }
    ],
    "pricing": [
     {
      "kind": "qpxexpress#pricingInfo",
      "fare": [
       {
        "kind": "qpxexpress#fareInfo",
        "id": "AW7MLQiwpBeXUMqs/1MUmSDevaswkuAZwGGRNUV/BH3U",
        "carrier": "VX",
        "origin": "SAN",
        "destination": "SFO",
        "basisCode": "QMCSNR"
       }
      ],
      "segmentPricing": [
       {
        "kind": "qpxexpress#segmentPricing",
        "fareId": "AW7MLQiwpBeXUMqs/1MUmSDevaswkuAZwGGRNUV/BH3U",
        "segmentId": "GDJ9CA4Q-uwH65xW"
       }
      ],
      "baseFareTotal": "USD217.67",
      "saleFareTotal": "USD217.67",
      "saleTaxTotal": "USD30.43",
      "saleTotal": "USD248.10",
      "passengers": {
       "kind": "qpxexpress#passengerCounts",
       "adultCount": 1
      },
      "tax": [
       {
        "kind": "qpxexpress#taxInfo",
        "id": "US_001",
        "chargeType": "GOVERNMENT",
        "code": "US",
        "country": "US",
        "salePrice": "USD16.33"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "AY_001",
        "chargeType": "GOVERNMENT",
        "code": "AY",
        "country": "US",
        "salePrice": "USD5.60"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "XF",
        "chargeType": "GOVERNMENT",
        "code": "XF",
        "country": "US",
        "salePrice": "USD4.50"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "ZP",
        "chargeType": "GOVERNMENT",
        "code": "ZP",
        "country": "US",
        "salePrice": "USD4.00"
       }
      ],
      "fareCalculation": "SAN VX SFO 217.67QMCSNR USD 217.67 END ZP SAN XT 16.33US 4.00ZP 5.60AY 4.50XF SAN4.50",
      "latestTicketingTime": "2016-06-08T22:39-04:00",
      "ptc": "ADT"
     }
    ]
   },
   {
    "kind": "qpxexpress#tripOption",
    "saleTotal": "USD248.10",
    "id": "4TwN60Km4d0VeC9PnePOE4002",
    "slice": [
     {
      "kind": "qpxexpress#sliceInfo",
      "duration": 85,
      "segment": [
       {
        "kind": "qpxexpress#segmentInfo",
        "duration": 85,
        "flight": {
         "carrier": "VX",
         "number": "352"
        },
        "id": "GGZrZN+tQrlGfBbd",
        "cabin": "PREMIUM_COACH",
        "bookingCode": "Q",
        "bookingCodeCount": 1,
        "marriedSegmentGroup": "0",
        "leg": [
         {
          "kind": "qpxexpress#legInfo",
          "id": "LHzfiBQPqmf19ps-",
          "aircraft": "320",
          "arrivalTime": "2016-06-08T08:25-07:00",
          "departureTime": "2016-06-08T07:00-07:00",
          "origin": "SAN",
          "destination": "SFO",
          "originTerminal": "2",
          "destinationTerminal": "2",
          "duration": 85,
          "onTimePerformance": 86,
          "mileage": 447,
          "secure": true
         }
        ]
       }
      ]
     }
    ],
    "pricing": [
     {
      "kind": "qpxexpress#pricingInfo",
      "fare": [
       {
        "kind": "qpxexpress#fareInfo",
        "id": "AW7MLQiwpBeXUMqs/1MUmSDevaswkuAZwGGRNUV/BH3U",
        "carrier": "VX",
        "origin": "SAN",
        "destination": "SFO",
        "basisCode": "QMCSNR"
       }
      ],
      "segmentPricing": [
       {
        "kind": "qpxexpress#segmentPricing",
        "fareId": "AW7MLQiwpBeXUMqs/1MUmSDevaswkuAZwGGRNUV/BH3U",
        "segmentId": "GGZrZN+tQrlGfBbd"
       }
      ],
      "baseFareTotal": "USD217.67",
      "saleFareTotal": "USD217.67",
      "saleTaxTotal": "USD30.43",
      "saleTotal": "USD248.10",
      "passengers": {
       "kind": "qpxexpress#passengerCounts",
       "adultCount": 1
      },
      "tax": [
       {
        "kind": "qpxexpress#taxInfo",
        "id": "US_001",
        "chargeType": "GOVERNMENT",
        "code": "US",
        "country": "US",
        "salePrice": "USD16.33"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "AY_001",
        "chargeType": "GOVERNMENT",
        "code": "AY",
        "country": "US",
        "salePrice": "USD5.60"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "XF",
        "chargeType": "GOVERNMENT",
        "code": "XF",
        "country": "US",
        "salePrice": "USD4.50"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "ZP",
        "chargeType": "GOVERNMENT",
        "code": "ZP",
        "country": "US",
        "salePrice": "USD4.00"
       }
      ],
      "fareCalculation": "SAN VX SFO 217.67QMCSNR USD 217.67 END ZP SAN XT 16.33US 4.00ZP 5.60AY 4.50XF SAN4.50",
      "latestTicketingTime": "2016-06-08T09:59-04:00",
      "ptc": "ADT"
     }
    ]
   },
   {
    "kind": "qpxexpress#tripOption",
    "saleTotal": "USD248.10",
    "id": "4TwN60Km4d0VeC9PnePOE4005",
    "slice": [
     {
      "kind": "qpxexpress#sliceInfo",
      "duration": 90,
      "segment": [
       {
        "kind": "qpxexpress#segmentInfo",
        "duration": 90,
        "flight": {
         "carrier": "VX",
         "number": "1178"
        },
        "id": "GnHqxH2EpbTIL+8a",
        "cabin": "PREMIUM_COACH",
        "bookingCode": "Q",
        "bookingCodeCount": 5,
        "marriedSegmentGroup": "0",
        "leg": [
         {
          "kind": "qpxexpress#legInfo",
          "id": "LJYQR+soQGrFJFRF",
          "aircraft": "320",
          "arrivalTime": "2016-06-08T13:50-07:00",
          "departureTime": "2016-06-08T12:20-07:00",
          "origin": "SAN",
          "destination": "SFO",
          "originTerminal": "2",
          "destinationTerminal": "2",
          "duration": 90,
          "onTimePerformance": 77,
          "mileage": 447,
          "secure": true
         }
        ]
       }
      ]
     }
    ],
    "pricing": [
     {
      "kind": "qpxexpress#pricingInfo",
      "fare": [
       {
        "kind": "qpxexpress#fareInfo",
        "id": "AW7MLQiwpBeXUMqs/1MUmSDevaswkuAZwGGRNUV/BH3U",
        "carrier": "VX",
        "origin": "SAN",
        "destination": "SFO",
        "basisCode": "QMCSNR"
       }
      ],
      "segmentPricing": [
       {
        "kind": "qpxexpress#segmentPricing",
        "fareId": "AW7MLQiwpBeXUMqs/1MUmSDevaswkuAZwGGRNUV/BH3U",
        "segmentId": "GnHqxH2EpbTIL+8a"
       }
      ],
      "baseFareTotal": "USD217.67",
      "saleFareTotal": "USD217.67",
      "saleTaxTotal": "USD30.43",
      "saleTotal": "USD248.10",
      "passengers": {
       "kind": "qpxexpress#passengerCounts",
       "adultCount": 1
      },
      "tax": [
       {
        "kind": "qpxexpress#taxInfo",
        "id": "US_001",
        "chargeType": "GOVERNMENT",
        "code": "US",
        "country": "US",
        "salePrice": "USD16.33"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "AY_001",
        "chargeType": "GOVERNMENT",
        "code": "AY",
        "country": "US",
        "salePrice": "USD5.60"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "XF",
        "chargeType": "GOVERNMENT",
        "code": "XF",
        "country": "US",
        "salePrice": "USD4.50"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "ZP",
        "chargeType": "GOVERNMENT",
        "code": "ZP",
        "country": "US",
        "salePrice": "USD4.00"
       }
      ],
      "fareCalculation": "SAN VX SFO 217.67QMCSNR USD 217.67 END ZP SAN XT 16.33US 4.00ZP 5.60AY 4.50XF SAN4.50",
      "latestTicketingTime": "2016-06-08T15:19-04:00",
      "ptc": "ADT"
     }
    ]
   },
   {
    "kind": "qpxexpress#tripOption",
    "saleTotal": "USD248.10",
    "id": "4TwN60Km4d0VeC9PnePOE4003",
    "slice": [
     {
      "kind": "qpxexpress#sliceInfo",
      "duration": 85,
      "segment": [
       {
        "kind": "qpxexpress#segmentInfo",
        "duration": 85,
        "flight": {
         "carrier": "VX",
         "number": "959"
        },
        "id": "GLuidPpb9Q5ESBvU",
        "cabin": "PREMIUM_COACH",
        "bookingCode": "Q",
        "bookingCodeCount": 1,
        "marriedSegmentGroup": "0",
        "leg": [
         {
          "kind": "qpxexpress#legInfo",
          "id": "L-Fcc0QSc+96nHU8",
          "aircraft": "320",
          "arrivalTime": "2016-06-08T15:45-07:00",
          "departureTime": "2016-06-08T14:20-07:00",
          "origin": "SAN",
          "destination": "SFO",
          "originTerminal": "2",
          "destinationTerminal": "2",
          "duration": 85,
          "onTimePerformance": 60,
          "mileage": 447,
          "secure": true
         }
        ]
       }
      ]
     }
    ],
    "pricing": [
     {
      "kind": "qpxexpress#pricingInfo",
      "fare": [
       {
        "kind": "qpxexpress#fareInfo",
        "id": "AW7MLQiwpBeXUMqs/1MUmSDevaswkuAZwGGRNUV/BH3U",
        "carrier": "VX",
        "origin": "SAN",
        "destination": "SFO",
        "basisCode": "QMCSNR"
       }
      ],
      "segmentPricing": [
       {
        "kind": "qpxexpress#segmentPricing",
        "fareId": "AW7MLQiwpBeXUMqs/1MUmSDevaswkuAZwGGRNUV/BH3U",
        "segmentId": "GLuidPpb9Q5ESBvU"
       }
      ],
      "baseFareTotal": "USD217.67",
      "saleFareTotal": "USD217.67",
      "saleTaxTotal": "USD30.43",
      "saleTotal": "USD248.10",
      "passengers": {
       "kind": "qpxexpress#passengerCounts",
       "adultCount": 1
      },
      "tax": [
       {
        "kind": "qpxexpress#taxInfo",
        "id": "US_001",
        "chargeType": "GOVERNMENT",
        "code": "US",
        "country": "US",
        "salePrice": "USD16.33"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "AY_001",
        "chargeType": "GOVERNMENT",
        "code": "AY",
        "country": "US",
        "salePrice": "USD5.60"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "XF",
        "chargeType": "GOVERNMENT",
        "code": "XF",
        "country": "US",
        "salePrice": "USD4.50"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "ZP",
        "chargeType": "GOVERNMENT",
        "code": "ZP",
        "country": "US",
        "salePrice": "USD4.00"
       }
      ],
      "fareCalculation": "SAN VX SFO 217.67QMCSNR USD 217.67 END ZP SAN XT 16.33US 4.00ZP 5.60AY 4.50XF SAN4.50",
      "latestTicketingTime": "2016-06-08T17:19-04:00",
      "ptc": "ADT"
     }
    ]
   },
   {
    "kind": "qpxexpress#tripOption",
    "saleTotal": "USD248.10",
    "id": "4TwN60Km4d0VeC9PnePOE4001",
    "slice": [
     {
      "kind": "qpxexpress#sliceInfo",
      "duration": 85,
      "segment": [
       {
        "kind": "qpxexpress#segmentInfo",
        "duration": 85,
        "flight": {
         "carrier": "VX",
         "number": "963"
        },
        "id": "G3PdYLHyGvovNGWR",
        "cabin": "PREMIUM_COACH",
        "bookingCode": "Q",
        "bookingCodeCount": 1,
        "marriedSegmentGroup": "0",
        "leg": [
         {
          "kind": "qpxexpress#legInfo",
          "id": "LP8LgxqCpmII7G-k",
          "aircraft": "320",
          "arrivalTime": "2016-06-08T18:50-07:00",
          "departureTime": "2016-06-08T17:25-07:00",
          "origin": "SAN",
          "destination": "SFO",
          "originTerminal": "2",
          "destinationTerminal": "2",
          "duration": 85,
          "onTimePerformance": 80,
          "mileage": 447,
          "secure": true
         }
        ]
       }
      ]
     }
    ],
    "pricing": [
     {
      "kind": "qpxexpress#pricingInfo",
      "fare": [
       {
        "kind": "qpxexpress#fareInfo",
        "id": "AW7MLQiwpBeXUMqs/1MUmSDevaswkuAZwGGRNUV/BH3U",
        "carrier": "VX",
        "origin": "SAN",
        "destination": "SFO",
        "basisCode": "QMCSNR"
       }
      ],
      "segmentPricing": [
       {
        "kind": "qpxexpress#segmentPricing",
        "fareId": "AW7MLQiwpBeXUMqs/1MUmSDevaswkuAZwGGRNUV/BH3U",
        "segmentId": "G3PdYLHyGvovNGWR"
       }
      ],
      "baseFareTotal": "USD217.67",
      "saleFareTotal": "USD217.67",
      "saleTaxTotal": "USD30.43",
      "saleTotal": "USD248.10",
      "passengers": {
       "kind": "qpxexpress#passengerCounts",
       "adultCount": 1
      },
      "tax": [
       {
        "kind": "qpxexpress#taxInfo",
        "id": "US_001",
        "chargeType": "GOVERNMENT",
        "code": "US",
        "country": "US",
        "salePrice": "USD16.33"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "AY_001",
        "chargeType": "GOVERNMENT",
        "code": "AY",
        "country": "US",
        "salePrice": "USD5.60"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "XF",
        "chargeType": "GOVERNMENT",
        "code": "XF",
        "country": "US",
        "salePrice": "USD4.50"
       },
       {
        "kind": "qpxexpress#taxInfo",
        "id": "ZP",
        "chargeType": "GOVERNMENT",
        "code": "ZP",
        "country": "US",
        "salePrice": "USD4.00"
       }
      ],
      "fareCalculation": "SAN VX SFO 217.67QMCSNR USD 217.67 END ZP SAN XT 16.33US 4.00ZP 5.60AY 4.50XF SAN4.50",
      "latestTicketingTime": "2016-06-08T20:24-04:00",
      "ptc": "ADT"
     }
    ]
   }
  ]
 }
}
*/