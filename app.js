import { supabase } from './supabaseClient.js';

let songs = [];
let currentSongIndex = -1;
let isPlaying = false;

const songsGrid = document.getElementById('songsGrid');
const searchInput = document.getElementById('searchInput');

// Player Elements
const audioElement = document.getElementById('audioElement');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBarWrapper = document.getElementById('progressBarWrapper');
const progressBar = document.getElementById('progressBar');
const progressThumb = document.getElementById('progressThumb');
const currentTimeEl = document.getElementById('currentTime');
const durationTimeEl = document.getElementById('durationTime');
const volumeSliderWrapper = document.getElementById('volumeSliderWrapper');
const volumeBar = document.getElementById('volumeBar');
const volumeThumb = document.getElementById('volumeThumb');

const playerCover = document.getElementById('playerCover');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');

// Fetch Songs
async function fetchSongs() {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching songs:', error);
    return;
  }
  
  songs = data;
  renderSongs(songs);
}

// Render Songs
function renderSongs(songsToRender) {
  songsGrid.innerHTML = '';
  
  if (songsToRender.length === 0) {
    songsGrid.innerHTML = '<p style="color: var(--text-secondary);">No songs found.</p>';
    return;
  }

  songsToRender.forEach((song, index) => {
    const card = document.createElement('div');
    card.className = 'song-card';
    card.innerHTML = `
      <img src="${song.cover_url || 'https://via.placeholder.com/150/282828/FFFFFF?text=No+Cover'}" alt="${song.title}">
      <div class="song-title">${song.title}</div>
      <div class="song-artist">${song.artist}</div>
    `;
    
    card.addEventListener('click', () => {
      // Find the actual index in the main songs array if filtered
      const actualIndex = songs.findIndex(s => s.id === song.id);
      playSong(actualIndex);
    });
    
    songsGrid.appendChild(card);
  });
}

// Search Functionality
searchInput.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  const filtered = songs.filter(song => 
    song.title.toLowerCase().includes(term) || 
    song.artist.toLowerCase().includes(term) ||
    (song.album && song.album.toLowerCase().includes(term))
  );
  renderSongs(filtered);
});

// Player Logic
function playSong(index) {
  if (index < 0 || index >= songs.length) return;
  
  currentSongIndex = index;
  const song = songs[currentSongIndex];
  
  audioElement.src = song.audio_url;
  
  // Update UI
  playerCover.src = song.cover_url || 'https://via.placeholder.com/150/282828/FFFFFF?text=No+Cover';
  playerTitle.textContent = song.title;
  playerArtist.textContent = song.artist;
  
  audioElement.play().catch(e => console.log('Playback prevented', e));
  isPlaying = true;
  updatePlayPauseUI();
}

function togglePlay() {
  if (currentSongIndex === -1 && songs.length > 0) {
    playSong(0);
    return;
  }
  
  if (isPlaying) {
    audioElement.pause();
  } else {
    audioElement.play();
  }
  isPlaying = !isPlaying;
  updatePlayPauseUI();
}

function updatePlayPauseUI() {
  if (isPlaying) {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
  } else {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
  }
}

function playNext() {
  if (songs.length === 0) return;
  let nextIndex = currentSongIndex + 1;
  if (nextIndex >= songs.length) nextIndex = 0;
  playSong(nextIndex);
}

function playPrev() {
  if (songs.length === 0) return;
  let prevIndex = currentSongIndex - 1;
  if (prevIndex < 0) prevIndex = songs.length - 1;
  playSong(prevIndex);
}

// Event Listeners
playPauseBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', playNext);
prevBtn.addEventListener('click', playPrev);

audioElement.addEventListener('ended', playNext);

// Time Update
audioElement.addEventListener('timeupdate', () => {
  if (isNaN(audioElement.duration)) return;
  
  const current = audioElement.currentTime;
  const duration = audioElement.duration;
  
  const progressPercent = (current / duration) * 100;
  progressBar.style.width = `${progressPercent}%`;
  progressThumb.style.left = `${progressPercent}%`;
  
  currentTimeEl.textContent = formatTime(current);
  durationTimeEl.textContent = formatTime(duration);
});

audioElement.addEventListener('loadedmetadata', () => {
  durationTimeEl.textContent = formatTime(audioElement.duration);
});

// Seek Functionality
progressBarWrapper.addEventListener('click', (e) => {
  const width = progressBarWrapper.clientWidth;
  const clickX = e.offsetX;
  const duration = audioElement.duration;
  
  audioElement.currentTime = (clickX / width) * duration;
});

// Volume Functionality
volumeSliderWrapper.addEventListener('click', (e) => {
  const width = volumeSliderWrapper.clientWidth;
  const clickX = e.offsetX;
  let volume = clickX / width;
  
  if (volume < 0) volume = 0;
  if (volume > 1) volume = 1;
  
  audioElement.volume = volume;
  updateVolumeUI(volume);
});

function updateVolumeUI(volume) {
  const percent = volume * 100;
  volumeBar.style.width = `${percent}%`;
  volumeThumb.style.left = `${percent}%`;
}

// Format Time (seconds to m:ss)
function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Initialization
updateVolumeUI(audioElement.volume);
fetchSongs();
