const firebaseConfig = {
    apiKey: "AIzaSyDGSdb35nB5ArKxB1hjCBFFXC7ahKna_eI",
    authDomain: "secretchat-51403.firebaseapp.com",
    databaseURL: "https://secretchat-51403-default-rtdb.firebaseio.com",
    projectId: "secretchat-51403",
    storageBucket: "secretchat-51403.appspot.com",
    messagingSenderId: "170278237183",
    appId: "1:170278237183:web:ad65532f2d41c12fcaadca"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let ytPlayer;
let playerReady = false;
let currentPlaylist = []; 
let currentSongIndex = -1;
let progressInterval;
let isFirstLoad = true;

window.onload = () => {
    document.getElementById('login-input').addEventListener('input', checkAdminInput);
    checkSession();
};

function checkAdminInput() {
    let input = document.getElementById('login-input').value.trim();
    document.getElementById('password-input').style.display = (input === "desoumikde.2005@gmail.com") ? 'block' : 'none';
}

function handleEntry() {
    let user = document.getElementById('login-input').value.trim();
    let pass = document.getElementById('password-input').value;

    if (user === "desoumikde.2005@gmail.com" && pass === "SOUMIKDEY2005") {
        localStorage.setItem('currentUser', 'Admin');
        localStorage.setItem('isAdmin', 'true');
    } else if (user !== "") {
        localStorage.setItem('currentUser', user);
        localStorage.setItem('isAdmin', 'false');
    } else { alert("ইমেল বা নাম লিখুন"); return; }
    checkSession();
}

function checkSession() {
    let user = localStorage.getItem('currentUser');
    let isAdmin = localStorage.getItem('isAdmin') === 'true';

    if (user) {
        document.getElementById('login-section').style.display = 'none'; 
        document.getElementById('dashboard-screen').style.display = 'block'; 
        document.getElementById('welcome-name').innerText = user;

        if (isAdmin) { document.getElementById('admin-controls').style.display = 'block'; }
        loadDynamicGroups(); 
    }
}

function logout() {
    localStorage.clear();
    location.reload();
}

// ================= ADMIN LOGIC =================
function loadDynamicGroups() {
    db.ref('groups').on('value', (snapshot) => {
        let adminSelect = document.getElementById('admin-group-select');
        let userSelect = document.getElementById('user-group-select');
        let currentSelection = userSelect.value; 

        adminSelect.innerHTML = ""; userSelect.innerHTML = "";
        let data = snapshot.val();
        
        if (data) {
            Object.keys(data).sort().forEach(groupName => {
                let opt = `<option value="${groupName}">${groupName}</option>`;
                adminSelect.innerHTML += opt;
                userSelect.innerHTML += opt;
            });
        } else {
            db.ref('groups/Group A').push({ 
                title: "Welcome Song", 
                videoId: "dQw4w9WgXcQ", 
                timestamp: Date.now() 
            });
            return;
        }

        if(document.querySelector(`#user-group-select option[value="${currentSelection}"]`)) {
            userSelect.value = currentSelection;
            if(adminSelect) adminSelect.value = currentSelection;
        } else {
            userSelect.selectedIndex = 0;
            if(adminSelect.options.length > 0) adminSelect.selectedIndex = 0;
        }
        
        if(isFirstLoad) { changeGroup(); isFirstLoad = false; }
    });
}

function createNewGroup() {
    let newGroupName = prompt("নতুন গ্রুপের নাম লিখুন:");
    if (newGroupName && newGroupName.trim() !== "") {
        let cleanName = newGroupName.trim();
        db.ref('groups/' + cleanName).push({ 
            title: "Welcome to " + cleanName, 
            videoId: "dQw4w9WgXcQ", 
            timestamp: Date.now() 
        });
        document.getElementById('user-group-select').value = cleanName;
        changeGroup();
    }
}

function renameGroup() {
    let oldName = document.getElementById('admin-group-select').value;
    if(!oldName) return;
    let newName = prompt(`"${oldName}" এর নতুন নাম দিন:`, oldName);
    if (newName && newName.trim() !== "" && newName !== oldName) {
        let cleanName = newName.trim();
        db.ref('groups/' + oldName).once('value', snapshot => {
            let data = snapshot.val();
            if(data) {
                db.ref('groups/' + cleanName).set(data, (error) => {
                    if(!error) db.ref('groups/' + oldName).remove();
                });
            }
        });
    }
}

function deleteGroup() {
    let groupName = document.getElementById('admin-group-select').value;
    if(groupName && confirm(`আপনি কি সত্যিই "${groupName}" পুরোপুরি ডিলিট করতে চান?`)) {
        db.ref('groups/' + groupName).remove();
        changeGroup();
    }
}

function extractYTId(input) {
    let match = input.match(/(?:embed\/|v=|youtu\.be\/|\/v\/|watch\?v=)([^"&?\/\s]{11})/);
    return match ? match[1] : (input.length === 11 ? input : null);
}

function uploadSong() {
    let group = document.getElementById('admin-group-select').value;
    if(!group) return alert("আগে একটি গ্রুপ সিলেক্ট বা তৈরি করুন!");

    let url = document.getElementById('yt-url-input').value.trim();
    let ytId = extractYTId(url);

    if (ytId) {
        document.getElementById('yt-url-input').value = "Loading title...";
        fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${ytId}`)
        .then(res => res.json())
        .then(data => {
            db.ref('groups/' + group).push({ title: data.title || "Unknown Audio", videoId: ytId, timestamp: Date.now() });
            document.getElementById('yt-url-input').value = "";
        }).catch(() => {
            db.ref('groups/' + group).push({ title: "YouTube Audio", videoId: ytId, timestamp: Date.now() });
            document.getElementById('yt-url-input').value = "";
        });
    } else { alert("সঠিক YouTube লিংক দিন"); }
}

function deleteSong(group, songKey) {
    if (confirm("এই গানটি ডিলিট করতে চান?")) { db.ref('groups/' + group + '/' + songKey).remove(); }
}

// ================= PLAYLIST & PLAYER LOGIC =================
function changeGroup() {
    let group = document.getElementById('user-group-select').value;
    if(!group) return;
    
    let adminSelect = document.getElementById('admin-group-select');
    if(adminSelect) adminSelect.value = group;

    document.getElementById('current-group-display').innerText = group;
    
    db.ref('groups/' + group).off('value'); 
    db.ref('groups/' + group).on('value', (snapshot) => {
        let data = snapshot.val();
        currentPlaylist = [];
        let view = document.getElementById('playlist-view');
        let isAdmin = localStorage.getItem('isAdmin') === 'true';

        if (data) {
            let songCount = 0;
            let tempView = "";
            let dataArr = Object.entries(data);

            dataArr.sort((a, b) => a[1].title.toLowerCase().localeCompare(b[1].title.toLowerCase()));

            dataArr.forEach(([key, song], index) => {
                songCount++;
                currentPlaylist.push({ key: key, title: song.title, id: song.videoId });
                let thumb = `https://img.youtube.com/vi/${song.videoId}/default.jpg`;
                
                tempView += `
                    <div class="song-item" onclick="playSong(${index})">
                        <span class="song-number">${songCount}</span>
                        <img src="${thumb}" class="song-art-img" alt="art">
                        <div class="song-details-inner">
                            <p class="song-title-main">${song.title}</p>
                            <p class="song-artist-sub">YouTube Music</p>
                        </div>
                        ${isAdmin ? `<button class="delete-btn" onclick="deleteSong('${group}', '${key}'); event.stopPropagation();">DEL</button>` : ''}
                    </div>
                `;
            });
            view.innerHTML = tempView;
            document.getElementById('total-songs-count').innerText = songCount;
        } else {
            view.innerHTML = "<p style='color:gray; padding:20px; text-align:center;'>এই গ্রুপে কোনো গান নেই</p>";
            document.getElementById('total-songs-count').innerText = "0";
        }
    });
}

