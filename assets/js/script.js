let svgCanvas = document.getElementById('canvas');
let svgCodeArea = document.getElementById('svg-code');
let copyButton = document.getElementById('copy-button');
let straightLineMode = document.getElementById('straight-line-mode');
let shapeButtons = document.querySelectorAll('.shape-btn');

let drawing = false;
let startX, startY;
let currentElement = null;
let currentShape = 'line';  // Default shape is line

// Handle shape selection
shapeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        currentShape = e.target.getAttribute('data-shape');
        shapeButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
    });
});

// Mouse events for desktops
svgCanvas.addEventListener('mousedown', (e) => startDrawing(e.offsetX, e.offsetY));
svgCanvas.addEventListener('mousemove', (e) => draw(e.offsetX, e.offsetY));
svgCanvas.addEventListener('mouseup', stopDrawing);

// Touch events for mobile
svgCanvas.addEventListener('touchstart', (e) => {
    let touch = e.touches[0];
    let rect = svgCanvas.getBoundingClientRect();
    startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
});
svgCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Prevent scrolling while drawing
    let touch = e.touches[0];
    let rect = svgCanvas.getBoundingClientRect();
    draw(touch.clientX - rect.left, touch.clientY - rect.top);
});
svgCanvas.addEventListener('touchend', stopDrawing);

// Start drawing (works for both mouse and touch)
function startDrawing(x, y) {
    drawing = true;
    startX = x;
    startY = y;

    if (currentShape === 'line') {
        currentElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        currentElement.setAttribute('x1', startX);
        currentElement.setAttribute('y1', startY);
        currentElement.setAttribute('x2', startX);
        currentElement.setAttribute('y2', startY);
        currentElement.setAttribute('stroke', 'black');
    } else if (currentShape === 'rectangle') {
        currentElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        currentElement.setAttribute('x', startX);
        currentElement.setAttribute('y', startY);
        currentElement.setAttribute('width', 0);
        currentElement.setAttribute('height', 0);
        currentElement.setAttribute('fill', 'none');
        currentElement.setAttribute('stroke', 'black');
    } else if (currentShape === 'circle') {
        currentElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        currentElement.setAttribute('cx', startX);
        currentElement.setAttribute('cy', startY);
        currentElement.setAttribute('r', 0);
        currentElement.setAttribute('fill', 'none');
        currentElement.setAttribute('stroke', 'black');
    }

    svgCanvas.appendChild(currentElement);
}

// Drawing (works for both mouse and touch)
function draw(x, y) {
    if (!drawing) return;

    if (currentShape === 'line') {
        if (straightLineMode.checked) {
            [x, y] = snapTo45Degrees(startX, startY, x, y);
        }
        currentElement.setAttribute('x2', x);
        currentElement.setAttribute('y2', y);
    } else if (currentShape === 'rectangle') {
        let width = x - startX;
        let height = y - startY;
        currentElement.setAttribute('width', Math.abs(width));
        currentElement.setAttribute('height', Math.abs(height));
        if (width < 0) currentElement.setAttribute('x', x);
        if (height < 0) currentElement.setAttribute('y', y);
    } else if (currentShape === 'circle') {
        let radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
        currentElement.setAttribute('r', radius);
    }

    updateSVGCode();
}

// Stop drawing (works for both mouse and touch)
function stopDrawing() {
    drawing = false;
    currentElement = null;
}

// Update the SVG code
function updateSVGCode() {
    let svgData = svgCanvas.outerHTML;
    svgCodeArea.value = svgData;
}

// Copy SVG code to clipboard
copyButton.addEventListener('click', () => {
    svgCodeArea.select();
    document.execCommand('copy');
    alert('SVG code copied to clipboard!');
});

// Function to snap line to nearest 45 degrees
function snapTo45Degrees(x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let angle = Math.atan2(dy, dx);  // Calculate the angle in radians
    let snappedAngle = Math.round(angle / (
