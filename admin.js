import { supabase } from './supabaseClient.js';

const addSongForm = document.getElementById('addSongForm');
const songIdInput = document.getElementById('songId');
const titleInput = document.getElementById('title');
const artistInput = document.getElementById('artist');
const albumInput = document.getElementById('album');
const coverUrlInput = document.getElementById('cover_url');
const audioUrlInput = document.getElementById('audio_url');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const adminSongsContainer = document.getElementById('adminSongsContainer');

let editingSongId = null;

// Fetch and render songs for admin
async function fetchAdminSongs() {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching songs:', error);
    return;
  }
  
  renderAdminSongs(data);
}

function renderAdminSongs(songs) {
  adminSongsContainer.innerHTML = '';
  
  if (songs.length === 0) {
    adminSongsContainer.innerHTML = '<p style="color: var(--text-secondary);">No songs found. Add some above!</p>';
    return;
  }

  songs.forEach(song => {
    const item = document.createElement('div');
    item.className = 'admin-song-item';
    item.innerHTML = `
      <img src="${song.cover_url || 'https://via.placeholder.com/150/282828/FFFFFF?text=No+Cover'}" alt="Cover">
      <div class="admin-song-details">
        <div style="font-weight: 600;">${song.title}</div>
        <div style="font-size: 0.85rem; color: var(--text-secondary);">${song.artist} ${song.album ? '- ' + song.album : ''}</div>
      </div>
      <div class="admin-song-actions">
        <button class="btn" style="padding: 6px 12px; background: #333; color: white;" onclick="window.editSong('${song.id}')">Edit</button>
        <button class="btn btn-danger" style="padding: 6px 12px;" onclick="window.deleteSong('${song.id}')">Delete</button>
      </div>
    `;
    adminSongsContainer.appendChild(item);
  });
}

// Add or Update Song
addSongForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const songData = {
    title: titleInput.value,
    artist: artistInput.value,
    album: albumInput.value,
    cover_url: coverUrlInput.value,
    audio_url: audioUrlInput.value
  };

  if (editingSongId) {
    // Update existing
    const { error } = await supabase
      .from('songs')
      .update(songData)
      .eq('id', editingSongId);
      
    if (error) {
      alert('Error updating song: ' + error.message);
    } else {
      alert('Song updated successfully!');
      resetForm();
      fetchAdminSongs();
    }
  } else {
    // Insert new
    const { error } = await supabase
      .from('songs')
      .insert([songData]);
      
    if (error) {
      alert('Error adding song: ' + error.message);
    } else {
      alert('Song added successfully!');
      resetForm();
      fetchAdminSongs();
    }
  }
});

// Edit Song (exposed to window for inline onclick handler)
window.editSong = async (id) => {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    alert('Error fetching song details');
    return;
  }
  
  editingSongId = id;
  titleInput.value = data.title;
  artistInput.value = data.artist;
  albumInput.value = data.album || '';
  coverUrlInput.value = data.cover_url || '';
  audioUrlInput.value = data.audio_url;
  
  submitBtn.textContent = 'Update Song';
  cancelEditBtn.style.display = 'inline-block';
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Delete Song
window.deleteSong = async (id) => {
  if (!confirm('Are you sure you want to delete this song?')) return;
  
  const { error } = await supabase
    .from('songs')
    .delete()
    .eq('id', id);
    
  if (error) {
    alert('Error deleting song: ' + error.message);
  } else {
    fetchAdminSongs();
  }
};

// Cancel Edit
cancelEditBtn.addEventListener('click', resetForm);

function resetForm() {
  addSongForm.reset();
  editingSongId = null;
  submitBtn.textContent = 'Add Song';
  cancelEditBtn.style.display = 'none';
}

// Init
fetchAdminSongs();