function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('yt-player-container', {
        height: '300', width: '300', 
        playerVars: { 'autoplay': 1, 'playsinline': 1, 'controls': 0, 'enablejsapi': 1 },
        events: { 'onReady': () => { playerReady = true; }, 'onStateChange': onPlayerStateChange }
    });
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        document.getElementById('play-pause-btn').innerText = "⏸️";
        startProgressBar();
    } else if (event.data === YT.PlayerState.PAUSED) {
        document.getElementById('play-pause-btn').innerText = "▶️";
        clearInterval(progressInterval);
    } else if (event.data === YT.PlayerState.ENDED) {
        playNext(); // Auto-play next song
    }
}

function playSong(index) {
    if (currentPlaylist.length > 0) {
        currentSongIndex = index;
        let song = currentPlaylist[currentSongIndex];
        
        if (playerReady && ytPlayer.loadVideoById) {
            ytPlayer.loadVideoById(song.id);
            ytPlayer.playVideo(); 
            
            // UI Update
            document.getElementById('player-song-title').innerText = song.title;
            document.getElementById('player-artwork').innerHTML = `<img src="https://img.youtube.com/vi/${song.id}/hqdefault.jpg">`;

            // Lockscreen / Background Media Controls (MediaSession API)
            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: song.title,
                    artist: 'Mùsïç Fi - ' + document.getElementById('current-group-display').innerText,
                    album: 'Your Playlist',
                    artwork: [
                        { src: `https://img.youtube.com/vi/${song.id}/hqdefault.jpg`, sizes: '480x360', type: 'image/jpeg' }
                    ]
                });

                navigator.mediaSession.setActionHandler('play', () => ytPlayer.playVideo());
                navigator.mediaSession.setActionHandler('pause', () => ytPlayer.pauseVideo());
                navigator.mediaSession.setActionHandler('previoustrack', () => playPrev());
                navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
            }
        }
    }
}

function togglePlay() {
    if (!playerReady) return;
    let state = ytPlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) { ytPlayer.pauseVideo(); } 
    else { ytPlayer.playVideo(); }
}

function playNext() {
    if (currentPlaylist.length > 0) {
        currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
        playSong(currentSongIndex);
    }
}

function playPrev() {
    if (currentPlaylist.length > 0) {
        currentSongIndex = (currentSongIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
        playSong(currentSongIndex);
    }
}

function formatTime(time) {
    if(!time) return "0:00";
    time = Math.round(time);
    let minutes = Math.floor(time / 60);
    let seconds = time - minutes * 60;
    return minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);
}

function startProgressBar() {
    clearInterval(progressInterval);
    progressInterval = setInterval(() => {
        if(playerReady && ytPlayer.getCurrentTime) {
            let currentTime = ytPlayer.getCurrentTime();
            let duration = ytPlayer.getDuration();
            document.getElementById('current-time').innerText = formatTime(currentTime);
            document.getElementById('total-time').innerText = formatTime(duration);
            document.getElementById('seek-bar').value = (currentTime / duration) * 100 || 0;
        }
    }, 1000);
}

function seekVideo() {
    if (playerReady && ytPlayer.getDuration) {
        let seekTo = ytPlayer.getDuration() * (document.getElementById('seek-bar').value / 100);
        ytPlayer.seekTo(seekTo, true);
    }
}
