// Global variables
let personImage = null;
let clothesImage = null;
let webcamStream = null;
let clothesSize = 100;
let clothesOpacity = 80;
let clothesPosition = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Scroll to try-on section
function scrollToTryOn() {
    document.getElementById('how-it-works').scrollIntoView({
        behavior: 'smooth'
    });
}

// File upload handlers
function openFileUpload(type) {
    const input = document.getElementById(`${type}-upload`);
    input.click();
}

function handlePersonUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            personImage = new Image();
            personImage.onload = function() {
                displayPreview('person-preview', personImage);
                checkReadyToApply();
            };
            personImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function handleClothesUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            clothesImage = new Image();
            clothesImage.onload = function() {
                displayPreview('clothes-preview', clothesImage);
                checkReadyToApply();
            };
            clothesImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function displayPreview(containerId, image) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const img = document.createElement('img');
    img.src = image.src;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.objectFit = 'contain';
    container.appendChild(img);
}

// Webcam functionality
async function openWebcam() {
    const modal = document.getElementById('webcam-modal');
    const video = document.getElementById('webcam-video');
    
    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        video.srcObject = webcamStream;
        modal.classList.add('active');
    } catch (error) {
        alert('Unable to access webcam. Please check permissions and try again.');
        console.error('Webcam error:', error);
    }
}

function capturePhoto() {
    const video = document.getElementById('webcam-video');
    const canvas = document.getElementById('webcam-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    personImage = new Image();
    personImage.onload = function() {
        displayPreview('person-preview', personImage);
        checkReadyToApply();
        closeWebcam();
    };
    personImage.src = canvas.toDataURL('image/png');
}

function closeWebcam() {
    const modal = document.getElementById('webcam-modal');
    const video = document.getElementById('webcam-video');
    
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
    }
    video.srcObject = null;
    modal.classList.remove('active');
}

// Check if ready to apply try-on
function checkReadyToApply() {
    const applyBtn = document.getElementById('apply-btn');
    if (personImage && clothesImage) {
        applyBtn.disabled = false;
    } else {
        applyBtn.disabled = true;
    }
}

// Apply try-on effect
function applyTryOn() {
    if (!personImage || !clothesImage) {
        alert('Please upload both a person photo and clothing item.');
        return;
    }
    
    const loading = document.getElementById('loading-overlay');
    loading.classList.add('active');
    
    // Simulate processing time for realistic effect
    setTimeout(() => {
        renderTryOn();
        loading.classList.remove('active');
        
        const canvas = document.getElementById('result-canvas');
        const placeholder = document.getElementById('canvas-placeholder');
        canvas.classList.add('active');
        placeholder.style.display = 'none';
        
        document.getElementById('download-btn').disabled = false;
        document.getElementById('share-btn').disabled = false;
    }, 1500);
}

function renderTryOn() {
    const canvas = document.getElementById('result-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions based on person image
    const maxWidth = 800;
    const maxHeight = 600;
    let width = personImage.width;
    let height = personImage.height;
    
    // Scale to fit
    if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
    }
    if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // Draw person image
    ctx.drawImage(personImage, 0, 0, width, height);
    
    // Calculate clothing overlay position and size
    const clothesScale = clothesSize / 100;
    const clothesWidth = width * 0.6 * clothesScale;
    const clothesHeight = (clothesImage.height / clothesImage.width) * clothesWidth;
    
    // Position clothing (centered horizontally, upper body area)
    const clothesX = (width - clothesWidth) / 2;
    const clothesY = (height * 0.15) + clothesPosition;
    
    // Apply opacity
    ctx.globalAlpha = clothesOpacity / 100;
    
    // Draw clothing
    ctx.drawImage(clothesImage, clothesX, clothesY, clothesWidth, clothesHeight);
    
    // Reset alpha
    ctx.globalAlpha = 1.0;
}

// Adjustment controls
function updateSize(value) {
    clothesSize = parseInt(value);
    document.getElementById('size-value').textContent = value;
    if (personImage && clothesImage) {
        renderTryOn();
    }
}

function updateOpacity(value) {
    clothesOpacity = parseInt(value);
    document.getElementById('opacity-value').textContent = value;
    if (personImage && clothesImage) {
        renderTryOn();
    }
}

function updatePosition(value) {
    clothesPosition = parseInt(value);
    document.getElementById('position-value').textContent = value;
    if (personImage && clothesImage) {
        renderTryOn();
    }
}

// Download result
function downloadResult() {
    const canvas = document.getElementById('result-canvas');
    const link = document.createElement('a');
    link.download = 'tryon-genie-result.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Share result
function shareResult() {
    const canvas = document.getElementById('result-canvas');
    canvas.toBlob(async (blob) => {
        const file = new File([blob], 'tryon-result.png', { type: 'image/png' });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'My Virtual Try-On',
                    text: 'Check out my virtual try-on result from TryOn Genie!'
                });
            } catch (error) {
                console.log('Share cancelled or failed:', error);
            }
        } else {
            alert('Sharing is not supported on this device. Use the download button instead!');
        }
    });
}

// Reset all
function resetAll() {
    personImage = null;
    clothesImage = null;
    clothesSize = 100;
    clothesOpacity = 80;
    clothesPosition = 0;
    
    // Reset previews
    document.getElementById('person-preview').innerHTML = '<p class="placeholder-text">No image uploaded</p>';
    document.getElementById('clothes-preview').innerHTML = '<p class="placeholder-text">No clothing uploaded</p>';
    
    // Reset canvas
    const canvas = document.getElementById('result-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.classList.remove('active');
    document.getElementById('canvas-placeholder').style.display = 'flex';
    
    // Reset sliders
    document.getElementById('size-slider').value = 100;
    document.getElementById('opacity-slider').value = 80;
    document.getElementById('position-slider').value = 0;
    document.getElementById('size-value').textContent = '100';
    document.getElementById('opacity-value').textContent = '80';
    document.getElementById('position-value').textContent = '0';
    
    // Reset file inputs
    document.getElementById('person-upload').value = '';
    document.getElementById('clothes-upload').value = '';
    
    // Disable buttons
    document.getElementById('apply-btn').disabled = true;
    document.getElementById('download-btn').disabled = true;
    document.getElementById('share-btn').disabled = true;
}
