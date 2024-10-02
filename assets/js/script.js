let svgCanvas = document.getElementById('canvas');
let svgCodeArea = document.getElementById('svg-code');
let copyButton = document.getElementById('copy-button');

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
