const main_container = document.querySelector(".main");
const nav = document.querySelector(".nav");
const content = document.querySelector(".content");
const left = document.querySelector(".left");
const sign_up_banner = document.createElement("div");
const buttons_container = document.querySelector(".buttons_container");
const play_pause_container = document.querySelector(".play_pause_container");
const playlist_box = document.querySelector(".left .playlist_box");
const player = document.querySelector(".player");
const play_pause_btn = play_pause_container.querySelector(".play_pause");
const seekbar_circle = player.querySelector(".seekbar_circle");
const previous_btn = player.querySelector(".previous");
const next_btn = player.querySelector(".next");
const hamburger = nav.querySelector(".hamburger");
const close_hamburger = left.querySelector(".cross_icon");
const vol_btns = player.querySelector(".vol_btns");
const vol_range_container = player.querySelector(".vol_range_container");
const vol_range = player.querySelector(".vol_range");
const vol_value = vol_range_container.querySelector(".vol_value");
const local_playlists = document.getElementById("local_playlists");
let close_icon;
let volume;
let curr_song = new Audio();
let curr_song_index = 0;
let prev_song_card;
let curr_song_card;
let prev_playlist_card;
let curr_playlist_card;
let curr_folder_index = 0;
let folder_names_array;
let folders;

// FUNCTION TO ADD THE SIGN-UP PROMOTIONAL BANNER
function add_sign_up_banner() {
  sign_up_banner.classList.add("flex", "container", "sign_up_banner");
  sign_up_banner.innerHTML = `<div class="preview_text flex_column container ">
    <div class="text">Preview of Spotify</div>
    <div class="text">Sign up to get unlimited songs and podcasts with occasional ads. No credit card needed
    </div>
    </div>
    <button class="log_in buttons hover_scale_105">Sign up free</button>
    <img class="close_icon" src="./assets/cross.svg" alt="close">`;
  close_icon = document.querySelector(".sign_up_banner .close_icon");
  main_container.appendChild(sign_up_banner);
}

// THE BANNER WILL BE ADDED WHEN THE FUNCTION IS CALLED AND CAN BE REMOVED WHEN CLICKED ON THE CLOSE BUTTON
// add_sign_up_banner();

// IF CLICKED IN CLOSE BUTTON CLOSE THE BANNER
close_icon = sign_up_banner.querySelector(".close_icon");
if (close_icon) {
  close_icon.addEventListener("click", () => {
    main_container.removeChild(sign_up_banner);
  });
}

// FUNCTION TO CREATE GREEN PLAY BUTTON DYNAMICALLY
function create_play() {
  const play_container = document.createElement("div");
  play_container.innerHTML =
    '<img class="play flex " src="./assets/play.svg" > ';
  play_container.classList.add("play_container,flex");
  return play_container;
}

