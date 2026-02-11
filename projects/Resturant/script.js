/* script.js */

// Mobile Menu
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('nav ul');
if(hamburger) {
    hamburger.addEventListener('click', () => { navMenu.classList.toggle('active'); });
}

// Menu Filter
function filterMenu(category) {
    const items = document.querySelectorAll('.menu-item-card');
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('btn-primary'));
    event.target.classList.add('btn-primary');
    items.forEach(item => {
        item.style.display = (category === 'all' || item.dataset.category === category) ? 'flex' : 'none';
    });
}

// Reservations Slots
function checkAvailability() {
    const slotDiv = document.getElementById('slots');
    if(!slotDiv) return;
    slotDiv.innerHTML = '<p style="margin:10px 0; font-size:0.9rem;">Available Times:</p>';
    const slots = ["18:30", "19:00", "20:30", "21:00"];
    slots.forEach(time => {
        slotDiv.innerHTML += `<button type="button" class="btn btn-outline" style="margin:5px; padding:5px 10px;" onclick="selectSlot(this)">${time}</button>`;
    });
}
function selectSlot(btn) {
    document.querySelectorAll('#slots button').forEach(b => { b.style.background='transparent'; b.style.color='var(--primary)'; });
    btn.style.background = 'var(--primary)';
    btn.style.color = 'var(--dark)';
}

// Gallery Lightbox
function openLightbox(src) {
    document.getElementById('lb-img').src = src;
    document.getElementById('lightbox').style.display = 'flex';
}
function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
}