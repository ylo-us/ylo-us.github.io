var sendButton = document.getElementById("getRequest");
var requestOption = document.getElementById("options");
var requestContent = document.getElementById("optionsContent");
var divContent = document.getElementById("content");
var tripMode = document.getElementById("trips");
var optionCollapse = true;
var leavePrice = 0;
var returnPrice = 0;
var finalLeaveResult = [];
var finalReturnResult = [];

createSelections("adultNum", 10, 1);
createSelections("childNum", 10);
createSelections("stopNum", 4, 0);
setMinDate();

//======================================================================================
// A function that creates numeric selections for a given DOM element.
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
//Set the earliest allowable date to be today.
function setMinDate() {
    var currentDate = new Date();
    var day = currentDate.getDate();
    var month = currentDate.getMonth() + 1;
    var year = currentDate.getFullYear();
    var minDate = "";
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
    minDate = year + "-" + month + "-" + day;
    document.getElementById("leaveDate").setAttribute("min", minDate);
    document.getElementById("leaveDate").setAttribute("value", minDate);
    document.getElementById("returnDate").setAttribute("min", minDate);
}

//======================================================================================
//Re-format the time result from HTTPRequest.
function setLocaleTime(timeStr) {
    var idx_cal = timeStr.lastIndexOf(":");
    var hr_cal = parseInt(timeStr.substr((idx_cal-3), 3));
    timeStr = timeStr.replace("T", " ");    
    timeStr = timeStr.slice(0, idx_cal-3) + " UTC " + timeStr.slice(idx_cal-3);
    return timeStr;
}
//======================================================================================
//Convert the duration time from minute to hour + minute.
function convertDuration(timeStr) {
    var timeHour = 0;
    var timeMinute = 0;
    var time = parseInt(timeStr);
    timeHour = Math.floor(time / 60);
    timeMinute = time % 60;
    
    return timeHour + " hr(s) " + timeMinute + " min(s)";
}

//======================================================================================
function buildResultBlock(Element, attribute, attributeVal, parentNode, infoTxt) {
    var myElement = document.createElement(Element);
    var myDivResults = document.createElement("div");
    myElement.setAttribute(attribute, attributeVal);
    myDivResults.setAttribute("class", "divResults");
    if (infoTxt !== undefined) {
        var txtNode = document.createTextNode(infoTxt);
        myElement.appendChild(txtNode);
    }    
    myDivResults.appendChild(myElement);
    parentNode.appendChild(myDivResults);
}

//======================================================================================
//If Round-trip is selected, return date should be shown in the web page.
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
//If "Request Options" is clicked, more search conditions will be shown.
requestOption.addEventListener("click", function() {
    
    optionCollapse = !optionCollapse;
    if(optionCollapse) {
        requestOption.setAttribute("aria-expanded", "false");    
        divContent.setAttribute("style", "overflow: hidden; display: none;");
    }
    else {
        requestOption.setAttribute("aria-expanded", "true");
        divContent.setAttribute("style", "overflow: hidden;");
    }
})

