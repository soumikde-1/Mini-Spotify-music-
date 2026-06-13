:root {
    --bg-main: #0B0F19; 
    --bg-card: #151A28; 
    --theme-color: #20B2AA; 
    --theme-hover: #1A9089;
    --text-white: #FFFFFF;
    --text-gray: #A0AABF;
    --font-main: 'Poppins', sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
body { background-color: var(--bg-main); color: var(--text-white); font-family: var(--font-main); height: 100vh; overflow: hidden; font-size: 14px; }
input:focus, textarea:focus, select:focus { outline: none; border-color: var(--theme-color); }

.screen { position: absolute; width: 100%; height: 100%; top: 0; left: 0; overflow-y: auto; padding-bottom: 120px; background-color: var(--bg-main); }
.card { background: var(--bg-card); border-radius: 15px; padding: 18px; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
input, textarea, select { width: 100%; padding: 14px; margin: 8px 0; border: 1px solid #2A3347; border-radius: 8px; background: #0B0F19; color: var(--text-white); font-family: var(--font-main); }
.theme-btn { background: var(--theme-color); color: #fff; font-weight: 600; border-radius: 30px; padding: 14px; border: none; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; width: 100%; cursor: pointer; transition: 0.3s; }
.theme-btn:active { background: var(--theme-hover); transform: scale(0.98); }

#login-section { display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at top, #152336, var(--bg-main)); }
.splash-content { width: 100%; max-width: 320px; text-align: center; }
.logo-large { font-size: 65px; margin-bottom: 10px; color: var(--theme-color); }
.splash-heading { font-size: 36px; font-weight: 700; color: var(--theme-color); margin-bottom: 5px; }
.sub-heading { color: var(--text-gray); font-size: 13px; margin-bottom: 30px; }

.app-header { display: flex; align-items: center; justify-content: space-between; padding: 20px; background: var(--bg-card); border-bottom: 1px solid #2A3347; }
.header-left { display: flex; align-items: center; }
.profile-placeholder { font-size: 24px; background: rgba(32, 178, 170, 0.2); border-radius: 50%; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; }
.header-text { margin-left: 12px; }
.greeting { color: var(--text-gray); font-size: 12px; }
.playlist-heading { font-weight: 600; font-size: 18px; }
.logout-btn { width: auto; font-size: 11px; background: #E74C3C; padding: 8px 15px; border-radius: 20px; }

/* Admin Controls Custom UI */
.admin-group-manager { border-bottom: 1px solid #2A3347; padding-bottom: 15px; margin-bottom: 15px; }
.admin-actions { display: flex; gap: 8px; margin-top: 5px; }
.action-btn { flex: 1; padding: 10px; border-radius: 8px; border: none; background: #2A3347; color: #fff; font-size: 11px; font-weight: bold; cursor: pointer; text-transform: uppercase; }
.action-btn:active { opacity: 0.8; }
.danger-btn { background: #E74C3C; }

.content-area { padding: 20px; }
.group-controls { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; }
.group-controls h3 { font-size: 16px; color: var(--theme-color); margin-right: 10px; }
.group-controls select { margin: 0; padding: 10px; width: 60%; }
.song-count { font-size: 12px; color: var(--text-gray); margin-bottom: 15px; }

.song-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 10px; border-bottom: 1px solid #1A2235; border-radius: 8px; margin-bottom: 5px; transition: 0.2s; }
.song-item:active { background: #1A2235; }
.song-number { width: 25px; color: var(--text-gray); font-size: 13px; font-weight: 600; }
.song-art { font-size: 20px; margin-right: 15px; }
.song-details-inner { flex: 1; overflow: hidden; }
.song-title-main { font-weight: 500; color: var(--text-white); font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.song-artist-sub { color: var(--text-gray); font-size: 11px; margin-top: 3px; }
.delete-btn { background: #E74C3C; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 10px; cursor: pointer; margin-left:10px; }

.bottom-player { position: fixed; bottom: 0; left: 0; width: 100%; background: var(--bg-card); border-top: 1px solid #2A3347; padding: 10px 20px 20px 20px; box-shadow: 0 -5px 15px rgba(0,0,0,0.5); z-index: 100; }
.progress-container { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 11px; color: var(--text-gray); }
input[type="range"] { -webkit-appearance: none; flex: 1; height: 4px; background: #2A3347; border-radius: 5px; outline: none; padding: 0; margin: 0; }
input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: var(--theme-color); cursor: pointer; }

.player-content { display: flex; align-items: center; justify-content: space-between; }
.song-info-small { display: flex; align-items: center; flex: 1; max-width: 60%; }
.mini-art { font-size: 22px; margin-right: 12px; }
.song-info-small .text { overflow: hidden; width: 100%; }
#player-song-title { font-weight: 600; font-size: 14px; color: var(--theme-color); }
#player-artist { font-size: 11px; color: var(--text-gray); }
.player-btns { display: flex; align-items: center; gap: 20px; }
.ctrl-btn { background: none; border: none; font-size: 20px; color: var(--text-white); cursor: pointer; }
.play-btn { font-size: 32px; color: var(--theme-color); }
