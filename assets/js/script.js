let svgCanvas = document.getElementById('canvas');
let svgCodeArea = document.getElementById('svg-code');
let copyButton = document.getElementById('copy-button');
let straightLineMode = document.getElementById('straight-line-mode');

let drawing = false;
let startX, startY;
let currentElement = null;

svgCanvas.addEventListener('mousedown', (e) => {
    drawing = true;
    startX = e.offsetX;
    startY = e.offsetY;

    currentElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    currentElement.setAttribute('x1', startX);
    currentElement.setAttribute('y1', startY);
    currentElement.setAttribute('x2', startX);
    currentElement.setAttribute('y2', startY);
    currentElement.setAttribute('stroke', 'black');
    svgCanvas.appendChild(currentElement);
});

svgCanvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;

    let endX = e.offsetX;
    let endY = e.offsetY;

    if (straightLineMode.checked) {
        // Calculate the angle and snap it to the nearest 45 degrees
        [endX, endY] = snapTo45Degrees(startX, startY, endX, endY);
    }

    currentElement.setAttribute('x2', endX);
    currentElement.setAttribute('y2', endY);
    updateSVGCode();
});

svgCanvas.addEventListener('mouseup', () => {
    drawing = false;
    currentElement = null;
});

function updateSVGCode() {
    let svgData = svgCanvas.outerHTML;
    svgCodeArea.value = svgData;
}

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
    let snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);  // Snap to nearest 45 degrees
    let distance = Math.sqrt(dx * dx + dy * dy);  // Get the distance between points

    // Calculate the new x2, y2 based on the snapped angle and distance
    let snappedX = x1 + Math.cos(snappedAngle) * distance;
    let snappedY = y1 + Math.sin(snappedAngle) * distance;

    return [snappedX, snappedY];
}
