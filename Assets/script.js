

let apiKey = '413127a280f9203a6c945a3bdbde0802';
let baseUrl = `http://api.openweathermap.org/geo/1.0/direct?q=`;
let currentCity = document.getElementById("current-city");
let currentDate = document.getElementById("current-date");
let currentTemp = document.getElementById("current-temp");
let currentWind = document.getElementById("current-wind");
let currentHumidity = document.getElementById("current-humidity");
let currentIcon = document.getElementById("current-icon");
let cardWrapper = document.getElementById("card-wrapper");

let searchInputArray = JSON.parse(localStorage.getItem("searchInput")) || [];
let searchedCities = document.getElementById("searched-cities");

function getLatLon(search) {
    return fetch(`${baseUrl}${search}&limit=1&appid=${apiKey}`)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
                return {
                    latitude: data[0].lat,
                    longitude: data[0].lon
                };
            } else {
                // throw an error if the data isn't in the expected format
                throw new Error('No valid data returned from the API');
            }
        });
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [month, day, year].join('/');
}

function getCurrentWeatherData(lat, lon) {
    return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            currentDate.textContent = '(' + formatDate(data.dt * 1000) + ')';
            currentIcon.src = "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
            currentCity.textContent = data.name;
            currentTemp.textContent = (1.8 * (data.main.temp - 273) + 32).toFixed(2);
            currentWind.textContent = data.wind.speed;
            currentHumidity.textContent = data.main.humidity;
        });
}

function getFiveDayForcast(lat, lon) {
    return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            cardWrapper.innerHTML = "";
            for (let i = 0; i < data.list.length; i = i + 8) {
                const card = document.createElement("div");
                cardWrapper.appendChild(card);
                card.classList.add("card");
                const h3 = document.createElement("h3");
                card.appendChild(h3);
                h3.textContent = formatDate(data.list[i].dt * 1000);
                const img = document.createElement("img");
                card.appendChild(img);
                img.src = "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png";
                const p1 = document.createElement("p");
                card.appendChild(p1);
                p1.innerHTML = `Temp: <span>${(1.8 * (data.list[i].main.temp - 273) + 32).toFixed(2)}</span> F`;
                const p2 = document.createElement("p");
                card.appendChild(p2);
                p2.innerHTML = `Wind: <span>${(data.list[i].wind.speed)}</span> MPH`;
                const p3 = document.createElement("p");
                card.appendChild(p3);
                p3.innerHTML = `Humidity: <span>${(data.list[i].main.humidity)}</span> %`;
            }
        });
}

let searchForm = document.getElementById("search-form");
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const search = document.getElementById("search-input").value;

    if (!searchInputArray.includes(search)) {
        searchInputArray.push(search);
        localStorage.setItem("searchInput", JSON.stringify(searchInputArray));
    }

    getLatLon(search)
        .then((response) => {
            getCurrentWeatherData(response.latitude, response.longitude);
            getFiveDayForcast(response.latitude, response.longitude);
        })
        .catch((error) => {
            console.error("Error fetching latitude and longitude:", error);
        });

    fetchCities();
});

function fetchCities() {
    searchedCities.innerHTML = "";
    for (let i = 0; i < searchInputArray.length; i++) {
        let searchedCitiesBtn = document.createElement("button");
        searchedCities.appendChild(searchedCitiesBtn);
        searchedCitiesBtn.textContent = searchInputArray[i];
        searchedCitiesBtn.addEventListener("click", (e) => {
            let result = getLatLon(e.target.textContent);
            result.then((response) => {
                getCurrentWeatherData(response.latitude, response.longitude);
                getFiveDayForcast(response.latitude, response.longitude);
            });
        });
    }
}

window.addEventListener("load", (e) => {
    fetchCities();
});