// Obtener elementos del DOM
const audioPlayer = document.getElementById('audioPlayer');
const visualizer = document.getElementById('visualizer');
const ctx = visualizer.getContext('2d');

// Configuración del Canvas
visualizer.width = visualizer.offsetWidth;
visualizer.height = 100; // Altura fija para el visualizador
const WIDTH = visualizer.width;
const HEIGHT = visualizer.height;

// Inicialización del Web Audio API
let audioCtx;
let analyser;
let source;

/**
 * Inicializa el contexto de audio y el analizador.
 * Se llama solo una vez cuando se reproduce la música por primera vez.
 */
function setupAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        
        // Configuración del analizador
        analyser.fftSize = 256; 
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        
        // Conectar el elemento <audio> al analizador
        source = audioCtx.createMediaElementSource(audioPlayer);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
    }
}

/**
 * Función que se llama desde el HTML para cambiar y reproducir la canción.
 * @param {string} songFile El nombre del archivo de la canción (ej: 'rock.mp3').
 */
window.playSong = function(songFile) {
    // Si el contexto de audio aún no está configurado, inicializarlo
    setupAudioContext();

    // Establecer la nueva fuente de audio y reproducir
    audioPlayer.src = `audios/${songFile}`;
    audioPlayer.load(); // Cargar la nueva fuente
    audioPlayer.play();

    // Reanudar el contexto si estaba suspendido (común en Chrome)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    // Iniciar el loop de visualización
    draw();
};

/**
 * Función principal para dibujar las barras del visualizador.
 */
function draw() {
    // Asegurarse de que el analizador esté inicializado
    if (!analyser) return;

    // Solicitar el siguiente frame de animación
    requestAnimationFrame(draw);

    // Obtener los datos de frecuencia
    analyser.getByteFrequencyData(dataArray);

    // Limpiar el canvas
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Parámetros para el dibujo de las barras
    const bufferLength = analyser.frequencyBinCount;
    const barWidth = (WIDTH / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    // Dibujar cada barra
    for(let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2; // Escalar la altura

        // Color de las barras (cambia de color según la frecuencia)
        const r = barHeight + (25 * (i/bufferLength));
        const g = 250 * (i/bufferLength);
        const b = 50;
        
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        x += barWidth + 1; // Espacio entre barras
    }
}

// Iniciar la reproducción por defecto (si hay una fuente inicial)
audioPlayer.addEventListener('play', () => {
    setupAudioContext();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    draw();
});

// Detener la visualización cuando el audio está en pausa
audioPlayer.addEventListener('pause', () => {
    // Podrías detener el loop si quisieras, pero a menudo es mejor dejarlo correr
    // para que la interfaz se vea viva, aunque con barras planas.
});
