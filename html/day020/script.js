// Initialize Dexie
const db = new Dexie('PicSpotDB');
db.version(1).stores({
    images: '++id, timestamp'
});

// State
let isDragging = false;
let activeImage = null;
let zoomScale = 1;

// Elements
const dropZone = document.getElementById('drop-zone');
const dragOverlay = document.getElementById('drag-overlay');
const galleryGrid = document.getElementById('gallery-grid');
const emptyState = document.getElementById('empty-state');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxContainer = document.getElementById('lightbox-image-container');
const zoomLevelEl = document.getElementById('zoom-level');

// Render Images
async function renderGallery() {
    const images = await db.images.orderBy('timestamp').reverse().toArray();
    
    galleryGrid.innerHTML = '';
    
    if (images.length === 0) {
        galleryGrid.classList.add('hidden');
        emptyState.classList.remove('hidden');
    } else {
        galleryGrid.classList.remove('hidden');
        emptyState.classList.add('hidden');
        
        images.forEach(img => {
            const blobUrl = URL.createObjectURL(img.blob);
            
            const card = document.createElement('div');
            card.className = "group relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-indigo-500 transition-all cursor-pointer shadow-xl";
            card.onclick = () => openLightbox(img);
            
            const imageEl = document.createElement('img');
            imageEl.src = blobUrl;
            imageEl.alt = img.name;
            imageEl.className = "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110";
            
            const overlay = document.createElement('div');
            overlay.className = "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity";
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = "absolute top-3 right-3 p-2 bg-red-500/80 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0";
            deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                deleteImage(img.id);
            };
            
            card.appendChild(imageEl);
            card.appendChild(overlay);
            card.appendChild(deleteBtn);
            galleryGrid.appendChild(card);
        });
    }
}

async function deleteImage(id) {
    await db.images.delete(id);
    renderGallery();
}

async function start() {
    await renderGallery();
}

start();

// Drag and Drop Logic
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    isDragging = true;
    dragOverlay.classList.remove('opacity-0');
    dropZone.classList.add('bg-indigo-900/20');
});

dropZone.addEventListener('dragleave', (e) => {
    // Only remove if leaving the main container
    if (e.relatedTarget === null || !dropZone.contains(e.relatedTarget)) {
        isDragging = false;
        dragOverlay.classList.add('opacity-0');
        dropZone.classList.remove('bg-indigo-900/20');
    }
});

dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    isDragging = false;
    dragOverlay.classList.add('opacity-0');
    dropZone.classList.remove('bg-indigo-900/20');

    const items = Array.from(e.dataTransfer.items);
    
    for (const item of items) {
        if (item.kind === 'file') {
            const file = item.getAsFile();
            if (file && file.type.startsWith('image/')) {
                await db.images.add({
                    blob: file,
                    name: file.name,
                    type: file.type,
                    timestamp: Date.now(),
                });
            }
        } 
        else if (item.kind === 'string' && item.type === 'text/html') {
            item.getAsString(async (html) => {
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const img = doc.querySelector('img');
                if (img?.src) {
                    await fetchAndSaveImage(img.src, img.alt || 'web-image');
                }
            });
        }
    }
    renderGallery();
});

const fetchAndSaveImage = async (url, name) => {
    try {
        // Warning: This fetch will likely fail for cross-origin images unless CORS is allowed
        // In the original Next.js app, this was client-side fetch too, so limitation persists.
        const response = await fetch(url);
        const blob = await response.blob();
        await db.images.add({
            blob,
            name: name || 'dropped-image',
            type: blob.type,
            timestamp: Date.now(),
        });
        renderGallery();
    } catch (error) {
        console.error('Failed to fetch image:', error);
        alert('一部の画像はセキュリティ制限(CORS)により直接保存できませんでした。');
    }
};

// Paste Logic
window.addEventListener('paste', async (e) => {
    e.preventDefault();
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    
    for (const item of items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
                 await db.images.add({
                    blob: file,
                    name: `pasted-image-${Date.now()}`,
                    type: file.type,
                    timestamp: Date.now(),
                });
                renderGallery();
            }
        }
    }
});


// Lightbox Logic
function openLightbox(img) {
    activeImage = img;
    zoomScale = 1;
    updateZoom();
    lightboxImg.src = URL.createObjectURL(img.blob);
    lightbox.classList.remove('hidden');
}

function closeLightbox() {
    lightbox.classList.add('hidden');
    activeImage = null;
    lightboxImg.src = '';
}

function updateZoom() {
    lightboxContainer.style.transform = `scale(${zoomScale})`;
    zoomLevelEl.textContent = `${Math.round(zoomScale * 100)}%`;
}

// Lightbox Controls
document.getElementById('close-lightbox').onclick = closeLightbox;
document.getElementById('zoom-in').onclick = () => {
    zoomScale = Math.min(zoomScale + 0.2, 5);
    updateZoom();
};
document.getElementById('zoom-out').onclick = () => {
    zoomScale = Math.max(zoomScale - 0.2, 0.5);
    updateZoom();
};
document.getElementById('zoom-reset').onclick = () => {
    zoomScale = 1;
    updateZoom();
};

document.getElementById('lightbox-content').onclick = (e) => {
    if (e.target === document.getElementById('lightbox-content') || e.target === lightboxContainer) {
        closeLightbox();
    }
};

lightbox.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
        zoomScale = Math.min(zoomScale + 0.1, 5);
    } else {
        zoomScale = Math.max(zoomScale - 0.1, 0.5);
    }
    updateZoom();
});

lightboxContainer.addEventListener('dblclick', () => {
    zoomScale = zoomScale === 1 ? 2 : 1;
    updateZoom();
});

// Clipboard Copy
document.getElementById('copy-btn').onclick = async () => {
    if (!activeImage) return;

    try {
        const url = URL.createObjectURL(activeImage.blob);
        const img = new Image();
        
        const pngBlob = await new Promise((resolve, reject) => {
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject('Conversion failed');
                }, 'image/png');
            };
            img.onerror = reject;
            img.src = url;
            // Handle cross origin if needed (though blobs are usually fine)
        });

        const item = new ClipboardItem({ 'image/png': pngBlob });
        await navigator.clipboard.write([item]);
        
        URL.revokeObjectURL(url);
        alert("クリップボードにコピーしました（PNG変換済）");

    } catch (error) {
        console.error("クリップボードにコピーできませんでした", error);
        alert("コピーに失敗しました。このブラウザが画像コピーをサポートしていない可能性があります。");
    }
};
