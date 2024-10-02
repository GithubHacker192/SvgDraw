let svgCanvas = document.getElementById('canvas');
let svgCodeArea = document.getElementById('svg-code');
let copyButton = document.getElementById('copy-button');
let deleteButton = document.getElementById('delete-button');
let straightLineMode = document.getElementById('straight-line-mode');
let snapToPoints = document.getElementById('snap-to-points');
let shapeButtons = document.querySelectorAll('.shape-btn');

let drawing = false;
let startX, startY;
let currentElement = null;
let currentShape = 'line';  // Default shape is line
let drawnElements = []; // Array to keep track of drawn elements

// Handle shape selection
shapeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        currentShape = e.target.getAttribute('data-shape');
        shapeButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
    });
});

// Mouse events for desktops
svgCanvas.addEventListener('mousedown', (e) => {
    startDrawing(e.offsetX, e.offsetY);
    drawing = true; // Start drawing immediately on mousedown
});
svgCanvas.addEventListener('mousemove', (e) => {
    if (drawing) draw(e.offsetX, e.offsetY); // Keep drawing while mouse is moving
});
svgCanvas.addEventListener('mouseup', () => stopDrawing());

// Touch events for mobile
svgCanvas.addEventListener('touchstart', (e) => {
    let touch = e.touches[0];
    let rect = svgCanvas.getBoundingClientRect();
    startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
    drawing = true; // Start drawing immediately on touchstart
});
svgCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Prevent scrolling while drawing
    if (drawing) {
        let touch = e.touches[0];
        let rect = svgCanvas.getBoundingClientRect();
        draw(touch.clientX - rect.left, touch.clientY - rect.top);
    }
});
svgCanvas.addEventListener('touchend', stopDrawing);

// Start drawing (works for both mouse and touch)
function startDrawing(x, y) {
    // Snap to existing points if near them and checkbox is checked
    if (snapToPoints.checked) {
        let snapPoint = getSnapPoint(x, y);
        if (snapPoint) {
            [x, y] = snapPoint;
        }
    }

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
    drawnElements.push(currentElement); // Add current element to the array
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

// Function to delete the last drawn shape
deleteButton.addEventListener('click', () => {
    if (drawnElements.length > 0) {
        // Remove the last element from the SVG
        svgCanvas.removeChild(drawnElements.pop());
        updateSVGCode();
    }
});

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
    let snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);  // Snap to nearest 45 degrees
    let distance = Math.sqrt(dx * dx + dy * dy);  // Get the distance between points

    // Calculate the new x2, y2 based on the snapped angle and distance
    let snappedX = x1 + Math.cos(snappedAngle) * distance;
    let snappedY = y1 + Math.sin(snappedAngle) * distance;

    return [snappedX, snappedY];
}

// Function to get a snapping point if close to existing endpoints
function getSnapPoint(x, y) {
    const snapThreshold = 10; // Snap threshold in pixels

    for (let element of drawnElements) {
        if (element.tagName === 'line') {
            let x1 = parseFloat(element.getAttribute('x1'));
            let y1 = parseFloat(element.getAttribute('y1'));
            let x2 = parseFloat(element.getAttribute('x2'));
            let y2 = parseFloat(element.getAttribute('y2'));

            // Check if the current point is close to the endpoints
            if (isPointCloseToPoint(x, y, x1, y1, snapThreshold)) {
                return [x1, y1]; // Snap to the first endpoint
            }
            if (isPointCloseToPoint(x, y, x2, y2, snapThreshold)) {
                return [x2, y2]; // Snap to the second endpoint
            }
        } else if (element.tagName === 'rect') {
            let x1 = parseFloat(element.getAttribute('x'));
            let y1 = parseFloat(element.getAttribute('y'));
            let width = parseFloat(element.getAttribute('width'));
            let height = parseFloat(element.getAttribute('height'));

            // Check corners of the rectangle
            let corners = [
                [x1, y1],
                [x1 + width, y1],
                [x1, y1 + height],
                [x1 + width, y1 + height]
            ];

            for (let corner of corners) {
                if (isPointCloseToPoint(x, y, corner[0], corner[1], snapThreshold)) {
                    return corner; // Snap to corner
                }
            }
        } else if (element.tagName === 'circle') {
            let cx = parseFloat(element.getAttribute('cx'));
            let cy = parseFloat(element.getAttribute('cy'));
            let r = parseFloat(element.getAttribute('r'));

            // Check if the point is close to the edge of the circle
            if (isPointCloseToPoint(x, y, cx + r, cy, snapThreshold) ||
                isPointCloseToPoint(x, y, cx - r, cy, snapThreshold) ||
                isPointCloseToPoint(x, y, cx, cy + r, snapThreshold) ||
                isPointCloseToPoint(x, y, cx, cy - r, snapThreshold)) {
                return [cx + r, cy]; // Snap to the edge of the circle
            }
        }
    }
    return null; // No snap point found
}

// Function to check if a point is close to another point
function isPointCloseToPoint(px, py, qx, qy, threshold) {
    return Math.abs(px - qx) < threshold && Math.abs(py - qy) < threshold;
}
