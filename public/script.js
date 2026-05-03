document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const welcomeScreen = document.getElementById('welcome-screen');
    const customizeScreen = document.getElementById('customize-screen');
    const gameScreen = document.getElementById('game-screen');
    const leaderboardScreen = document.getElementById('leaderboard-screen');
    const startAnimation = document.getElementById('start-animation');
    const usernameInput = document.getElementById('username-input');
    const roomIdInput = document.getElementById('room-id-input');
    const createRoomBtn = document.getElementById('create-room-btn');
    const joinRoomBtn = document.getElementById('join-room-btn');
    const backBtn = document.getElementById('back-btn');
    const startGameBtn = document.getElementById('start-game-btn');
    const startGameBtnBottom = document.getElementById('start-game-btn-bottom');
    const generatedRoomId = document.getElementById('generated-room-id');
    const copyRoomCodeBtn = document.getElementById('copy-room-code');
    const errorMessage = document.getElementById('error-message');
    const playersContainer = document.getElementById('players-container');
    const playersCount = document.querySelector('.players-count');
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendMessageBtn = document.getElementById('send-message-btn');
    const roomIdDisplay = document.getElementById('room-id-display');
    const timerDisplay = document.getElementById('timer');
    const currentDrawer = document.getElementById('current-drawer');
    const roundInfo = document.getElementById('round-info');
    const clearCanvasBtn = document.getElementById('clear-canvas-btn');
    const undoBtn = document.getElementById('undo-btn');
    const eraserBtn = document.getElementById('eraser-btn');
    const fillBtn = document.getElementById('fill-btn');
    const canvas = document.getElementById('drawing-canvas');
    const wordDisplay = document.getElementById('word-display');
    const viewWordBtn = document.getElementById('view-word-btn');
    const colorOptions = document.querySelectorAll('.color-option');
    const brushSize = document.getElementById('brush-size');
    const brushSizeValue = document.getElementById('brush-size-value');
    const optionButtons = document.querySelectorAll('.option-btn');
    const leaveRoomBtn = document.getElementById('leave-room-btn');
    const backToGameBtn = document.getElementById('back-to-game-btn');
    const shareLeaderboardBtn = document.getElementById('share-leaderboard-btn');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const startMessage = document.getElementById('start-message');
    const playerWelcome = document.getElementById('player-welcome');
    const evoStages = document.getElementById('evo-stages');

    // Canvas context
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let currentColor = 'black';
    let currentBrushSize = 5;
    let isPlayerDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let gameSettings = {};
    let roomId = '';
    let isRoomCreator = false;
    let username = '';
    let wordDisplayTimeout = null;
    let drawingHistory = [];
    let isEraserActive = false;
    let isFillActive = false;
    let isCanvasInitialized = false;

    // ═══ Particle System ═══
    function initParticles() {
        const particlesContainer = document.getElementById('particles-js');
        if (!particlesContainer) return;
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const size = Math.random() * 3 + 1;
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * 5;
            particle.style.cssText = `
                position: absolute; top: ${y}%; left: ${x}%;
                width: ${size}px; height: ${size}px;
                background: rgba(0, 243, 255, ${Math.random() * 0.5 + 0.1});
                border-radius: 50%;
                animation: float-particle ${duration}s linear infinite;
                animation-delay: -${delay}s;
            `;
            particlesContainer.appendChild(particle);
        }
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float-particle {
                0% { transform: translateY(0); opacity: 0; }
                50% { opacity: 1; }
                100% { transform: translateY(-100vh); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    initParticles();

    // ═══ Evolution Animation ═══
    function showStartAnimation() {
        if (!startAnimation) return;
        startAnimation.classList.remove('hidden');

        // Set player name
        if (playerWelcome) {
            playerWelcome.textContent = `WELCOME, ${(username || 'PLAYER').toUpperCase()}`;
        }

        // Reset evolution stages
        if (evoStages) {
            const stages = evoStages.querySelectorAll('.evo-stage');
            const connectors = evoStages.querySelectorAll('.evo-connector');
            stages.forEach(s => { s.classList.remove('active'); });
            connectors.forEach(c => { c.classList.remove('active'); });

            // Animate stages sequentially
            let delay = 400;
            stages.forEach((stage, i) => {
                setTimeout(() => { stage.classList.add('active'); }, delay);
                delay += 400;
                if (connectors[i]) {
                    setTimeout(() => { connectors[i].classList.add('active'); }, delay);
                    delay += 200;
                }
            });
        }

        // Animate status text
        const statusText = startAnimation.querySelector('.status-text');
        const statuses = ['INITIALIZING NEURAL LINK...', 'CONNECTING TO MAINFRAME...', 'LOADING 500+ QUESTIONS...', 'OPTIMIZING SYSTEM...', 'ACCESS GRANTED'];
        let i = 0;
        const interval = setInterval(() => {
            if (statusText && i < statuses.length) {
                statusText.textContent = statuses[i];
                i++;
            } else {
                clearInterval(interval);
            }
        }, 600);
    }

    function hideStartAnimation() {
        if (startAnimation) startAnimation.classList.add('hidden');
    }

    // ═══ Mobile Tab Bar ═══
    function initMobileTabBar() {
        const mobileTabs = document.querySelectorAll('.mobile-tab');
        const playersList = document.querySelector('.players-list');
        const chatContainer = document.querySelector('.chat-container');

        if (!mobileTabs.length) return;

        // Default: show players on mobile
        if (playersList) playersList.classList.add('mobile-active');

        mobileTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                mobileTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const panel = tab.getAttribute('data-panel');
                if (panel === 'players') {
                    if (playersList) playersList.classList.add('mobile-active');
                    if (chatContainer) chatContainer.classList.remove('mobile-active');
                } else {
                    if (playersList) playersList.classList.remove('mobile-active');
                    if (chatContainer) chatContainer.classList.add('mobile-active');
                }
            });
        });
    }
    initMobileTabBar();

    // ═══ Canvas Setup ═══
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = currentBrushSize;
        ctx.strokeStyle = currentColor;
        isCanvasInitialized = true;
    }
    window.addEventListener('resize', resizeCanvas);

    function initializeCanvas() {
        if (gameScreen.classList.contains('hidden')) return;
        resizeCanvas();
    }

    // ═══ Drawing Events ═══
    function setupCanvasEvents() {
        canvas.addEventListener('mousedown', startDrawingHandler);
        canvas.addEventListener('mousemove', drawHandler);
        canvas.addEventListener('mouseup', stopDrawingHandler);
        canvas.addEventListener('mouseout', stopDrawingHandler);
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd);
    }

    function removeCanvasEvents() {
        canvas.removeEventListener('mousedown', startDrawingHandler);
        canvas.removeEventListener('mousemove', drawHandler);
        canvas.removeEventListener('mouseup', stopDrawingHandler);
        canvas.removeEventListener('mouseout', stopDrawingHandler);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
    }

    function startDrawingHandler(e) {
        if (!isPlayerDrawing || !isCanvasInitialized) return;
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        lastX = clientX - rect.left;
        lastY = clientY - rect.top;

        try {
            drawingHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            if (drawingHistory.length > 50) drawingHistory.shift();
        } catch (error) { console.error('Error saving canvas state:', error); }

        if (isFillActive) {
            ctx.fillStyle = isEraserActive ? '#ffffff' : currentColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            if (typeof socket !== 'undefined' && socket) {
                socket.emit('fill-canvas', { color: isEraserActive ? '#ffffff' : currentColor });
            }
            isDrawing = false;
            return;
        }

        if (typeof socket !== 'undefined' && socket) {
            socket.emit('drawing', {
                x: lastX / canvas.width, y: lastY / canvas.height,
                color: isEraserActive ? '#ffffff' : currentColor,
                size: currentBrushSize, type: 'start'
            });
        }
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
    }

    function drawHandler(e) {
        if (!isDrawing || !isPlayerDrawing || isFillActive || !isCanvasInitialized) return;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.lineWidth = currentBrushSize;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = isEraserActive ? '#ffffff' : currentColor;

        const midX = (lastX + x) / 2;
        const midY = (lastY + y) / 2;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.quadraticCurveTo(lastX, lastY, midX, midY);
        ctx.stroke();

        if (typeof socket !== 'undefined' && socket) {
            socket.emit('drawing', {
                x: x / canvas.width, y: y / canvas.height,
                lastX: lastX / canvas.width, lastY: lastY / canvas.height,
                color: isEraserActive ? '#ffffff' : currentColor,
                size: currentBrushSize, type: 'draw'
            });
        }
        lastX = x;
        lastY = y;
    }

    function stopDrawingHandler() {
        if (!isPlayerDrawing) return;
        isDrawing = false;
        if (typeof socket !== 'undefined' && socket) {
            socket.emit('drawing', { type: 'end' });
        }
    }

    function handleTouchStart(e) { e.preventDefault(); startDrawingHandler(e); }
    function handleTouchMove(e) { e.preventDefault(); drawHandler(e); }
    function handleTouchEnd(e) { e.preventDefault(); stopDrawingHandler(); }

    // ═══ Color & Brush ═══
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            currentColor = option.getAttribute('data-color');
            colorOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            ctx.strokeStyle = currentColor;
            isEraserActive = false;
            isFillActive = false;
            if (eraserBtn) eraserBtn.classList.remove('active');
            if (fillBtn) fillBtn.classList.remove('active');
        });
    });

    if (brushSize && brushSizeValue) {
        brushSize.addEventListener('input', () => {
            currentBrushSize = parseInt(brushSize.value);
            brushSizeValue.textContent = currentBrushSize + 'px';
            ctx.lineWidth = currentBrushSize;
        });
    }

    // ═══ Tool Buttons ═══
    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            if (drawingHistory.length > 0 && isCanvasInitialized) {
                try {
                    ctx.putImageData(drawingHistory.pop(), 0, 0);
                    if (typeof socket !== 'undefined' && socket) socket.emit('undo');
                } catch (error) { console.error('Error undoing:', error); }
            }
        });
    }

    if (eraserBtn) {
        eraserBtn.addEventListener('click', () => {
            isEraserActive = !isEraserActive;
            isFillActive = false;
            if (fillBtn) fillBtn.classList.remove('active');
            eraserBtn.classList.toggle('active', isEraserActive);
        });
    }

    if (fillBtn) {
        fillBtn.addEventListener('click', () => {
            isFillActive = !isFillActive;
            isEraserActive = false;
            if (eraserBtn) eraserBtn.classList.remove('active');
            fillBtn.classList.toggle('active', isFillActive);
        });
    }

    // Option buttons selection
    optionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const group = btn.parentElement;
            group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

    // Clear canvas
    if (clearCanvasBtn) {
        clearCanvasBtn.addEventListener('click', () => {
            if (!isCanvasInitialized) return;
            try {
                drawingHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
                if (drawingHistory.length > 50) drawingHistory.shift();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (typeof socket !== 'undefined' && socket) socket.emit('clear-canvas');
            } catch (error) { console.error('Error clearing canvas:', error); }
        });
    }

    // Copy room code
    if (copyRoomCodeBtn && generatedRoomId) {
        copyRoomCodeBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(generatedRoomId.textContent).then(() => {
                copyRoomCodeBtn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => { copyRoomCodeBtn.innerHTML = '<i class="fas fa-copy"></i>'; }, 2000);
            }).catch(err => console.error('Failed to copy:', err));
        });
    }

    // ═══ Room & Game Buttons ═══
    if (createRoomBtn) {
        createRoomBtn.addEventListener('click', () => {
            username = usernameInput ? usernameInput.value.trim() : '';
            if (username) {
                if (welcomeScreen) welcomeScreen.classList.add('hidden');
                if (customizeScreen) customizeScreen.classList.remove('hidden');
                isRoomCreator = true;
                if (typeof socket !== 'undefined' && socket) socket.emit('create-room', username);
            } else {
                showError('Please enter a username');
            }
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (customizeScreen) customizeScreen.classList.add('hidden');
            if (welcomeScreen) welcomeScreen.classList.remove('hidden');
            isRoomCreator = false;
        });
    }

    // Start game button (settings screen)
    if (startGameBtn) {
        startGameBtn.addEventListener('click', () => {
            const playersEl = document.querySelector('.setting-group:nth-child(1) .option-btn.selected');
            const drawTimeEl = document.querySelector('.setting-group:nth-child(2) .option-btn.selected');
            const roundsEl = document.querySelector('.setting-group:nth-child(3) .option-btn.selected');

            if (!playersEl || !drawTimeEl || !roundsEl) {
                showError('Please select all game settings');
                return;
            }

            gameSettings = {
                players: parseInt(playersEl.getAttribute('data-value')),
                drawTime: parseInt(drawTimeEl.getAttribute('data-value')),
                rounds: parseInt(roundsEl.getAttribute('data-value'))
            };

            // Show evolution animation
            showStartAnimation();

            setTimeout(() => {
                hideStartAnimation();
                if (customizeScreen) customizeScreen.classList.add('hidden');
                if (gameScreen) gameScreen.classList.remove('hidden');
                if (roomIdDisplay) roomIdDisplay.textContent = roomId;
                initializeCanvas();
                if (startGameBtnBottom) startGameBtnBottom.classList.toggle('hidden', !isRoomCreator);
                if (typeof socket !== 'undefined' && socket) socket.emit('start-game', gameSettings);
            }, 4000);
        });
    }

    // Start game button (bottom, in-game)
    if (startGameBtnBottom) {
        startGameBtnBottom.addEventListener('click', () => {
            showStartAnimation();
            setTimeout(() => {
                hideStartAnimation();
                if (typeof socket !== 'undefined' && socket) socket.emit('start-game', gameSettings);
            }, 3000);
        });
    }

    // Join room
    if (joinRoomBtn) {
        joinRoomBtn.addEventListener('click', () => {
            username = usernameInput ? usernameInput.value.trim() : '';
            const roomIdToJoin = roomIdInput ? roomIdInput.value.trim().toUpperCase() : '';
            if (username && roomIdToJoin) {
                if (typeof socket !== 'undefined' && socket) {
                    socket.emit('join-room', { roomId: roomIdToJoin, username });
                }
            } else {
                showError('Please enter both username and room ID');
            }
        });
    }

    // Leave room
    if (leaveRoomBtn) {
        leaveRoomBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to leave the room?')) {
                if (typeof socket !== 'undefined' && socket) {
                    socket.disconnect();
                    socket.connect();
                }
                if (gameScreen) gameScreen.classList.add('hidden');
                if (leaderboardScreen) leaderboardScreen.classList.add('hidden');
                if (welcomeScreen) welcomeScreen.classList.remove('hidden');
            }
        });
    }

    // Send message
    if (sendMessageBtn) sendMessageBtn.addEventListener('click', sendMessage);
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    function sendMessage() {
        const message = messageInput ? messageInput.value.trim() : '';
        if (message && typeof socket !== 'undefined' && socket) {
            socket.emit('send-message', message);
            if (messageInput) messageInput.value = '';
        }
    }

    // View word button — only drawer sees answer
    if (viewWordBtn) {
        viewWordBtn.addEventListener('click', () => {
            if (typeof socket !== 'undefined' && socket) {
                socket.emit('view-word');
                viewWordBtn.innerHTML = '<i class="fas fa-spinner loading"></i> Loading...';
                setTimeout(() => {
                    viewWordBtn.innerHTML = '<i class="fas fa-eye"></i> View Word';
                }, 1000);
            }
        });
    }

    // Leaderboard tabs
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.leaderboard-list').forEach(list => list.classList.remove('active'));
            const targetList = document.getElementById(tab + '-leaderboard');
            if (targetList) targetList.classList.add('active');
        });
    });

    // Back to game from leaderboard
    if (backToGameBtn) {
        backToGameBtn.addEventListener('click', () => {
            leaderboardScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');
        });
    }

    // ═══ Share as Image ═══
    if (shareLeaderboardBtn) {
        shareLeaderboardBtn.addEventListener('click', () => {
            const leaderboardContent = document.querySelector('.leaderboard-content');
            if (!leaderboardContent || typeof html2canvas === 'undefined') {
                // Fallback: copy link
                navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied!'));
                return;
            }

            shareLeaderboardBtn.innerHTML = '<i class="fas fa-spinner loading"></i> Capturing...';
            shareLeaderboardBtn.disabled = true;

            // Create a styled card for capture
            const shareCard = document.createElement('div');
            shareCard.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:400px;padding:30px;background:linear-gradient(135deg,#050510,#0a0a2e);border:2px solid rgba(0,243,255,0.3);border-radius:20px;color:#fff;font-family:Rajdhani,sans-serif;';
            shareCard.innerHTML = `
                <div style="text-align:center;margin-bottom:20px;">
                    <h2 style="font-family:Orbitron,monospace;color:#00f3ff;font-size:1.4rem;letter-spacing:3px;margin:0;">TECH SKRIBBL</h2>
                    <p style="color:#bc13fe;font-size:0.8rem;letter-spacing:4px;margin-top:5px;">GAME RESULTS</p>
                </div>
                ${leaderboardContent.querySelector('.leaderboard-list.active').innerHTML}
                <div style="text-align:center;margin-top:15px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.1);">
                    <p style="color:rgba(255,255,255,0.4);font-size:0.7rem;">Tech Skribbl — Draw • Guess • Dominate</p>
                </div>
            `;
            document.body.appendChild(shareCard);

            html2canvas(shareCard, { backgroundColor: '#050510', scale: 2 }).then(cvs => {
                document.body.removeChild(shareCard);
                cvs.toBlob(blob => {
                    // Try native share first
                    if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'tech-skribbl-results.png', { type: 'image/png' })] })) {
                        const file = new File([blob], 'tech-skribbl-results.png', { type: 'image/png' });
                        navigator.share({ files: [file], title: 'Tech Skribbl Results' }).catch(() => {});
                    } else {
                        // Fallback: download
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'tech-skribbl-results.png';
                        a.click();
                        URL.revokeObjectURL(url);
                    }
                    shareLeaderboardBtn.innerHTML = '<i class="fas fa-camera"></i> Share as Image';
                    shareLeaderboardBtn.disabled = false;
                }, 'image/png');
            }).catch(() => {
                document.body.removeChild(shareCard);
                shareLeaderboardBtn.innerHTML = '<i class="fas fa-camera"></i> Share as Image';
                shareLeaderboardBtn.disabled = false;
                alert('Could not capture image. Link copied instead.');
                navigator.clipboard.writeText(window.location.href);
            });
        });
    }

    // ═══ Socket Connection ═══
    let socket;
    try {
        socket = io();
    } catch (error) {
        console.error('Socket.io initialization failed:', error);
        showError('Connection error. Please refresh the page.');
    }

    if (typeof socket !== 'undefined' && socket) {
        socket.on('room-created', (roomIdFromServer) => {
            roomId = roomIdFromServer;
            if (generatedRoomId) generatedRoomId.textContent = roomId;
        });

        socket.on('room-joined', (roomData) => {
            roomId = roomData.roomId;
            if (roomIdDisplay) roomIdDisplay.textContent = roomId;
            if (customizeScreen) customizeScreen.classList.add('hidden');
            if (welcomeScreen) welcomeScreen.classList.add('hidden');
            if (gameScreen) gameScreen.classList.remove('hidden');
            initializeCanvas();

            const player = roomData.players.find(p => p.id === socket.id);
            isPlayerDrawing = player && player.isDrawing;

            if (isPlayerDrawing) {
                setupCanvasEvents();
                if (messageInput) messageInput.placeholder = "You're drawing! Others are guessing...";
                if (viewWordBtn) viewWordBtn.classList.remove('hidden');
            } else {
                removeCanvasEvents();
                if (messageInput) messageInput.placeholder = 'Type your guess...';
                if (viewWordBtn) viewWordBtn.classList.remove('hidden');
            }
            updatePlayersList(roomData.players);
            if (startGameBtnBottom) startGameBtnBottom.classList.toggle('hidden', !isRoomCreator);
        });

        socket.on('join-error', (message) => {
            showError(message);
            hideStartAnimation();
        });

        socket.on('update-players', (players) => {
            updatePlayersList(players);
            const player = players.find(p => p.id === socket.id);
            isPlayerDrawing = player && player.isDrawing;

            if (isPlayerDrawing) {
                setupCanvasEvents();
                if (messageInput) messageInput.placeholder = "You're drawing! Others are guessing...";
                if (viewWordBtn) viewWordBtn.classList.remove('hidden');
            } else {
                removeCanvasEvents();
                if (messageInput) messageInput.placeholder = 'Type your guess...';
                if (viewWordBtn) viewWordBtn.classList.remove('hidden');
            }

            const drawer = players.find(p => p.isDrawing);
            if (drawer && currentDrawer) currentDrawer.textContent = 'Drawing: ' + drawer.username;
        });

        socket.on('drawing', (data) => {
            if (isPlayerDrawing || !isCanvasInitialized) return;
            if (data.type === 'start') {
                lastX = data.x * canvas.width;
                lastY = data.y * canvas.height;
                ctx.beginPath();
                ctx.moveTo(lastX, lastY);
            } else if (data.type === 'draw') {
                const x = data.x * canvas.width;
                const y = data.y * canvas.height;
                const lx = data.lastX * canvas.width;
                const ly = data.lastY * canvas.height;
                ctx.lineWidth = data.size;
                ctx.strokeStyle = data.color;
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(lx, ly);
                ctx.lineTo(x, y);
                ctx.stroke();
                lastX = x;
                lastY = y;
            } else if (data.type === 'end') {
                ctx.beginPath();
            }
        });

        socket.on('fill-canvas', (data) => {
            if (!isCanvasInitialized) return;
            ctx.fillStyle = data.color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        });

        socket.on('clear-canvas', () => {
            if (!isCanvasInitialized) return;
            try {
                drawingHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
                if (drawingHistory.length > 50) drawingHistory.shift();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            } catch (error) { console.error('Error clearing canvas:', error); }
        });

        socket.on('undo', () => {
            if (!isCanvasInitialized) return;
            if (drawingHistory.length > 0) {
                try { ctx.putImageData(drawingHistory.pop(), 0, 0); }
                catch (error) { console.error('Error undoing:', error); }
            }
        });

        socket.on('receive-message', (data) => {
            addChatMessage(data.username, data.message, data.isCorrect, data.isIncorrect);
            // Auto-switch to chat tab on mobile when message received
            const chatTab = document.querySelector('.mobile-tab[data-panel="chat"]');
            if (chatTab && window.innerWidth <= 768) {
                chatTab.click();
            }
        });

        socket.on('correct-guess', (data) => {
            const message = `${data.username} guessed correctly! +${data.score} points (${data.timeRemaining}s remaining)`;
            addChatMessage('System', message, true, false, true);
            if (data.username === username) {
                document.body.style.backgroundColor = 'rgba(0, 204, 136, 0.1)';
                setTimeout(() => { document.body.style.backgroundColor = ''; }, 1000);
            }
        });

        socket.on('incorrect-guess', (data) => {
            addChatMessage('System', data.username + ' guessed incorrectly!', false, true, true);
        });

        socket.on('your-turn', (wordData) => {
            if (!wordDisplay) return;
            const wordElement = wordDisplay.querySelector('.word');
            const hintElement = wordDisplay.querySelector('.hint');
            let categoryElement = wordDisplay.querySelector('.category');
            if (!categoryElement) {
                categoryElement = document.createElement('div');
                categoryElement.className = 'category';
                wordDisplay.appendChild(categoryElement);
            }

            if (wordElement) wordElement.textContent = wordData.answer;
            if (hintElement) hintElement.textContent = wordData.question;
            if (categoryElement) categoryElement.textContent = wordData.category;

            wordDisplay.classList.remove('hidden');
            if (wordElement) wordElement.classList.remove('hidden');
            if (hintElement) hintElement.classList.remove('hidden');

            if (wordDisplayTimeout) clearTimeout(wordDisplayTimeout);
            wordDisplayTimeout = setTimeout(() => { wordDisplay.classList.add('hidden'); }, 300000);
        });

        socket.on('question-hint', (hintData) => {
            if (!wordDisplay) return;
            const wordElement = wordDisplay.querySelector('.word');
            const hintElement = wordDisplay.querySelector('.hint');
            let categoryElement = wordDisplay.querySelector('.category');
            if (!categoryElement) {
                categoryElement = document.createElement('div');
                categoryElement.className = 'category';
                wordDisplay.appendChild(categoryElement);
            }

            // Guessers see ONLY the question, NOT the answer
            if (wordElement) wordElement.textContent = '';
            if (hintElement) hintElement.textContent = hintData.question;
            if (categoryElement) categoryElement.textContent = hintData.category || 'General';

            wordDisplay.classList.remove('hidden');
            if (wordElement) wordElement.classList.add('hidden');
            if (hintElement) hintElement.classList.remove('hidden');

            if (wordDisplayTimeout) clearTimeout(wordDisplayTimeout);
            wordDisplayTimeout = setTimeout(() => { wordDisplay.classList.add('hidden'); }, 300000);
        });

        socket.on('game-started', (data) => {
            if (currentDrawer) currentDrawer.textContent = 'Drawing: ' + data.drawer;
            if (timerDisplay) timerDisplay.textContent = data.time;
            if (roundInfo) roundInfo.textContent = 'Round: ' + data.currentRound + '/' + data.totalRounds;

            if (!isPlayerDrawing && wordDisplay) {
                wordDisplay.classList.add('hidden');
                if (messageInput) messageInput.placeholder = 'Type your guess...';
            }
            if (startGameBtnBottom) startGameBtnBottom.classList.add('hidden');
            hideStartAnimation();
        });

        socket.on('update-timer', (time) => {
            if (timerDisplay) timerDisplay.textContent = time;
            // Timer visual warnings
            const timerContainer = document.querySelector('.timer-container');
            if (timerContainer) {
                timerContainer.classList.remove('warning', 'danger');
                if (time <= 15) timerContainer.classList.add('danger');
                else if (time <= 60) timerContainer.classList.add('warning');
            }
        });

        socket.on('round-ended', (data) => {
            if (wordDisplay) wordDisplay.classList.add('hidden');
            if (isCanvasInitialized) {
                try { ctx.clearRect(0, 0, canvas.width, canvas.height); }
                catch (error) { console.error('Error clearing canvas:', error); }
            }
            drawingHistory = [];

            if (isPlayerDrawing) {
                isPlayerDrawing = false;
                removeCanvasEvents();
                if (messageInput) messageInput.placeholder = 'Type your guess...';
            }

            const categoryText = data.category ? ` (${data.category})` : '';
            addChatMessage('System', 'Round ended! The word was: ' + data.answer + categoryText, false, false, true);

            if (startGameBtnBottom) startGameBtnBottom.classList.toggle('hidden', !isRoomCreator);
        });

        socket.on('game-ended', (data) => {
            showLeaderboard(data.leaderboard);
            addChatMessage('System', `Game ended! ${data.winner.username} wins with ${data.winner.score} points and IQ ${data.winner.iq}! 🏆`, false, false, true);
            if (isRoomCreator && startGameBtnBottom) startGameBtnBottom.classList.remove('hidden');
        });

        socket.on('view-word', (wordData) => {
            if (!wordDisplay) return;
            const wordElement = wordDisplay.querySelector('.word');
            const hintElement = wordDisplay.querySelector('.hint');
            let categoryElement = wordDisplay.querySelector('.category');
            if (!categoryElement) {
                categoryElement = document.createElement('div');
                categoryElement.className = 'category';
                wordDisplay.appendChild(categoryElement);
            }

            if (isPlayerDrawing) {
                if (wordElement) wordElement.textContent = wordData.answer;
                if (hintElement) hintElement.textContent = wordData.question;
                if (categoryElement) categoryElement.textContent = wordData.category;
                wordDisplay.classList.remove('hidden');
                if (wordElement) wordElement.classList.remove('hidden');
                if (hintElement) hintElement.classList.remove('hidden');
            } else {
                // Guesser: only show question, NEVER the answer
                if (wordElement) wordElement.textContent = '';
                if (hintElement) hintElement.textContent = wordData.question;
                if (categoryElement) categoryElement.textContent = wordData.category;
                wordDisplay.classList.remove('hidden');
                if (wordElement) wordElement.classList.add('hidden');
                if (hintElement) hintElement.classList.remove('hidden');
            }

            if (wordDisplayTimeout) clearTimeout(wordDisplayTimeout);
            wordDisplayTimeout = setTimeout(() => { wordDisplay.classList.add('hidden'); }, 300000);
        });

        socket.on('user-joined', (joinedUsername) => {
            addChatMessage('System', joinedUsername + ' joined the room', false, false, true);
        });

        socket.on('user-left', (leftUsername) => {
            addChatMessage('System', leftUsername + ' left the room', false, false, true);
        });
    }

    // ═══ Helper Functions ═══
    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            setTimeout(() => { errorMessage.textContent = ''; }, 5000);
        }
    }

    function updatePlayersList(players) {
        if (!playersContainer || !playersCount) return;
        playersContainer.innerHTML = '';
        playersCount.textContent = players.length + '/' + (gameSettings.players || 4);

        players.forEach((player) => {
            const li = document.createElement('li');
            if (player.isDrawing) li.classList.add('drawing');
            const iqDisplay = player.iq ? `<span class="iq-score">IQ: ${player.iq}</span>` : '';
            li.innerHTML = `
                <div class="player-info">
                    <span class="player-name">${player.username} ${player.id === socket.id ? '(You)' : ''}</span>
                    ${player.isDrawing ? '<i class="fas fa-paint-brush drawing-icon"></i>' : ''}
                </div>
                <div class="player-stats">
                    <span class="score">${player.score}</span>
                    ${iqDisplay}
                </div>
            `;
            playersContainer.appendChild(li);
        });
    }

    function addChatMessage(msgUsername, message, isCorrect = false, isIncorrect = false, isSystem = false) {
        if (!chatMessages) return;
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');

        if (isCorrect) {
            messageDiv.classList.add('correct');
            messageDiv.innerHTML = `
                <div class="message-header">
                    <strong>${msgUsername}</strong>
                    <span class="guess-badge">Correct! 🎉</span>
                </div>
                <div class="message-text">${message}</div>
            `;
        } else if (isIncorrect) {
            messageDiv.classList.add('incorrect');
            messageDiv.innerHTML = `<strong>${msgUsername}:</strong> ${message}`;
        } else if (isSystem) {
            messageDiv.classList.add('system');
            messageDiv.innerHTML = `<strong>${msgUsername}:</strong> ${message}`;
        } else {
            messageDiv.innerHTML = `<strong>${msgUsername}:</strong> ${message}`;
        }

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        if (isCorrect) {
            setTimeout(() => { messageDiv.classList.add('celebrate'); }, 100);
        }
    }

    function showLeaderboard(leaderboard) {
        gameScreen.classList.add('hidden');
        leaderboardScreen.classList.remove('hidden');

        const globalLeaderboard = document.getElementById('global-leaderboard');
        if (!globalLeaderboard) return;
        globalLeaderboard.innerHTML = '';

        leaderboard.forEach((player, index) => {
            const li = document.createElement('li');
            li.className = `leaderboard-item ${index === 0 ? 'winner' : ''}`;
            const medals = ['🥇', '🥈', '🥉'];
            const medal = medals[index] || `#${index + 1}`;
            li.innerHTML = `
                <span class="player-rank">${medal}</span>
                <span class="player-name">${player.username} ${player.id === socket.id ? '(You)' : ''}</span>
                <div class="player-stats">
                    <span class="player-score">${player.score} pts</span>
                    <span class="player-iq">IQ: ${player.iq}</span>
                </div>
            `;
            globalLeaderboard.appendChild(li);
        });

        if (leaderboard[0] && leaderboard[0].id === socket.id) {
            const content = document.querySelector('.leaderboard-content');
            if (content) content.classList.add('celebrate');
        }
    }
});