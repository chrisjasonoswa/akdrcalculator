const selectElement = document.getElementById("date-select");

const totalDisplay = document.getElementById("total-value");
const lowestQualifiedRank = document.getElementById("lowest-rank");
const monthlyReward = document.getElementById("monthly-reward");
const pointAkdr = document.getElementById("point-akdr")
const pointsInput = document.getElementById("points-input")
const estimatedAkdr = document.getElementById("estimated-akdr");

const refreshButton = document.getElementById("refresh-button");
const refreshButtonContent = document.getElementById("refresh-button-content");

const monthlyRewardValue = 1100000;
let pointsMultiplier = 0;

document.addEventListener("DOMContentLoaded", () => {
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
    console.log("changed");
    //Fetch Leaderboard data
    fetchLeaderboardData();

    //Recalculate akdr
    calculcatedAkdr();
});


//When points input is changed, recalculate akdr
pointsInput.addEventListener("input", function() {
    console.log("Points changed, recalculating AKDR");
    calculcatedAkdr();
});


//When refresh button is clicked, fetch new leaderboard data
refreshButton.addEventListener("click", function(){
    console.log("Refresh button clicked, fetching new Leaderboard data");
    fetchLeaderboardData();
});


//Function to calculate Estimated AKDR
function calculcatedAkdr(){
    if(pointsInput.value)
        estimatedAkdr.innerText = (pointsMultiplier*pointsInput.value).toFixed(4);
    else
        estimatedAkdr.innerText = "-";
}


// Function to fetch leaderboard data based on selected date
function fetchLeaderboardData() {
    console.log("Fetching leaderboard data for:" + selectElement.value);
    const pointsUrl = 'https://corsproxy.io/?' + encodeURIComponent(`https://kaidro.com/api/leaderboard/${selectElement.value}?limit=3000`);

    fetch(pointsUrl)
        .then(response => response.json())
        .then(data => {
            let totalPoints = 0;
            let lowestRank = 0;

            // Calculate total points from leaderboard entries
            data.leaderboard.forEach(entry => {
                if (entry.points >= 200) {
                    totalPoints += entry.points;
                    lowestRank += 1;
                }
            });

            // Display the total points
            totalDisplay.innerText = totalPoints.toLocaleString();

            // Display lowest rank
            lowestQualifiedRank.innerText = "#" + lowestRank;

            // Monthly Reward and Point to AKDR Ratio
            monthlyReward.innerText = monthlyRewardValue.toLocaleString();
            
            pointsMultiplier = (monthlyRewardValue / totalPoints).toFixed(4);
            pointAkdr.innerText = pointsMultiplier;

            //Calculate AKDR rewards
            calculcatedAkdr();

            //Update the latest date
            const newDate = new Date().toLocaleString('en-US', {
                month: 'short',    // Display month as "Jan", "Feb", etc.
                day: 'numeric',    // Display day as a numeric value.
                year: 'numeric',   // Display the year.
                hour: 'numeric',   // Display hour in 12-hour format.
                minute: 'numeric', // Display minute.
                timeZoneName: 'short' // Display timezone as "PST", "EST", etc.
            });
            refreshButton.innerHTML = `<span>${newDate}&nbsp;&nbsp;&nbsp;<i class="fa fa-refresh" style="font-size:1em; color:black;"></i></span>`;
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            // alert("An error occured in the server");
        });
}
