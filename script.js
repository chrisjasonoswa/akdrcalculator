const selectElement = document.getElementById("date-select");

const totalDisplay = document.getElementById("total-value");
const lowestQualifiedRank = document.getElementById("lowest-rank");
const monthlyReward = document.getElementById("monthly-reward");
const pointAkdr = document.getElementById("point-akdr")
const pointsInput = document.getElementById("points-input")
const estimatedAkdr = document.getElementById("estimated-akdr");

const refreshButton = document.getElementById("refresh-button");
const refreshButtonContent = document.getElementById("refresh-button-content");

const addressInput = document.getElementById("address-input");
const addressPoints = document.getElementById("address-points");
const addressAkdr = document.getElementById("address-akdr");

const editAddrButton = document.getElementById("edit-addr-button");
let inputEditDisabled = true;

const monthlyRewardValue = 1100000;
let pointsMultiplier = undefined;

const invalidAddress = 'Address Empty/Not Found';

// localStorage.setItem("roninAddress", "0xc4a685d7080fa4783c1babb45b02908fded4e03c");

document.addEventListener("DOMContentLoaded", () => {
    //Check if there is a saved ronin address
    let address = localStorage.getItem("roninAddress");
    if(address == null){
        addressPoints.innerText = "-";
    }
    else{
        addressInput.value = address;
    }

    //Fetch leaderboard dates and points
    const leaderboardDates = 'https://corsproxy.io/?' + encodeURIComponent('https://kaidro.com/api/leaderboard');
    fetch(leaderboardDates)
    .then(response => response.json())
    .then(data => {
        data.leaderboardKeys.forEach(key => {
            const [prefix, monthYear] = key.split("-");
            const month = parseInt(monthYear.slice(0, 2), 10); // Extracts the month number
            const year = monthYear.slice(2); // Extracts the year
            
            // Convert month number to month name
            const date = new Date(year, month - 1);
            const monthName = date.toLocaleString("default", { month: "long" });

            // Create option element
            const option = document.createElement("option");
            option.value = key; // Set the option value to the leaderboard key
            option.textContent = `${monthName} ${year}`; // Set the display text
            
            selectElement.appendChild(option);
        });

        selectElement.selectedIndex = 0;
        // Fetch data for the initial selected value
        fetchLeaderboardData();
    })
    .catch(error => {
        console.error("Error fetching leaderboard dates:", error);
    });
});

// Event listener to fetch data whenever the selected date changes
selectElement.addEventListener("change", () => {
    fetchLeaderboardData();
});

//When refresh button is clicked, fetch new leaderboard data
refreshButton.addEventListener("click", function(){
    fetchLeaderboardData();
});


//When points input is changed, recalculate akdr
pointsInput.addEventListener("input", function() {
    console.log("Points changed, recalculating AKDR");
    calculcatedAkdr();
});

editAddrButton.addEventListener("click", () => {
    //Edit mode
    if(inputEditDisabled){
        addressInput.disabled = false;
        editAddrButton.className = "fa-solid fa-floppy-disk";
    }
    //Save mode
    else{
        addressInput.disabled = true;
        editAddrButton.className = "fa-solid fa-pen-to-square";
        localStorage.setItem("roninAddress", addressInput.value);
        fetchLeaderboardData();
    }
    inputEditDisabled = !inputEditDisabled;
})


//Function to calculate Estimated AKDR
function calculcatedAkdr(){
    console.log(`Calculating AKDR: ${pointsInput.value} - ${pointsMultiplier}`);
    if(pointsInput.value && pointsMultiplier){
        console.log("Calculating AKDR...");
        estimatedAkdr.innerText = (pointsMultiplier*pointsInput.value).toFixed(4);
    }
        
    else{
        console.log("Not Calculating AKDR...");
        estimatedAkdr.innerText = "-";
    }
        
}

//Function to calculate Estimated AKDR for the ronin address
function calculcateAddressAkdr(){
    console.log(`Calculating Ronin AKDR: ${pointsInput.value} - ${pointsMultiplier}`);
    if(addressPoints.innerText !=  "-" && pointsMultiplier)
        addressAkdr.innerText = (pointsMultiplier*addressPoints.innerText).toFixed(4);
    else
        addressAkdr.innerText = "-";
}

// Function to fetch leaderboard data based on selected date
function fetchLeaderboardData() {
    resetValues();
    console.log("Fetching leaderboard data for:" + selectElement.value);
    const pointsUrl = 'https://corsproxy.io/?' + encodeURIComponent(`https://kaidro.com/api/leaderboard/${selectElement.value}?limit=3000`);

    fetch(pointsUrl)
        .then(response => response.json())
        .then(data => {

            let totalPoints = 0;
            let lowestRank = 0;
            let addressFound = false;
            // Calculate total points from leaderboard entries
            data.leaderboard.forEach(entry => {
                if (entry.points >= 200) {
                    totalPoints += entry.points;
                    lowestRank += 1;
                }
                
                //Get address and set points
                let address = localStorage.getItem("roninAddress");
                console.log(`${lowestRank}: ${entry.walletAddress}:${address}`);
                if (address && entry.walletAddress.toLowerCase() === address.toLowerCase()){
                    addressFound = true;
                    addressPoints.innerText = entry.points;
                    
                    console.log("Address found");
                    const invalidAddressDiv = document.getElementById("invalid-address-info");
                    invalidAddressDiv.style = "display: none";
                }
            });

            if(!addressFound){
                console.log("Address not found");
                const invalidAddressDiv = document.getElementById("invalid-address-info");
                invalidAddressDiv.style = "display: block";
            }

            // Display the total points
            totalDisplay.innerHTML = totalPoints.toLocaleString();

            // Display lowest rank
            lowestQualifiedRank.innerHTML = "#" + lowestRank;

            // Monthly Reward and Point to AKDR Ratio
            monthlyReward.innerHTML = monthlyRewardValue.toLocaleString();
            
            pointsMultiplier = (monthlyRewardValue / totalPoints).toFixed(4);
            pointAkdr.innerHTML = pointsMultiplier;

            //Calculate AKDR rewards
            calculcatedAkdr();

            //Calculate AKDR for the address
            calculcateAddressAkdr();

            //Update the latest date
            const newDate = new Date().toLocaleString('en-US', {
                month: 'short',    // Display month as "Jan", "Feb", etc.
                day: 'numeric',    // Display day as a numeric value.
                year: 'numeric',   // Display the year.
                hour: 'numeric',   // Display hour in 12-hour format.
                minute: 'numeric', // Display minute.
                timeZoneName: 'short' // Display timezone as "PST", "EST", etc.
            });
            
            refreshButton.innerHTML = `<span>${newDate}&nbsp;&nbsp;&nbsp;<i class="fa-solid fa-rotate style="font-size:1em; color:black;"></i>`;
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            // alert("An error occured in the server");
        });
}


function resetValues(){
    const loaders = document.getElementsByClassName("with-loader");
    for (const element of loaders) {
        element.innerHTML = '<div class="loader"></div>';
    }

    //Reset pointsMultipler
    pointsMultiplier = undefined;

    //Empty out the estimated akdr
    estimatedAkdr.innerText = '-';

    //Reset address points and estimated akdr
    addressPoints.innerText = '-';
    addressAkdr.innerText = '-';
}

