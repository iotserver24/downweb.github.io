// Define your API endpoint
const dlapi = "https://api3.iotserver24.workers.dev";

// Function to fetch JSON data from a URL
async function getJson(url) {
    const response = await fetch(url);
    return response.json();
}

// Function to get download links and trigger downloads
async function getDownloadLinks(anime, episode) {
    const EpisodeID = episode; // Assuming episode is already the EpisodeID
    const data = (await getJson(`${dlapi}/${EpisodeID}`)).results;
    for (const [key, value] of Object.entries(data)) {
        const url = value;
        triggerDownload(url);
    }
}

// Function to trigger the download
function triggerDownload(url) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.download = ""; // This attribute is necessary to trigger download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Function to fetch and display episode details
async function fetchEpisodeDetails(animeId) {
    const response = await fetch(`https://yourapi.com/anime/${animeId}/episodes`);
    const data = await response.json();
    displayEpisodes(data.episodes);
}

// Function to display episodes on the page
function displayEpisodes(episodes) {
    const episodesContainer = document.getElementById("episodes-container");
    episodesContainer.innerHTML = ""; // Clear previous episodes
    episodes.forEach(episode => {
        const episodeElement = document.createElement("div");
        episodeElement.classList.add("episode");
        episodeElement.innerText = `Episode ${episode.number}: ${episode.title}`;
        episodeElement.onclick = () => getDownloadLinks(episode.animeId, episode.id);
        episodesContainer.appendChild(episodeElement);
    });
}

// Automatically start download on page load or when episode is selected
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const anime = urlParams.get("anime");
    const episode = urlParams.get("episode");
    if (anime && episode) {
        getDownloadLinks(anime, episode);
    } else if (anime) {
        fetchEpisodeDetails(anime);
    }
};

// Function to handle search
async function handleSearch() {
    const searchInput = document.getElementById("search-input").value;
    const searchResults = await searchAnime(searchInput);
    displaySearchResults(searchResults);
}

// Function to search for anime
async function searchAnime(query) {
    const response = await fetch(`https://yourapi.com/search?q=${query}`);
    return response.json();
}

// Function to display search results
function displaySearchResults(results) {
    const searchResultsContainer = document.getElementById("search-results-container");
    searchResultsContainer.innerHTML = ""; // Clear previous results
    results.forEach(anime => {
        const animeElement = document.createElement("div");
        animeElement.classList.add("anime");
        animeElement.innerText = anime.title;
        animeElement.onclick = () => fetchEpisodeDetails(anime.id);
        searchResultsContainer.appendChild(animeElement);
    });
}

// Event listener for search button
document.getElementById("search-button").onclick = handleSearch;
