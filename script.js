// --- 1. FIREBASE CONFIG ---
// তোমার আগের স্ক্রিনশট থেকে আইডিগুলো এখানে বসিয়ে দিয়েছি। তুমি appId এবং projectId কনফার্ম করে নিও।
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

// --- STATE MANAGEMENT ---
let ytPlayer;
let playerReady = false;
let currentPlaylist = []; // Array of song objects: {key, title, id}
let currentSongIndex = -1;
const groups = Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i));

// On Load: Generate A-Z and Check Session
window.onload = () => {
    let adminSelect = document.getElementById('admin-group-select');
    let userSelect = document.getElementById('user-group-select');
    groups.forEach(g => {
        let opt = `<option value="Group${g}">Group ${g}</option>`;
        adminSelect.innerHTML += opt;
        userSelect.innerHTML += opt;
    });

    document.getElementById('login-input').addEventListener('input', checkAdminInput);
    checkSession();
};

// Admin পাসওয়ার্ড ফিল্ড দেখানো
function checkAdminInput() {
    let input = document.getElementById('login-input').value.trim();
    if (input === "desoumikde.2005@gmail.com") {
        document.getElementById('password-input').style.display = 'block';
    } else {
        document.getElementById('password-input').style.display = 'none';
    }
}

// --- LOGIN & SESSION LOGIC ---
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
        document.getElementById('login-section').classList.remove('show');
        document.getElementById('dashboard-screen').classList.add('show');
        document.getElementById('welcome-name').innerText = user;

        if (isAdmin) {
            document.getElementById('admin-controls').style.display = 'block';
        }
        changeGroup(); // Default group load
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    location.reload();
}

// --- ADMIN: UPLOAD & DELETE ---
function extractYTId(input) {
    let match = input.match(/(?:embed\/|v=|youtu\.be\/|\/v\/|watch\?v=)([^"&?\/\s]{11})/);
    return match ? match[1] : (input.length === 11 ? input : null);
}

function uploadSong() {
    let group = document.getElementById('admin-group-select').value;
    let url = document.getElementById('yt-url-input').value.trim();
    let ytId = extractYTId(url);

    if (ytId) {
        let ref = db.ref('groups/' + group);
        // YouTube API theke TITLE আনা সম্ভব না (API key লাগে), তাই আমরা ডামি টাইটেল সেভ করছি।
        ref.push({ title: "Song on YouTube", videoId: ytId, timestamp: Date.now() });
        document.getElementById('yt-url-input').value = "";
        alert("uploaded to " + group);
    } else { alert("সঠিক YouTube লিংক বা আইডি দিন"); }
}

function deleteSong(group, songKey) {
    if (confirm("এই গানটি ডিলিট করতে চান?")) {
        db.ref('groups/' + group + '/' + songKey).remove();
        alert("ডিলিট হয়েছে");
    }
}

// --- USER: PLAYLIST & UI DUPLICATION ---
function changeGroup() {
    let group = document.getElementById('user-group-select').value;
    document.getElementById('current-group-display').innerText = group.replace('Group', '');
    document.getElementById('playlist-view').innerHTML = "<p style='color:gray; padding:20px;'>Playlist Loading...</p>";
    
    // Stop current listening for real-time updates
    db.ref('groups/' + group).off('value');
    
    // Start listening for the new group
    db.ref('groups/' + group).on('value', (snapshot) => {
        let data = snapshot.val();
        currentPlaylist = [];
        let view = document.getElementById('playlist-view');
        let isAdmin = localStorage.getItem('isAdmin') === 'true';

        if (data) {
            let songCount = 0;
            let tempView = "";
            let dataArr = Object.entries(data); // Get [key, val] pairs
            // Sort by timestamp (optional)
            dataArr.sort((a, b) => a[1].timestamp - b[1].timestamp);

            dataArr.forEach(([key, song], index) => {
                songCount++;
                currentPlaylist.push({ key: key, title: `YouTube Video ID: ${song.videoId}`, id: song.videoId });
                
                // --- SPOTIFY LIST ITEM DUPLICATE (from image) ---
                tempView += `
                    <div class="song-item" onclick="playSong(${index})">
                        <div class="song-item-info">
                            <span class="song-number">${songCount}</span>
                            <div class="song-art">🎵</div>
                            <div class="song-details-inner">
                                <p class="song-title-main">Video ID: ${song.videoId}</p>
                                <p class="song-artist-sub">YouTube Music</p>
                            </div>
                        </div>
                        <div class="song-item-controls">
                            ${isAdmin ? `<button class="delete-btn" onclick="deleteSong('${group}', '${key}'); event.stopPropagation();">DEL</button>` : ''}
                            <span class="song-heart-icon">♥</span>
                        </div>
                    </div>
                `;
            });
            view.innerHTML = tempView;
            document.getElementById('total-songs-count').innerText = songCount;
            // If playlist was previously selected but empty, start first song
            if (currentSongIndex === -1 && currentPlaylist.length > 0) { currentSongIndex = 0; playCurrent(); }
        } else {
            view.innerHTML = "<p style='color:gray; padding:20px;'>এই গ্রুপে কোনো গান নেই</p>";
            document.getElementById('total-songs-count').innerText = "0";
            if (ytPlayer && playerReady) ytPlayer.stopVideo();
            updatePlayerUI(null);
        }
    });
}

// --- YOUTUBE API INIT ---
function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('yt-player-container', {
        height: '1px', width: '1px',
        playerVars: { 'autoplay': 1, 'playsinline': 1, 'controls': 0, 'rel': 0, 'fs': 0 },
        events: { 'onReady': onPlayerReady, 'onStateChange': onPlayerStateChange }
    });
}

function onPlayerReady(event) { playerReady = true; }

// অটো প্লে এবং মিউজিক কন্ট্রোল
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        document.getElementById('play-pause-btn').innerText = "⏸️"; // পজ আইকন
        setupMediaSession();
    } else if (event.data === YT.PlayerState.PAUSED) {
        document.getElementById('play-pause-btn').innerText = "▶️"; // প্লে আইকন
    } else if (event.data === YT.PlayerState.ENDED) {
        playNext(); // গান শেষ হলে পরেরটা
    }
}