// CODE TO GET THE SONGS FROM THE DIRECTORY
async function getSongs(currFolder_URI) {
  let a = await fetch(`${currFolder_URI}`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let songs = [];
  let as = div.getElementsByTagName("a");
  for (let i = 0; i < as.length; i++) {
    const element = as[i];
    if (element.href.endsWith(".mp3") || element.href.endsWith(".m4a")) {
      songs.push(element.href);
    }
  }
  return songs;
}

//CREATES SONG CARDS FOR THE SONGS TO BE CLICKABLE AND PLAY
function createSongCard(
  song_URI,
  song_index = 0,
  thumbnail_src = "./assets/music.svg",
  artist_name = "Stalin"
) {
  let song_name = getSongNamefromURI(song_URI, curr_folder_index);
  const song_card = document.createElement("div");
  song_card.classList.add(
    "song_card",
    "conatiner",
    "flex",
    "click_to_highlight"
  );
  song_card.innerHTML = ` 
                        <div class="song_href hidden">${song_URI}</div>
                        <div class="song_index hidden">${song_index}</div>

                    <img class="music_icon " src=${thumbnail_src} alt="">
                        <div class="song_details container flex_column">
                            <div class="song_name">
                                ${song_name}
                            </div>
                            <div class="artist_name">
                                ${artist_name}
                            </div>
                        </div>
                        <img class="song_play_icon " src="./assets/play.svg " alt="">
`;
  playlist_box.appendChild(song_card);
}

// ADDS SONGS TO THE PLAYLIST
function addSongsToPlaylist(songs) {
  playlist_box.innerHTML = "";
  // console.log("inside addSongsToPlaylist", songs);
  for (let index = 0; index < songs.length; index++) {
    const songURI = songs[index];
    createSongCard(songURI, index);
  }
}

// ADDS GREEN BORDER AND HIGHLIGHTS THE CURRENTLY PLAYING PLAYLIST
function updatePlayingPlaylist() {
  if (prev_playlist_card) {
    console.log("inside if");
    prev_playlist_card.classList.remove("playing_playlist");
  }
  let playlist_cards_array = document.querySelectorAll(
    "#local_playlists .card"
  );
  console.log(playlist_cards_array);
  curr_playlist_card = playlist_cards_array[curr_folder_index];
  curr_playlist_card.classList.add("playing_playlist");
  // console.log(curr_playlist_card);
  prev_playlist_card = curr_playlist_card;
}

// ADDS GREEN BORDER AND HIGHLIGHTS THE CURRENTLY PLAYING CARD
function updatePlayingCard() {
  if (prev_song_card) {
    prev_song_card.classList.remove("playing_card");
  }
  let song_cards_array = playlist_box.querySelectorAll(".song_card");
  curr_song_card = song_cards_array[curr_song_index];
  curr_song_card.classList.add("playing_card");
  prev_song_card = curr_song_card;
}
// PLAYS MUSIC
function playMusic(track_uri) {
  curr_song.src = track_uri;
  curr_song.play();
  updatePlayPause();
  updateSongDetails(curr_song);
  updatePlayingCard();
}

//  CONVERTS SEC TO MINS
function getSecToMin(given_seconds) {
  let timeString;
  given_seconds = Math.floor(given_seconds);
  hours = Math.floor(given_seconds / 3600);
  minutes = Math.floor((given_seconds - hours * 3600) / 60);
  seconds = given_seconds - hours * 3600 - minutes * 60;
  if (hours == 0) {
    timeString =
      minutes.toString().padStart(2, "0") +
      ":" +
      seconds.toString().padStart(2, "0");
  } else {
    timeString =
      hours.toString().padStart(2, "0") +
      ":" +
      minutes.toString().padStart(2, "0") +
      ":" +
      seconds.toString().padStart(2, "0");
  }
  return timeString;
}

// UPDATES THE PLAY AND PAUSE BUTTON WHEN ITS CLICKED
function updatePlayPause() {
  if (!curr_song.paused) {
    play_pause_btn.src =
      "http://127.0.0.1:3000/JAVASCRIPT%20FILES/84-SPOTIFY%20CLONE/assets/pause.svg";
  } else if (curr_song.paused) {
    play_pause_btn.src =
      "http://127.0.0.1:3000/JAVASCRIPT%20FILES/84-SPOTIFY%20CLONE/assets/play_pause.svg";
  }
}

// UPDATES THE LENGTH OF THE SONG WHEN ANY SONG IS PLAYED
function updateDuration(duration_in_secs) {
  let song_duration = player.querySelector(".song_duration");
  if (getSecToMin(duration_in_secs) == "NaN:NaN:NaN") {
    song_duration.innerHTML = "00:00";
  } else {
    song_duration.innerHTML = getSecToMin(duration_in_secs);
  }
}

// KEEPS UPDATING THE DURATION AS THE SONG STARTS PLAYING
function updateCurrentTime(curr_time_in_secs) {
  let current_time = player.querySelector(".current_time");
  current_time.innerHTML = getSecToMin(curr_time_in_secs);
}

// UPDATES THE POSITION OF THE CIRCLE AS THE DURATION OF THE SONG CHANGES
function updateSeekbarPosition(curr_time_in_secs, duration_in_secs) {
  let one_percent = duration_in_secs / 100;
  let left_offset = curr_time_in_secs / one_percent + "%";
  // console.log(left_offset);
  seekbar_circle.style.left = left_offset;
}

// CODE TO UPDATE THE PLAYER VALUES ACCORDING TO THE CURRENT SONG
function updateSongDetails(curr_song) {
  let song_name = player.querySelector(".song_name");
  let song_artist = player.querySelector(".song_artist");
  song_name.innerHTML = decodeSongName(curr_song.src);
  song_artist.innerHTML = "Stalin";
}

// DISABLES THE  BTNS IF IT'S THE FIRST SONG OR AS IT REACHES TO THE END
function disableButton(button) {
  if (button.classList.contains("click_to_highlight")) {
    button.classList.remove("click_to_highlight");
  }
  button.style.opacity = "50%";
}

// ENABLES THE BUTNS
function enableButton(button) {
  button.classList.add("click_to_highlight");
  button.style.opacity = "unset";
}

// UPDATES VOLUME VALUES WHENT THE RANGE VALUE CHANGES
function updateVolumeValue() {
  volume = vol_range.value;
  vol_value.innerHTML = volume;
  curr_song.volume = volume / 100;
  if (volume == 0) {
    vol_btns.src = "./assets/volume_mute.svg";
  } else if (volume < 50) {
    vol_btns.src = "./assets/volume_low.svg";
  } else {
    vol_btns.src = "./assets/volume_high.svg";
  }
}

// FETCH FOLDERS
async function fetchFolders() {
  let folders = await fetch(
    "http://127.0.0.1:3000/JAVASCRIPT%20FILES/84-SPOTIFY%20CLONE/songs/"
  );
  let response = await folders.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let folders_array = [];

  Array.from(div.getElementsByTagName("a")).forEach((a) => {
    if (a.href.includes("/songs/")) {
      folders_array.push(a.href);
    }
  });
  return folders_array;
}

//GET FOLDER NAMES FROM URI
function getFolderNamesFromURI(folders_array, curr_folder_index) {
  let folder_names_array = [];
  folders_array.forEach((element) => {
    folder_names_array.push(element.split("/songs/")[1].slice(0, -1));
  });
  return folder_names_array;
}

// FETCH THE FOLDER INFO.JSONG FILE
async function fetchPlaylistInfo(folders) {
  let info_array_of_objs = [];
  for (let i = 0; i < folders.length; i++) {
    let info = await fetch(`${folders[i]}info.json`);
    let resp = await info.json();
    info_array_of_objs[i] = `
    {
    "description":"${resp.description}",
    "cover_URI":"${resp.cover_URI}"
    }
    `;
  }
  return info_array_of_objs;
}

// CREATE PLAYLISTS
function createPlaylists(info_array_of_objs) {
  for (let i = 0; i < info_array_of_objs.length; i++) {
    let description = JSON.parse(info_array_of_objs[i]).description;
    let cover_URI = JSON.parse(info_array_of_objs[i]).cover_URI;
    let div = document.createElement("div");
    div.classList.add("card", "flex_column", "container");
    div.innerHTML = `<img class="profile" src="${cover_URI}" alt="cover image">
      <div class="description">${description}</div>`;
    local_playlists.querySelector(".cards_container").appendChild(div);
  }
}

// EXTRACTS SONG NAME FROM THE SONG URL
function getSongNamefromURI(song_URI, curr_folder_index) {
  let encodedName = song_URI
    .split(`/songs/${folder_names_array[curr_folder_index]}/`)[1]
    .replaceAll("%20", " ");
  return encodedName;
}

// DECODES SONG NAME FROM THE SONG SRC
function decodeSongName(song_URI) {
  return song_URI
    .split(`/songs/${folder_names_array[curr_folder_index]}/`)[1]
    .replaceAll("%20", " ");
}

async function main() {
  // (LOCAL FUNCTION) TO UPDATE THE PREV AND NEXT BUTTONS STATE
  function update_btns_state() {
    if (curr_song_index == 0) {
      disableButton(previous_btn);
      enableButton(next_btn);
    } else if (curr_song_index == songs.length - 1) {
      disableButton(next_btn);
      enableButton(previous_btn);
    } else {
      enableButton(previous_btn);
      enableButton(next_btn);
    }
  }

  // FETCH ALL THE FOLDERS AVAILABLE INSIDE THE SONG FOLDER AND ADD  TO THE LOCAL PLAYLISTS
  folders = await fetchFolders();

  // GET ALL THE ENCODED FOLDER NAMES
  folder_names_array = getFolderNamesFromURI(folders);

  let currFolder_URI = folders[0];
  curr_folder_index = 0;
  console.log(curr_folder_index);

  // GET THE LIST OF SONGS
  let songs = await getSongs(currFolder_URI);

  function start_again(songs) {
    // ADD ALL THE SONGS TO THE PLAYLIST
    addSongsToPlaylist(songs);

    // MAKE THE FIRST SONG DEFAULT TO PLAY
    curr_song.src = songs[0];
    curr_song_index = 0;

    // DISABLE THE PREVIOUS BUTTON BCZ THERE IS NO PREVIOUS SONG AVAILABLE
    update_btns_state();

    // MAKE THE FIRST SONG  GREEN BORDER SELECTED BY DEFAULT
    updatePlayingCard();
    console.log(curr_folder_index);

    // console.log(folders);
    // console.log(curr_folder_index);

    // UPDATE THE PLAYER VALUES
    updatePlayPause();

    // UPDATE THE SONG NAME AND ARTIST NAME
    updateSongDetails(curr_song);

    // MAKE ALL THE CARDS CLICKABLE TO PLAY
    let all_songs_cards = playlist_box.querySelectorAll(".song_card ");
    all_songs_cards.forEach((song_card) => {
      song_card.addEventListener("click", (e) => {
        e.preventDefault();
        curr_song_card = song_card;
        let curr_song_uri = song_card.querySelector(".song_href").innerHTML;
        curr_song_index = song_card.querySelector(".song_index").innerHTML;
        playMusic(curr_song_uri);
        update_btns_state();
      });
    });
  }
  start_again(songs);

  // MAKE THE PLAY / PAUSE BUTTON FUNCTIONAL
  play_pause_btn.addEventListener("click", (e) => {
    if (e.target.src.endsWith("play_pause.svg")) {
      e.target.src =
        "http://127.0.0.1:3000/JAVASCRIPT%20FILES/84-SPOTIFY%20CLONE/assets/pause.svg";
      curr_song.play();
    } else {
      e.target.src =
        "http://127.0.0.1:3000/JAVASCRIPT%20FILES/84-SPOTIFY%20CLONE/assets/play_pause.svg";

      curr_song.pause();
    }
  });

  // LISTEN THE TIMEUPDATE EVENT
  curr_song.addEventListener("timeupdate", () => {
    updateDuration(curr_song.duration);
    updateCurrentTime(curr_song.currentTime);
    updateSeekbarPosition(curr_song.currentTime, curr_song.duration);
    if (curr_song.ended) {
      updatePlayPause();
    }
  });

  // MAKE THE SEEKBAR CLICKABLE AND FUNCTIONAL
  let seekbar = player.querySelector(".seekbar");
  seekbar.addEventListener("click", (e) => {
    // console.log(e.target.getBoundingClientRect().width, e.offsetX);
    let offset_percent =
      (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    // console.log(offset_percent);
    seekbar_circle.style.left = offset_percent + "%";

    curr_song.currentTime = (curr_song.duration * offset_percent) / 100;
  });

  // MAKE THE PREVIOUS  BUTTON FUNCTIONAL
  previous_btn.addEventListener("click", (e) => {
    enableButton(next_btn);
    if (curr_song_index > 0) {
      curr_song_index--;
      playMusic(songs[curr_song_index]);
      update_btns_state();
    } else {
      console.log("No previous song available to play...");
    }
  });
  // MAKE THE NEXT BUTTTON FUNCTIONAL
  next_btn.addEventListener("click", (e) => {
    enableButton(previous_btn);
    if (curr_song_index < songs.length - 1) {
      curr_song_index++;
      playMusic(songs[curr_song_index]);
      update_btns_state();
    } else {
      console.log("No next song available to play...");
    }
  });

  // ADD FUNCTION TO THE HAMBURGER]
  hamburger.addEventListener("click", () => {
    console.log("Hambrger clicked");
    left.style.left = "0%";
  });

  // CLOSING THE HAMBURGER
  close_hamburger.addEventListener("click", () => {
    console.log("close_hamburger clicked");
    left.style.left = "-100%";
  });

  // DISPLAYS THE VOLUME CONTROLLER WHEN CLICKED IN THE SPEAKER ICON
  vol_btns.addEventListener("click", () => {
    vol_range_container.style.display = "block";
    updateVolumeValue();
  });

  // HIDES THE VOLUME BLOCK WHEN MOUSE LEAVES THE BLOCK (FOR PC)
  vol_range_container.addEventListener("mouseleave", () => {
    setTimeout(() => {
      vol_range_container.style.display = "none";
    }, 400);
  });

  // CHANGES THE ACTUAL VOLUME ACCORDING TO THE INPUT RANGE
  vol_range.addEventListener("input", () => {
    updateVolumeValue();
  });

  // HIDES THE VOLUME CONTROLLER BLOCK WHEN CLICKED IN OTHER PARTS (FOR MOBILE VIEW)
  document.addEventListener("click", (e) => {
    if (
      !e.target.closest(".vol_range_container") &&
      !e.target.closest(".vol_btn_container") &&
      vol_range_container.style.display == "block"
    ) {
      vol_range_container.style.display = "none";
    }
  });

  // GET INFO OF EACH FOLDER
  let info_array_of_objs = await fetchPlaylistInfo(folders);

  // CREATE PLAYLIST ACC TO THE INFO
  createPlaylists(info_array_of_objs);

  const cards = document.querySelectorAll(".right .card");

  // LOGIC TO ADD PLAY BUTTON ON HOVER ON PLAYLISTS
  cards.forEach((card) => {
    card.insertAdjacentElement("afterbegin", create_play());
    const play = card.querySelector(".play");
    card.addEventListener("mouseenter", () => {
      play.classList.add("toggle_play");
    });
    card.addEventListener("mouseleave", () => {
      if (play.classList.contains("toggle_play")) {
        play.classList.remove("toggle_play");
      }
    });
  });

  // POPULATE THE SONGS WHEN CLICKED ON ANY PLAYLIST
  cards.forEach((card, index) => {
    card.addEventListener("click", async (e) => {
      if (e.currentTarget.closest("#local_playlists")) {
        curr_folder_index = index;
        songs = await getSongs(folders[curr_folder_index]);
        start_again(songs);
        curr_song.play();
        updatePlayPause();
        updatePlayingPlaylist();
      }
    });
  });
}

main();
