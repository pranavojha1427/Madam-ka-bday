document.addEventListener('DOMContentLoaded', () => {

    // --- Curtain Overlay Logic ---
    const curtainOverlay = document.getElementById('curtain-overlay');
    const curtainTimer = document.getElementById('curtain-timer');
    // Set target date to 14 August 2026, 00:00:00 (Midnight)
    const targetDate = new Date('2026-08-14T00:00:00').getTime();
    let hasScene1Started = false;

    function updateCurtain() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance <= 0) {
            if (curtainTimer) curtainTimer.innerText = "00d 00h 00m 00s";
            curtainOverlay.classList.add('open');
            if (!hasScene1Started) {
                hasScene1Started = true;
                setTimeout(startScene1Countdown, 1000); // Start counting up as the curtains swing wide
            }
            setTimeout(() => {
                curtainOverlay.style.display = 'none';
            }, 2500); // Wait for transition to finish
            return true;
        } else {
            const d = Math.floor(distance / (1000 * 60 * 60 * 24));
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);
            
            if (curtainTimer) {
                curtainTimer.innerText = `${d}d ${h}h ${m}m ${s}s`;
            }
            return false;
        }
    }

    if (curtainOverlay) {
        if (!updateCurtain()) {
            const timerInterval = setInterval(() => {
                if(updateCurtain()) {
                    clearInterval(timerInterval);
                }
            }, 1000);
        }
    }

    // Secret bypass using hardware Volume Down double press
    document.addEventListener('keydown', (e) => {
        if (e.key === "AudioVolumeDown" || e.code === "VolumeDown" || e.keyCode === 174) {
            volumeDownCount++;
            clearTimeout(volumeDownTimer);
            if (volumeDownCount >= 2) {
                bypassCurtain();
                volumeDownCount = 0;
            } else {
                volumeDownTimer = setTimeout(() => { volumeDownCount = 0; }, 1000);
            }
        }
    });

    // Volume Down is strictly the ONLY bypass method now

    function bypassCurtain() {
        if (curtainOverlay && !curtainOverlay.classList.contains('open')) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => {});
            }
            if (curtainTimer) curtainTimer.innerText = "00d 00h 00m 00s";
            curtainOverlay.classList.add('open');
            if (!hasScene1Started) {
                hasScene1Started = true;
                setTimeout(startScene1Countdown, 1000);
            }
            setTimeout(() => {
                curtainOverlay.style.display = 'none';
            }, 2500);
        }
    }

    function transitionScene(fromId, toId) {
        document.getElementById(fromId).classList.replace('active-state', 'hidden-state');
        document.getElementById(toId).classList.replace('hidden-state', 'active-state');
    }

    // --- Scene 1: Countdown & Burn ---
    const numberEl = document.getElementById('countdown-number');
    let currentNumber = 0;
    
    function startScene1Countdown() {
        // Fast count up from 0 to 19
        let countInterval = setInterval(() => {
            currentNumber++;
            numberEl.innerText = currentNumber;
            if (currentNumber >= 19) {
                clearInterval(countInterval);
                numberEl.classList.add('clickable'); // Ready to be clicked
            }
        }, 80);
    }

    numberEl.addEventListener('click', () => {
        if (currentNumber < 19) return; // ignore clicks before 19

        // Apply SVG Burn effect
        numberEl.style.filter = 'url(#burn-filter)';
        numberEl.classList.remove('clickable'); // Prevent double click
        
        let displacement = document.getElementById('displacement');
        let colorMatrix = document.getElementById('fire-color');
        
        let start = Date.now();
        const duration = 1200; // 1.2 seconds burn

        function burnAnim() {
            let elapsed = Date.now() - start;
            let progress = elapsed / duration;
            
            if (progress > 1) progress = 1;

            // Increase displacement scale
            let scale = progress * 300; 
            displacement.setAttribute('scale', scale);
            
            // shift color to fire (R stays high, G drops, B drops faster, Alpha fades)
            let r = 1 + (progress * 2);
            let g = 1 - progress;
            let b = 1 - (progress * 2);
            let a = 1 - (progress * 1.5);
            if(a < 0) a = 0;

            colorMatrix.setAttribute('values', `${r} 0 0 0 0  0 ${g} 0 0 0  0 0 ${b} 0 0  0 0 0 ${a} 0`);

            if (progress < 1) {
                requestAnimationFrame(burnAnim);
            } else {
                transitionScene('scene-1', 'scene-2');
                initScene2();
            }
        }
        burnAnim();
    });

    // --- Scene 2: Balloons ---
    let s2Init = false;
    function initScene2() {
        if(s2Init) return;
        s2Init = true;
        
        const container = document.getElementById('balloon-container');
        // Elegant vibrant colors
        const colors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#f15bb5', '#00bbf9'];
        
        for (let i = 0; i < 25; i++) {
            let b = document.createElement('div');
            b.className = 'balloon';
            
            let color = colors[Math.floor(Math.random() * colors.length)];
            // Apply 3D glossy gradient using the color
            b.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(255,255,255,0) 40%),
                                  radial-gradient(circle at 70% 70%, rgba(0,0,0,0.2), rgba(0,0,0,0) 50%),
                                  ${color}`;
                                  
            b.style.left = (Math.random() * 95) + 'vw';
            b.style.animationDelay = (Math.random() * 5) + 's';
            b.style.transform = `scale(${0.5 + Math.random()*0.7})`;
            container.appendChild(b);
        }

        // Show cake and activate mic after 2.5 seconds
        setTimeout(() => {
            const cake = document.getElementById('birthday-cake');
            if(cake) cake.classList.remove('hidden-state');
            initMicrophone();
        }, 2500);
    }

    function initMicrophone() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            document.getElementById('to-scene-3').style.display = 'block';
            return;
        }

        // Disable noise suppression so the browser doesn't filter out blowing noises!
        navigator.mediaDevices.getUserMedia({ 
            audio: { 
                echoCancellation: false, 
                noiseSuppression: false, 
                autoGainControl: false 
            } 
        })
        .then(stream => {
            window.micStream = stream; // Store it so we can turn it off later
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            let blown = false;

            function checkBlow() {
                if (blown) return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for(let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                let average = sum / bufferLength;
                
                // Lowered threshold significantly from 80 to 30
                if (average > 30) { 
                    blown = true;
                    extinguishCandles();
                } else {
                    requestAnimationFrame(checkBlow);
                }
            }
            checkBlow();
        })
        .catch(err => {
            console.log("Mic access denied:", err);
            document.getElementById('to-scene-3').style.display = 'block';
        });
    }

    function extinguishCandles() {
        if (window.micStream) {
            window.micStream.getTracks().forEach(track => track.stop());
            window.micStream = null;
        }
        
        const flames = document.querySelectorAll('.flame');
        flames.forEach(flame => flame.classList.add('extinguished'));
        
        setTimeout(() => {
            transitionScene('scene-2', 'scene-3');
            initScene3();
        }, 2000);
    }

    document.getElementById('to-scene-3').addEventListener('click', () => {
        transitionScene('scene-2', 'scene-3');
        initScene3();
    });

    // --- Scene 3: Spiral 2D Ribbon ---
    let s3Init = false;
    let spiralReq;
    
    function initScene3() {
        if (s3Init) return;
        s3Init = true;

        const container = document.getElementById('spiral-container');
        const photoCount = 40; // Increased photo count
        const photos = [];
        
        for (let i = 0; i < photoCount; i++) {
            const texPath = `assets/polaroid${(i%14)+1}.jpg`;
            
            let p = document.createElement('div');
            p.className = 'spiral-photo';
            p.innerHTML = `<img src="${texPath}" alt="memory">`;
            
            container.appendChild(p);
            photos.push(p);
        }
        
        // Animation loop
        const startTime = Date.now();
        
        function animateSpiral() {
            spiralReq = requestAnimationFrame(animateSpiral);
            
            let now = Date.now();
            let elapsed = (now - startTime) / 1000;
            
            const offsetX = window.innerWidth * 0.55;
            const offsetY = window.innerHeight * 0.65;
            
            let scaleX = Math.min(1, window.innerWidth / 1200);
            let scaleY = Math.min(1, window.innerHeight / 800);
            
            for (let i = 0; i < photoCount; i++) {
                // Wide spacing to attach head-to-tail seamlessly
                let baseT = (elapsed * 0.12) - (i * 0.55); 
                
                // Wrap 't' between -12 and +12 for a massive 24-unit track
                let t = ((baseT % 24) + 24) % 24 - 12;
                
                let x = (200 * t - 320 * Math.sin(t)) * scaleX;
                let y = (-380 * Math.exp(-(t * t) / 2.5)) * scaleY; 
                
                let dx = 200 - 320 * Math.cos(t);
                let dy = 380 * (2 * t / 2.5) * Math.exp(-(t * t) / 2.5);
                let angle = Math.atan2(dy, dx) * (180 / Math.PI);
                
                photos[i].style.left = (offsetX + x - 66) + 'px'; // Center for 132px width
                photos[i].style.top = (offsetY + y - 84) + 'px'; // Center for 168px height
                photos[i].style.transform = `rotate(${angle}deg)`;
                
                // Fade out edges smoothly so photos don't abruptly pop in/out
                let opacity = 1;
                if (t > 5) opacity = 1 - (t - 5);
                if (t < -5) opacity = 1 - Math.abs(t + 5);
                photos[i].style.opacity = Math.max(0, opacity);
            }
        }
        animateSpiral();
    }

    document.getElementById('to-scene-4').addEventListener('click', () => {
        cancelAnimationFrame(spiralReq); // stop spiral calculation
        transitionScene('scene-3', 'scene-4');
        initScene4();
    });

    // --- Scene 4: Cute Photo Board ---
    let s4Init = false;
    function initScene4() {
        if (s4Init) return;
        s4Init = true;
        
        const board = document.querySelector('.cute-board');
        const labels = ["Cutie 🥺", "Baddie 😎", "My Love", "Beautiful 🌸", "Dream Girl 💫", "Queen 👑", "Angel ✨", "Perfect 💖"];
        
        for(let i=0; i<8; i++) {
            let polaroid = document.createElement('div');
            polaroid.className = 'cute-polaroid drag';
            
            // Neat grid layout: 2 rows of 4 photos
            let row = Math.floor(i / 4); // 0 or 1
            let col = i % 4; // 0, 1, 2, 3
            
            // Distribute evenly across width (0-75%) and height (5-50%)
            let left = 5 + (col * 23); 
            let top = 5 + (row * 45); 
            let rot = 0; // completely straightened!
            
            polaroid.style.left = left + '%';
            polaroid.style.top = top + '%';
            
            // Inner div doesn't need rotation anymore but kept for structure
            polaroid.innerHTML = `
                <div style="transform: rotate(${rot}deg); width: 100%; height: 100%;">
                    <div class="tape"></div>
                    <div class="sticker"></div>
                    <img src="assets/polaroid${i+1}.jpg" class="photo" alt="memory">
                    <div class="cute-caption">${labels[i % labels.length]}</div>
                </div>
            `;
            board.appendChild(polaroid);
        }
        
        // Initialize draggable
        if($.fn.draggable) {
            $('.drag').draggable({ 
                stack: ".drag",
                containment: "#scene-4"
            });
        }

        // --- Interactive Butterflies ---
        const messages = [
            "titli pakadne me mazza aaraha hai?",
            "Tumsee koiii cuteee ho sakta haii?",
            "Hampieeeee birthday Darlingggg",
            "I loveeee youuuu buruuuu",
            "Howw doo youu manage your hotness?",
            "Dateeee peee chalogiii jiii?",
            "Ekk kissiii milegaaa jiii?",
            "Youuuu areee the besttt babuuuu"
        ];
        
        for(let j=0; j<8; j++) {
            let bf = document.createElement('div');
            bf.className = 'butterfly';
            bf.innerHTML = '🦋';
            bf.style.left = Math.random() * 90 + 'vw';
            bf.style.top = Math.random() * 90 + 'vh';
            // Random colors!
            let hue = Math.floor(Math.random() * 360);
            bf.style.filter = `drop-shadow(0 4px 6px rgba(0,0,0,0.2)) hue-rotate(${hue}deg)`;
            board.appendChild(bf);

            // Move randomly every 5.2 seconds (30% slower)
            setInterval(() => {
                if(!bf.classList.contains('paused')) {
                    bf.style.left = Math.random() * 90 + 'vw';
                    bf.style.top = Math.random() * 90 + 'vh';
                }
            }, 5200);

            // Click to reveal message
            bf.addEventListener('click', (e) => {
                if(bf.classList.contains('paused')) return;
                bf.classList.add('paused');
                
                let msg = document.createElement('div');
                msg.className = 'butterfly-message';
                msg.innerText = messages[j];
                
                // Position message near butterfly
                msg.style.left = (e.clientX + 15) + 'px';
                msg.style.top = (e.clientY - 40) + 'px';
                document.body.appendChild(msg);
                
                // Remove message and resume flying after 3s
                setTimeout(() => {
                    msg.remove();
                    bf.classList.remove('paused');
                }, 3000);
            });
        }
    }

    // --- Scene 5: The Love Letter (Replaced Sketchbook) ---
    const toScene5Btn = document.getElementById('to-scene-5');
    if (toScene5Btn) {
        toScene5Btn.addEventListener('click', () => {
            transitionScene('scene-4', 'scene-5');
        });
    }

    const envelope = document.getElementById('envelope');
    const toScene6Btn = document.getElementById('to-scene-6');
    
    if (envelope) {
        envelope.addEventListener('click', () => {
            envelope.classList.add('open');
            // Show the next button after the letter slides up
            if(toScene6Btn) {
                setTimeout(() => {
                    toScene6Btn.style.opacity = '1';
                    toScene6Btn.style.pointerEvents = 'auto';
                }, 1500);
            }
        });
    }

    // --- Scene 6: The Playlist ---
    if (toScene6Btn) {
        toScene6Btn.addEventListener('click', () => {
            transitionScene('scene-5', 'scene-6');
        });
    }

    const audioPlayer = document.getElementById('global-audio');
    const songItems = document.querySelectorAll('.song-item');
    let currentPlaying = null;

    songItems.forEach(item => {
        const btn = item.querySelector('.play-btn');
        btn.addEventListener('click', () => {
            const src = item.getAttribute('data-src');
            
            // If clicking the currently playing song, pause it
            if (currentPlaying === item && !audioPlayer.paused) {
                audioPlayer.pause();
                btn.textContent = '▶';
                item.classList.remove('playing');
                document.querySelector('.dj-deck').classList.remove('playing');
                document.getElementById('vinyl-record').classList.remove('spinning');
                return;
            }

            // Pause all others
            songItems.forEach(i => {
                i.classList.remove('playing');
                i.querySelector('.play-btn').textContent = '▶';
            });

            // Play this song
            audioPlayer.src = src;
            audioPlayer.play().catch(e => console.log('Audio placeholder:', e));
            btn.textContent = '⏸';
            item.classList.add('playing');
            currentPlaying = item;
            
            document.querySelector('.dj-deck').classList.add('playing');
            document.getElementById('vinyl-record').classList.add('spinning');
        });
    });

    const toScene7Btn = document.getElementById('to-scene-7');
    if (toScene7Btn) {
        toScene7Btn.addEventListener('click', () => {
            if (audioPlayer) audioPlayer.pause(); // Stop music when going to video
            transitionScene('scene-6', 'scene-7');
        });
    }

    // --- Scene 7: The Video (Finale) ---
    const videoElement = document.getElementById('memory-video');
});