//======================================================================================
sendButton.addEventListener("click", function() {
    
    var solutionsVal = document.getElementById("solution").value;
    var maxPriceVal = document.getElementById("price").value;
    var stopValUser = document.getElementById("stopNum").value;
    var leaveTripNode = document.getElementById("resultLeaveTrip");
    var showPrice = document.getElementById("showPrice");
    var returnTripNode = document.getElementById("resultReturnTrip");
    
    //Clear previous results.
    while (leaveTripNode.firstChild) {
        leaveTripNode.removeChild(leaveTripNode.firstChild);
    }    
    while (returnTripNode.firstChild) {
        returnTripNode.removeChild(returnTripNode.firstChild);
    }    
    while (showPrice.firstChild) {
        showPrice.removeChild(showPrice.firstChild);
    }   
    
    //Initialize the variables that will be used for user's selection.
    finalLeaveResult = [];
    finalReturnResult = [];
    leavePrice = 0;
    returnPrice = 0;
    
    //Get searching information from user's input.
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
    //If round-trip is selected, swap origin and destination. 
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
    
    //Add budget in the request if user wants it.
    if (maxPriceVal != "" && document.getElementById("oneWay").checked) {
        jsonRequestLeaveTrip.request["maxPrice"] = "USD" + maxPriceVal;
    }
    else if (maxPriceVal != "" && document.getElementById("roundTrip").checked) {
        jsonRequestLeaveTrip.request["maxPrice"] = "USD" + maxPriceVal;
        jsonRequestReturnTrip.request["maxPrice"] = "USD" + maxPriceVal;
    };
    
    //Prompt user if number of solution is empty. This parameter is mandatory for the API.
    if (solutionsVal != "" && document.getElementById("oneWay").checked) {
        jsonRequestLeaveTrip.request["solutions"] = parseInt(solutionsVal);
        getData(jsonRequestLeaveTrip, "resultLeaveTrip", "Leave", finalLeaveResult);
    }
    else if (solutionsVal != "" && document.getElementById("roundTrip").checked) {
        jsonRequestLeaveTrip.request["solutions"] = parseInt(solutionsVal);
        jsonRequestReturnTrip.request["solutions"] = parseInt(solutionsVal);
        getData(jsonRequestLeaveTrip, "resultLeaveTrip", "Leave", finalLeaveResult);
        getData(jsonRequestReturnTrip, "resultReturnTrip", "Return", finalReturnResult);
    }
    else {
        alert("Please tell me the max number of results you want to know");
    };
    
})

//======================================================================================
//Get the selection from user and gray-out other options. Show the total price on the web page after selection.
function selectTrip(id) {
    
    var allButtons = document.getElementsByName("tripSel");
    var selectionIdx = id.substring(id.search("button") + 6, id.length) - 1;
    var leaveTrips = [];
    var returnTrips = [];
    var p = document.getElementById("showPrice");
    var totalPrice = 0;
    var availableOptionFlag = false;
    
    //Retrieve the airfare information seperately.
    for (var i = 0; i < allButtons.length; i++) {
        var sel = allButtons[i].getAttribute("id");
        if (sel.substring(0, 5).toLowerCase() === "leave") {
            leaveTrips.push(allButtons[i]);
        }
        else if (sel.substring(0, 6).toLowerCase() === "return") {
            returnTrips.push(allButtons[i]);
        }
    }
    
    //Clear the price shown in the web page.
    while (p.firstChild) {
        p.removeChild(p.firstChild);                    
    }
    
    //If budget is set, gray-out the options that exceed the budget.
    if (document.getElementById("oneWay").checked) {
        makeSelection(leaveTrips);
        if (budget !== "") {
            for (var i = 0; i < returnTrips.length; i++) {
                var sel = returnTrips[i].getAttribute("id")
                var price = parseFloat(finalLeaveResult[selectionIdx].saleTotal.substring(3));
                if ((budget - price) < parseFloat(finalleaveResult[i].saleTotal.substring(3))) {
                    document.getElementById(sel).parentElement.parentElement.setAttribute("style", "opacity: 0.2");
                    document.getElementById(sel).setAttribute("disabled", "true");
                } 
                else if (document.getElementById(sel).parentElement.parentElement.hasAttribute("style")) {
                    document.getElementById(sel).parentElement.parentElement.removeAttribute("style");
                    document.getElementById(sel).removeAttribute("disabled");
                } 
            }
        }
        leavePrice = parseFloat(finalLeaveResult[selectionIdx].saleTotal.substring(3));
    }
    //If round-trip is selected and both trips are on the same day, gray-out the options that is impossible for user.
    //In other words, disable the return trip that its departing time is earlier than the arriving time of leave trip.
    else if (document.getElementById("roundTrip").checked && id.substring(0,5).toLowerCase() === "leave") {
        var budget = document.getElementById("price").value;
        makeSelection(leaveTrips);
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
                } 
                else if (document.getElementById(sel).parentElement.parentElement.hasAttribute("style")) {
                    document.getElementById(sel).parentElement.parentElement.removeAttribute("style");
                    document.getElementById(sel).removeAttribute("disabled");
                }
            }
        } 
        //If budget is set, gray-out the options that exceed the budget.
        if (budget !== "") {
            for (var i = 0; i < returnTrips.length; i++) {
                var sel = returnTrips[i].getAttribute("id")
                var price = parseFloat(finalLeaveResult[selectionIdx].saleTotal.substring(3));
                console.log(budget - price);
                if ((budget - price) < parseFloat(finalReturnResult[i].saleTotal.substring(3))) {
                    document.getElementById(sel).parentElement.parentElement.setAttribute("style", "opacity: 0.2");
                    document.getElementById(sel).setAttribute("disabled", "true");
                    document.getElementById(sel).checked = false;
                } 
                else if (document.getElementById(sel).parentElement.parentElement.hasAttribute("style")) {
                    document.getElementById(sel).parentElement.parentElement.removeAttribute("style");
                    document.getElementById(sel).removeAttribute("disabled");
                }
                else {
                    availableOptionFlag = true;                    
                }
            }
            if (!availableOptionFlag) {
                returnPrice = 0;
            }
            
        }
        leavePrice = parseFloat(finalLeaveResult[selectionIdx].saleTotal.substring(3));
    }
    
    if (document.getElementById("roundTrip").checked && id.substring(0,6).toLowerCase() === "return") {
        makeSelection(returnTrips);
        returnPrice = parseFloat(finalReturnResult[selectionIdx].saleTotal.substring(3));
    } 
    
    //Show the total price in the web page.
    totalPrice = leavePrice + returnPrice;
    totalPrice = Math.round(totalPrice * 100) /100;
    var allAmount = document.createTextNode("$" + totalPrice);
    p.appendChild(allAmount);
}

