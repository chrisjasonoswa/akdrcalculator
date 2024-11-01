const selectElement = document.getElementById("date-select");

const totalDisplay = document.getElementById("total-value");
const lowestQualifiedRank = document.getElementById("lowest-rank");
const monthlyReward = document.getElementById("monthly-reward");
const pointAkdr = document.getElementById("point-akdr")
const pointsInput = document.getElementById("points-input")
const estimatedAkdr = document.getElementById("estimated-akdr");

const monthlyRewardValue = 1100000;
let pointsMultiplier = 0;


// document.getElementById("date-select").addEventListener("change", () => {
//     fetchLeaderboardData(selectElement.value);
// });

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

            selectElement.selectedIndex = 0;

            // Fetch data for the initial selected value
            fetchLeaderboardData(selectElement.value);
        });
    })
    .catch(error => console.error("Error fetching leaderboard dates:", error));

    console.log("selectDate.value:", selectElement.value);

    // Event listener to fetch data whenever the selected date changes
    selectElement.addEventListener("change", () => {

        //Reset values
        const withLoaderElements = document.getElementsByClassName("with-loader");
        for (let i = 0; i < withLoaderElements.length; i++) {
            withLoaderElements[i].innerHTML = '<div class="loader"></div>';
        }

        pointsInput.value = undefined;
        estimatedAkdr.innerText = "-";

        fetchLeaderboardData(selectElement.value);
    });

    pointsInput.addEventListener("input", function() {

        //AKDR
        const pointsInputValue = this.value;
        estimatedAkdr.innerText = (pointsMultiplier*pointsInputValue).toFixed(2)
    });

});

// Function to fetch leaderboard data based on selected date
function fetchLeaderboardData(selectedValue) {
    const pointsUrl = 'https://corsproxy.io/?' + encodeURIComponent(`https://kaidro.com/api/leaderboard/${selectedValue}?limit=3000`);

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
            document.getElementById("total-value").innerText = totalPoints.toLocaleString();

            // Display lowest rank
            document.getElementById("lowest-rank").innerText = "#" + lowestRank;

            // Monthly Reward and Point to AKDR Ratio
            document.getElementById("monthly-reward").innerText = monthlyRewardValue.toLocaleString();
            
            pointsMultiplier = (monthlyRewardValue / totalPoints).toPrecision(5);
            document.getElementById("point-akdr").innerText = pointsMultiplier;
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            document.getElementById("total-value").innerText = "Error";
        });
}

