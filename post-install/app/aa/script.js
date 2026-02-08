// Copyright by Sangram – integrat în index.html cu text default "welcome"

const textElement = document.getElementById('welcomeSvgText') || document.getElementById('svgText');
const inputElement = document.getElementById('userInput');
const orb1 = document.getElementById('welcomeOrb1') || document.getElementById('orb1');
const orb2 = document.getElementById('welcomeOrb2') || document.getElementById('orb2');

const colors = [
    ['bg-blue-300', 'bg-purple-300'],
    ['bg-red-300', 'bg-orange-300'],
    ['bg-green-300', 'bg-teal-300'],
    ['bg-pink-300', 'bg-rose-300'],
    ['bg-indigo-300', 'bg-cyan-300']
];
let colorIndex = 0;

if (textElement) {
    document.fonts.ready.then(() => {
        resetAnimation();
    });
}

if (inputElement) {
    inputElement.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') updateText();
    });
}

function updateText() {
    if (!textElement || !inputElement) return;
    const newText = inputElement.value.trim();
    if (newText) {
        textElement.style.opacity = '0';
        textElement.style.transition = 'opacity 0.3s ease';

        setTimeout(() => {
            textElement.textContent = newText.toLowerCase();
            
            colorIndex = (colorIndex + 1) % colors.length;
            if (orb1) orb1.className = `orb w-96 h-96 top-[-100px] left-[-100px] ${colors[colorIndex][0]}`;
            if (orb2) orb2.className = `orb w-96 h-96 bottom-[-50px] right-[-50px] ${colors[colorIndex][1]}`;
            if (orb1) orb1.style.transform = `translate(${Math.random() * 50}px, ${Math.random() * 50}px)`;
            if (orb2) orb2.style.transform = `translate(${Math.random() * -50}px, ${Math.random() * -50}px)`;

            resetAnimation();
        }, 300);
    }
}

function resetAnimation() {
    if (!textElement) return;
    textElement.classList.remove('animate-draw');
    
    const length = textElement.getComputedTextLength();
    const buffer = 50; 
    const totalLength = length + buffer;

    const writingSpeed = 150; 
    let duration = totalLength / writingSpeed;
    duration = Math.max(2.5, Math.min(duration, 8));

    textElement.style.setProperty('--stroke-length', totalLength);
    textElement.style.setProperty('--draw-duration', `${duration}s`);

    void textElement.offsetWidth;
    
    textElement.style.opacity = ''; 
    textElement.classList.add('animate-draw');
    
    if (inputElement) inputElement.value = '';
}