//======================================================================================
//gray-out the all options except for the one user selected.
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
//Send request to server and get data back. Then process the data.
function getData(jsonRequestObj, targetDivID, tripDirection, storedArray) {
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
            // Create result block.
            for (var idx = 0; idx < document.getElementsByClassName("line").length; idx++) {
                document.getElementsByClassName("line")[idx].style.display = "none";    
            }
            // If the http status is good, check the returned data. Otherwise print error message on the web page.
            if (xhr.status == 200 || xhr.status == 304) {
                var results = JSON.parse(xhr.responseText);
                var stops = 0;
                var resultText = "";   
                // If there's no result, show "no result was found" nessage on the web page.
                if (results.trips.tripOption !== undefined) {
                    var numResults = results.trips.tripOption.length;
                    // Only the trips that meet the user's input will be considered.
                    // If all requirements are satisfied, process the data.
                    for (var i = 0; i < numResults; i++) {
                        stops = results.trips.tripOption[i].slice[0].segment.length - 1;
                        if (stops <= document.getElementById("select_stopNum").value) {
                            storedArray.push(results.trips.tripOption[i]);
                        }                        
                    }                    
                    if (storedArray.length < 1 && document.getElementById("resultLeaveTrip").firstChild == null) {
                        buildResultBlock("h3", "id", tripDirection + "h3", document.getElementById("resultLeaveTrip"), "Sorry... No result was found. Please add more stops.");
                    }
                    else {
                        var myForm = document.createElement("form");
                        myForm.setAttribute("id", tripDirection + "Trip");
                        for (var i = 0; i < storedArray.length; i++) {
                            stops = storedArray[i].slice[0].segment.length - 1;
                            var myFieldSet = document.createElement("fieldset");
                            var myLegend = document.createElement("legend");
                            var legendTxt = document.createTextNode(tripDirection + "Option" + (i + 1));
                            myFieldSet.setAttribute("id", tripDirection + "Fieldset" + (i + 1));
                            
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
                            buildResultBlock("label", "class", "durationOption" + (i + 1), myFieldSet, "Flight Duration: " + convertDuration(storedArray[i].slice[0].duration));
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
                var resultTr = document.getElementById("resultTable").insertRow(i);
                var trText = resultTr.insertCell(0);
                resultTable.appendChild(tableNode);
                resultTable.setAttribute("id", "resultTable");
                document.getElementById("resultLeaveTrip").appendChild(resultTable);                
                trText.innerHTML = "Ooops!! Something went wrong..." + "</br>" + "Please Double Check Your Input Fields" + "</br>" + "HTTP status code: " + xhr.status;
                document.getElementById(targetDivID).appendChild(resultTable);
            }
        }
        
    }
}