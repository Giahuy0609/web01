document.addEventListener('DOMContentLoaded', function() {
    const flame = document.getElementById('flame');
    const birthdayMusic = document.getElementById('birthdayMusic');
    const startButton = document.getElementById('startButton');
    const instructions = document.getElementById('instructions');
    const canvas = document.getElementById('confetti-canvas');
    const balloonContainer = document.getElementById('balloonContainer'); // Thêm dòng này
    
    let audioContext;
    let microphone;
    let analyser;
    let isBlowing = false;
    let isCelebrationStarted = false;
    let confettiCanvas;
  

    function createBalloons() {
        const container = document.getElementById('balloonContainer');
        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink'];
        const balloonCount = 20;
        
        container.innerHTML = '';
        
        for (let i = 0; i < balloonCount; i++) {
          setTimeout(() => {
            const balloon = document.createElement('div');
            const color = colors[Math.floor(Math.random() * colors.length)];
            balloon.className = `balloon ${color}`;
            
            balloon.style.left = `${Math.random() * 100}vw`;
            const size = Math.random() * 0.6 + 0.6;
            balloon.style.transform = `scale(${size})`;
            
            const duration = Math.random() * 5 + 5;
            balloon.style.animation = `balloon-float ${duration}s ease-in forwards`;
            
            container.appendChild(balloon);
            
            setTimeout(() => {
              balloon.remove();
            }, duration * 1000);
          }, i * 200);
        }
      }
    




    // Khởi tạo Confetti
    function initConfetti() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    
      confettiCanvas = new ConfettiCanvas({
        canvas: canvas,
        maxParticles: 150,
        speed: 1.5,
        fadeSpeed: 0.02,
        particleSize: 6,
        colors: ['#f44336', '#e91e63', '#9c27b0', '#FF9800', '#FFEB3B', '#4CAF50', '#2196F3']
      });
    }
  
    // Thổi tắt nến
    function blowOutCandle() {
      if (!flame.classList.contains('blown')) {
        flame.classList.add('blown');
        confettiCanvas.start();

        if (confettiCanvas && typeof confettiCanvas.start === 'function') {
          confettiCanvas.start();
        } else {
          console.error("ConfettiCanvas is not initialized correctly.");
        }
        setTimeout(() => confettiCanvas.stop(), 5000);
        
        // Giảm volume nhạc dần
       
        birthdayMusic.volume = 1;
      
        instructions.textContent = "Con Chúc mừng sinh nhật Ba,con chúc ba tuổi mới sức khỏe và đạt nhiều thành tựu trong sự nghiệp   🎉";

        startButton.textContent = "Đốt nến lên";
        startButton.onclick = function() {
          flame.classList.remove('blown'); // Khôi phục nến
          startButton.textContent = "Thổi nến";
          startButton.onclick = blowOutCandle; // Thêm lại hành vi thổi nến
      };
    }
    }
    // Bắt đầu lễ kỷ niệm
    function startCelebration() {
      if (isCelebrationStarted) return;
      isCelebrationStarted = true;
      
      createBalloons(); 


      instructions.textContent = "Đang chuẩn bị...";
      startButton.disabled = true;
      
      // Phát nhạc offline với xử lý lỗi
      birthdayMusic.volume = 0.7;
      
      // Kiểm tra xem trình duyệt có cho phép phát nhạc không
      const playPromise = birthdayMusic.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          instructions.textContent = "Hãy thổi vào microphone để thổi tắt nến!";
          setupMicrophone();
        }).catch(error => {
          console.error("Lỗi phát nhạc:", error);
          handleMusicPlayError();
        });
      } else {
        // Fallback cho trình duyệt cũ
        try {
          birthdayMusic.play();
          instructions.textContent = "Hãy thổi vào microphone để thổi tắt nến!";
          setupMicrophone();
        } catch (error) {
          console.error("Lỗi phát nhạc:", error);
          handleMusicPlayError();
        }
      }
    }
    
    // Xử lý khi phát nhạc bị lỗi
    function handleMusicPlayError() {
      instructions.textContent = "Nhấn vào nút để bật nhạc và bắt đầu";
      startButton.textContent = "Bật nhạc";
      startButton.disabled = false;
      isCelebrationStarted = false;
      
      // Thêm sự kiện click mới
      startButton.onclick = function() {
        birthdayMusic.play().then(() => {
          instructions.textContent = "Hãy thổi vào microphone để thổi tắt nến!";
          setupMicrophone();
        }).catch(error => {
          instructions.textContent = "Không thể phát nhạc. Hãy nhấn nút để thổi tắt nến!";
          startButton.textContent = "Thổi nến";
          startButton.onclick = blowOutCandle;
        });
      };
    }
  
    // Thiết lập microphone
    function setupMicrophone() {
      // Tạo AudioContext sau khi có tương tác người dùng
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      
      // Yêu cầu quyền truy cập microphone
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
          .then(handleMicrophoneAccess)
          .catch(handleMicrophoneError);
      } else {
        handleMicrophoneError(new Error('Microphone API không khả dụng'));
      }
    }
  
    function handleMicrophoneAccess(stream) {
      microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      
      // Bắt đầu phát hiện thổi
      detectBlowing();
      
      // Thêm fallback bằng nút nhấn
      startButton.textContent = "Thổi nến";
      startButton.onclick = blowOutCandle;
      startButton.disabled = false;
    }
  
    function handleMicrophoneError(error) {
      console.error("Lỗi microphone:", error);
      instructions.textContent = "Không thể truy cập microphone. Hãy nhấn nút để thổi tắt nến!";
      startButton.textContent = "Thổi nến";
      startButton.onclick = blowOutCandle;
      startButton.disabled = false;
    }
  
    // Phát hiện thổi vào microphone (giữ nguyên)
    function detectBlowing() {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      function checkBlowing() {
        analyser.getByteFrequencyData(dataArray);
        
        let total = 0;
        for (let i = 0; i < bufferLength; i++) {
          total += dataArray[i];
        }
        
        const average = total / bufferLength;
        
        if (average > 50 && !isBlowing) {
          isBlowing = true;
          blowOutCandle();
        } else if (average <= 50) {
          isBlowing = false;
        }
        
        requestAnimationFrame(checkBlowing);
      }
      
      checkBlowing();
    }
  
    // Khởi tạo
    initConfetti();
    startButton.addEventListener('click', startCelebration);
    
    // Tự động điều chỉnh kích thước canvas khi load
    window.addEventListener('load', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
    
    // Thêm sự kiện để xử lý khi tab được focus lại
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'visible' && isCelebrationStarted) {
        birthdayMusic.play().catch(e => console.log("Không thể tự động phát lại nhạc:", e));
      }
    });
});