// --- PLAYER CONTROLS & MEDIA SESSION API ---
function playSong(index) {
    if (currentPlaylist.length > 0 && index < currentPlaylist.length) {
        currentSongIndex = index;
        playCurrent();
    }
}

function playCurrent() {
    if (currentPlaylist.length > 0 && currentSongIndex >= 0 && currentSongIndex < currentPlaylist.length) {
        let song = currentPlaylist[currentSongIndex];
        if (ytPlayer && playerReady && ytPlayer.loadVideoById) {
            ytPlayer.loadVideoById(song.id);
            updatePlayerUI(song);
        }
    }
}

function togglePlay() {
    if (!ytPlayer || !playerReady) return;
    let state = ytPlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) { ytPlayer.pauseVideo(); } 
    else { ytPlayer.playVideo(); }
}

function playNext() {
    if (currentPlaylist.length > 0) {
        currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length; // Loop back to start
        playCurrent();
    }
}

function playPrev() {
    if (currentPlaylist.length > 0) {
        currentSongIndex = (currentSongIndex - 1 + currentPlaylist.length) % currentPlaylist.length; // Loop to end
        playCurrent();
    }
}

function updatePlayerUI(song) {
    let titleEl = document.getElementById('player-song-title');
    if (song) {
        titleEl.innerText = song.id; // ইউটিউবের ডামি টাইটেল বা আইডি
    } else {
        titleEl.innerText = "Select a Song";
    }
}

// **স্ক্রিন লক বা ব্যাকগ্রাউন্ডে মিউজিক কন্ট্রোল**
function setupMediaSession() {
    if ('mediaSession' in navigator && currentPlaylist.length > 0 && currentSongIndex >= 0) {
        let song = currentPlaylist[currentSongIndex];
        navigator.mediaSession.metadata = new MediaMetadata({
            title: `YouTube Video ${song.id}`,
            artist: 'Sotify Group ' + document.getElementById('user-group-select').value.replace('Group',''),
            artwork: [ { src: 'https://cdn0.iconfinder.com/data/icons/spotify-colored-dot-icon/512/spotify_music-512.png', sizes: '512x512', type: 'image/png' } ] // Dummy art
        });
        navigator.mediaSession.setActionHandler('play', () => ytPlayer.playVideo());
        navigator.mediaSession.setActionHandler('pause', () => ytPlayer.pauseVideo());
        navigator.mediaSession.setActionHandler('previoustrack', playPrev);
        navigator.mediaSession.setActionHandler('nexttrack', playNext);
    }
      }

