// Api urls
const ProxyApi = "https://proxy.techzbots1.workers.dev/?u=";
const animeapi = "/anime/";
const episodeapi = "/episode/";
const dlapi = "/download/";

// Api Server Manager
const AvailableServers = ["https://api3.iotserver24.workers.dev"];
// const AvailableServers = ["https://api3.anime-dex.workers.dev"];

function getApiServer() {
    return AvailableServers[Math.floor(Math.random() * AvailableServers.length)];
}

// Useful functions

async function getJson(path, errCount = 0) {
    const ApiServer = getApiServer();
    let url = ApiServer + path;

    if (errCount > 2) {
        throw `Too many errors while fetching ${url}`;
    }

    if (errCount > 0) {
        // Retry fetch using proxy
        console.log("Retrying fetch using proxy");
        url = ProxyApi + url;
    }

    try {
        const _url_of_site = new URL(window.location.href);
        const referer = _url_of_site.origin;
        const response = await fetch(url, { headers: { referer: referer } });
        return await response.json();
    } catch (errors) {
        console.error(errors);
        return getJson(path, errCount + 1);
    }
}

function sentenceCase(str) {
    if (str === null || str === "") return false;
    else str = str.toString();

    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to get m3u8 url of episode
async function loadVideo(name, stream) {
    try {
        document.getElementById("ep-name").innerHTML = name;
        const serversbtn = document.getElementById("serversbtn");

        let url = stream["sources"][0]["file"];
        serversbtn.innerHTML += `<div class="sitem"> <a class="sobtn sactive" onclick="selectServer(this)" data-value="./embed.html?url=${url}&episode_id=${EpisodeID}">AD Free 1</a> </div>`;
        document.getElementsByClassName("sactive")[0].click();

        url = stream["sources_bk"][0]["file"];
        serversbtn.innerHTML += `<div class="sitem"> <a class="sobtn" onclick="selectServer(this)" data-value="./embed.html?url=${url}&episode_id=${EpisodeID}">AD Free 2</a> </div>`;

        return true;
    } catch (err) {
        return false;
    }
}

// Function to available servers
async function loadServers(servers, success = true) {
    const serversbtn = document.getElementById("serversbtn");

    html = "";

    for (let [key, value] of Object.entries(servers)) {
        if (key != "vidcdn") {
            key = capitalizeFirstLetter(key);
            if (key == "Streamwish") {
                html += `<div class="sitem"> <a class="sobtn" onclick="selectServer(this,true)" data-value="${value}">${key}</a> </div>`;
            } else {
                html += `<div class="sitem"> <a class="sobtn" onclick="selectServer(this)" data-value="${value}">${key}</a> </div>`;
            }
        }
    }
    serversbtn.innerHTML += html;

    if (success == false) {
        document.getElementsByClassName("sobtn")[0].click();
    }
}

// Function to select server
function selectServer(btn, sandbox = false) {
    const buttons = document.getElementsByClassName("sobtn");
    const iframe = document.getElementById("AnimeDexFrame");

    if (sandbox == true) {
        iframe.sandbox =
            "allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation";
    } else {
        iframe.removeAttribute("sandbox");
    }

    iframe.src = btn.getAttribute("data-value");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].className = "sobtn";
    }
    btn.className = "sobtn sactive";
}

// Function to show download links
function showDownload() {
    document.getElementById("showdl").style.display = "none";
    document.getElementById("dldiv").classList.toggle("show");

    getDownloadLinks(urlParams.get("anime"), urlParams.get("episode")).then(
        () => {
            console.log("Download links loaded");
        }
    );
}

// Function to get episode list
let Episode_List = [];

async function getEpUpperList(eplist) {
    const current_ep = Number(EpisodeID.split("-episode-")[1].replace("-", "."));
    Episode_List = eplist;
    const TotalEp = eplist.length;
    let html = "";

    for (let i = 0; i < eplist.length; i++) {
        const epnum = Number(eplist[i][0].replaceAll("-", "."));

        if ((epnum - 1) % 100 === 0) {
            let epUpperBtnText;
            if (TotalEp - epnum < 100) {
                epUpperBtnText = `${epnum} - ${TotalEp}`;

                if (epnum <= current_ep && current_ep <= TotalEp) {
                    html += `<option id="default-ep-option" class="ep-btn" data-from=${epnum} data-to=${TotalEp}>${epUpperBtnText}</option>`;
                    getEpLowerList(epnum, TotalEp);
                } else {
                    html += `<option class="ep-btn" data-from=${epnum} data-to=${TotalEp}>${epUpperBtnText}</option>`;
                }
            } else {
                epUpperBtnText = `${epnum} - ${epnum + 99}`;

                if (epnum <= current_ep && current_ep <= epnum + 99) {
                    html += `<option id="default-ep-option" class="ep-btn" data-from=${epnum} data-to=${epnum + 99
                        }>${epUpperBtnText}</option>`;
                    getEpLowerList(epnum, epnum + 99);
                } else {
                    html += `<option class="ep-btn" data-from=${epnum} data-to=${epnum + 99
                        }>${epUpperBtnText}</option>`;
                }
            }
        }
    }
    document.getElementById("ep-upper-div").innerHTML = html;
    document.getElementById("default-ep-option").selected = true;
    console.log("Episode list loaded");
}

async function getEpLowerList(start, end) {
    let html = "";
    for (let i = 0; i < Episode_List.length; i++) {
        const epnum = Number(Episode_List[i][0].replaceAll("-", "."));

        if (epnum >= start && epnum <= end) {
            html += `<div class="sitem"> <a class="sobtn" href="./episode.html?id=${AnimeID}-episode-${Episode_List[i][0]}">${sentenceCase(Episode_List[i][1])}</a> </div>`;
        }
    }

    document.getElementById("ep-lower-div").innerHTML = html;
}

const urlParams = new URLSearchParams(window.location.search);
const AnimeID = urlParams.get("id");
const EpisodeID = urlParams.get("episode");

getJson(`/anime/${AnimeID}/episodes`).then((response) => {
    getEpUpperList(response);
});

getJson(`/anime/${AnimeID}/episode/${EpisodeID}`).then((response) => {
    loadVideo(response.anime, response.stream).then((success) => {
        if (!success) {
            loadServers(response.servers, false);
        } else {
            loadServers(response.servers);
        }
    });
});

function goBack() {
    window.history.back();
}