window.addEventListener('resize', function() {
  const bg = document.querySelector('.background-container');
  const aspectRatio = window.innerWidth / window.innerHeight;
  
  if (aspectRatio > 1) {
      // Màn hình ngang
      bg.style.backgroundSize = 'cover';
      bg.style.backgroundPosition = 'center center';
  } else {
      // Màn hình dọc
      bg.style.backgroundSize = 'contain';
      bg.style.backgroundPosition = 'center top';
  }
});

function ConfettiCanvas(options) {
  this.canvas = options.canvas;
  this.ctx = this.canvas.getContext('2d');
  this.maxParticles = options.maxParticles || 100;
  this.particles = [];
  this.speed = options.speed || 1;
  this.particleSize = options.particleSize || 5;
  this.colors = options.colors || ['#ff0', '#f0f', '#0ff', '#f00', '#0f0', '#00f'];
  this.fadeSpeed = options.fadeSpeed || 0.01;
  this.running = false;

  // Khởi tạo hạt giấy
  for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle());
  }
}

ConfettiCanvas.prototype.createParticle = function () {
  const x = Math.random() * this.canvas.width;
  const y = Math.random() * this.canvas.height;
  const vx = (Math.random() - 0.5) * this.speed;
  const vy = Math.random() * -this.speed - 1;
  const color = this.colors[Math.floor(Math.random() * this.colors.length)];
  const opacity = Math.random();
  return { x, y, vx, vy, color, opacity };
};

ConfettiCanvas.prototype.start = function () {
  this.running = true;
  this.animate();
};

ConfettiCanvas.prototype.stop = function () {
  this.running = false;
};

ConfettiCanvas.prototype.animate = function () {
  if (!this.running) return;

  const ctx = this.ctx;
  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  for (let p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.opacity -= this.fadeSpeed;

      if (p.y < 0 || p.opacity <= 0) {
          Object.assign(p, this.createParticle(), { y: this.canvas.height, opacity: 1 });
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.beginPath();
      ctx.arc(p.x, p.y, this.particleSize, 0, Math.PI * 2);
      ctx.fill();
  }

  ctx.globalAlpha = 1;

  requestAnimationFrame(this.animate.bind(this));
};