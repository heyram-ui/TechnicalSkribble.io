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
    const languageSelect = document.getElementById('language-select');
    const backToGameBtn = document.getElementById('back-to-game-btn');
    const shareLeaderboardBtn = document.getElementById('share-leaderboard-btn');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const startMessage = document.getElementById('start-message');

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
    let selectedLanguage = 'en';

    // Language translations
    const translations = {
        en: {
            welcome: "Draw and guess technical terms with friends! 🎨🚀",
            usernamePlaceholder: "Enter your username",
            roomCodePlaceholder: "Enter room code",
            createRoom: "Create Room",
            joinRoom: "Join Room",
            roomSettings: "Room Settings",
            startGame: "Start Game",
            back: "Back",
            drawing: "Drawing: ",
            round: "Round: ",
            typeGuess: "Type your guess...",
            viewWord: "View Word",
            colors: "Colors",
            brushSize: "Brush Size",
            tools: "Tools",
            undo: "Undo",
            eraser: "Eraser",
            fill: "Fill",
            clearCanvas: "Clear Canvas",
            leaderboard: "Leaderboard",
            global: "Global",
            friends: "Friends",
            today: "Today",
            shareResults: "Share Results",
            backToGame: "Back to Game",
            startingGame: "Starting game... Please wait!"
        },
        ml: {
            welcome: "സുഹൃത്തുക്കളുമായി സാങ്കേതിക പദങ്ങൾ വരച്ച് ഊഹിക്കുക! 🎨🚀",
            usernamePlaceholder: "നിങ്ങളുടെ ഉപയോക്തൃനാമം നൽകുക",
            roomCodePlaceholder: "റൂം കോഡ് നൽകുക",
            createRoom: "റൂം സൃഷ്ടിക്കുക",
            joinRoom: "റൂമിൽ ചേരുക",
            roomSettings: "റൂം ക്രമീകരണങ്ങൾ",
            startGame: "ഗെയിം ആരംഭിക്കുക",
            back: "പിന്നിലേക്ക്",
            drawing: "വരയ്ക്കുന്നത്: ",
            round: "റൗണ്ട്: ",
            typeGuess: "നിങ്ങളുടെ ഊഹം ടൈപ്പ് ചെയ്യുക...",
            viewWord: "വാക്ക് കാണുക",
            colors: "നിറങ്ങൾ",
            brushSize: "ബ്രഷ് വലുപ്പം",
            tools: "ഉപകരണങ്ങൾ",
            undo: "റദ്ദാക്കുക",
            eraser: "ഇറേസർ",
            fill: "നിറക്കുക",
            clearCanvas: "കാൻവാസ് വൃത്തിയാക്കുക",
            leaderboard: "ലീഡർബോർഡ്",
            global: "ആഗോള",
            friends: "സുഹൃത്തുക്കൾ",
            today: "ഇന്ന്",
            shareResults: "ഫലങ്ങൾ പങ്കിടുക",
            backToGame: "ഗെയിമിലേക്ക് മടങ്ങുക",
            startingGame: "ഗെയിം ആരംഭിക്കുന്നു... ദയവായി കാത്തിരിക്കുക!"
        }
        // Add other languages as needed...
    };

    // Show start message function
    function showStartMessage() {
        if (startMessage) {
            const messageText = startMessage.querySelector('span');
            if (messageText) {
                messageText.textContent = translations[selectedLanguage].startingGame;
            }
            startMessage.classList.remove('hidden');
        }
    }

    // Hide start message function
    function hideStartMessage() {
        if (startMessage) {
            startMessage.classList.add('hidden');
        }
    }

    // Update UI based on selected language
    function updateLanguage() {
        selectedLanguage = languageSelect.value;
        const t = translations[selectedLanguage];
        
        document.querySelector('.subtitle').textContent = t.welcome;
        document.getElementById('username-input').placeholder = t.usernamePlaceholder;
        document.getElementById('room-id-input').placeholder = t.roomCodePlaceholder;
        document.getElementById('create-room-btn').innerHTML = `<i class="fas fa-plus-circle"></i> ${t.createRoom}`;
        document.getElementById('join-room-btn').innerHTML = `<i class="fas fa-sign-in-alt"></i> ${t.joinRoom}`;
        document.querySelector('#customize-screen h1').textContent = t.roomSettings;
        document.getElementById('start-game-btn').innerHTML = `<i class="fas fa-play"></i> ${t.startGame}`;
        document.getElementById('back-btn').innerHTML = `<i class="fas fa-arrow-left"></i> ${t.back}`;
        
        if (messageInput) {
            messageInput.placeholder = isPlayerDrawing ? 
                "You're drawing! Others are guessing..." : t.typeGuess;
        }
        
        if (viewWordBtn) {
            viewWordBtn.innerHTML = `<i class="fas fa-eye"></i> ${t.viewWord}`;
        }
        
        document.querySelectorAll('.tools-section h4')[0].textContent = t.colors;
        document.querySelectorAll('.tools-section h4')[1].textContent = t.brushSize;
        document.querySelectorAll('.tools-section h4')[2].textContent = t.tools;
        document.getElementById('undo-btn').title = t.undo;
        document.getElementById('eraser-btn').title = t.eraser;
        document.getElementById('fill-btn').title = t.fill;
        document.getElementById('clear-canvas-btn').title = t.clearCanvas;
        
        document.querySelector('#leaderboard-screen h1').innerHTML = `<i class="fas fa-trophy"></i> ${t.leaderboard}`;
        document.querySelectorAll('.tab-btn')[0].textContent = t.global;
        document.querySelectorAll('.tab-btn')[1].textContent = t.friends;
        document.querySelectorAll('.tab-btn')[2].textContent = t.today;
        document.getElementById('share-leaderboard-btn').innerHTML = `<i class="fas fa-share"></i> ${t.shareResults}`;
        document.getElementById('back-to-game-btn').innerHTML = `<i class="fas fa-arrow-left"></i> ${t.backToGame}`;
    }

    // Set canvas size
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        // Set canvas styles for smooth drawing
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = currentBrushSize;
        ctx.strokeStyle = currentColor;
        
        isCanvasInitialized = true;
    }
    
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize canvas only when game screen is shown
    function initializeCanvas() {
        if (gameScreen.classList.contains('hidden')) return;
        resizeCanvas();
    }

    // Set up drawing event listeners
    function setupCanvasEvents() {
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        // Touch events for mobile
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd);
    }
    
    function removeCanvasEvents() {
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', stopDrawing);
        canvas.removeEventListener('mouseout', stopDrawing);
        
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
    }
    
    function startDrawing(e) {
        if (!isPlayerDrawing || !isCanvasInitialized) return;
        
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
        
        // Save current state for undo
        try {
            drawingHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            if (drawingHistory.length > 50) drawingHistory.shift(); // Limit history size
        } catch (error) {
            console.error('Error saving canvas state:', error);
        }
        
        // Handle fill tool
        if (isFillActive) {
            ctx.fillStyle = isEraserActive ? 'white' : currentColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Send fill action to server
            if (typeof socket !== 'undefined' && socket) {
                socket.emit('fill-canvas', {
                    color: isEraserActive ? 'white' : currentColor
                });
            }
            
            isDrawing = false;
            return;
        }
        
        // Send drawing start signal
        if (typeof socket !== 'undefined' && socket) {
            socket.emit('drawing', {
                x: lastX / canvas.width,
                y: lastY / canvas.height,
                color: isEraserActive ? 'white' : currentColor,
                size: currentBrushSize,
                type: 'start'
            });
        }
    }
    
    function draw(e) {
        if (!isDrawing || !isPlayerDrawing || isFillActive || !isCanvasInitialized) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Draw smoothly with interpolation
        ctx.lineWidth = currentBrushSize;
        ctx.strokeStyle = isEraserActive ? 'white' : currentColor;
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // Send drawing data to server
        if (typeof socket !== 'undefined' && socket) {
            socket.emit('drawing', {
                x: x / canvas.width,
                y: y / canvas.height,
                lastX: lastX / canvas.width,
                lastY: lastY / canvas.height,
                color: isEraserActive ? 'white' : currentColor,
                size: currentBrushSize,
                type: 'draw'
            });
        }
        
        lastX = x;
        lastY = y;
    }
    
    function stopDrawing() {
        if (!isPlayerDrawing) return;
        
        isDrawing = false;
        
        // Send drawing end signal
        if (typeof socket !== 'undefined' && socket) {
            socket.emit('drawing', { type: 'end' });
        }
    }
    
    function handleTouchStart(e) {
        e.preventDefault();
        if (!isPlayerDrawing) return;
        
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }
    
    function handleTouchMove(e) {
        e.preventDefault();
        if (!isPlayerDrawing) return;
        
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }
    
    function handleTouchEnd(e) {
        e.preventDefault();
        if (!isPlayerDrawing) return;
        
        const mouseEvent = new MouseEvent('mouseup');
        canvas.dispatchEvent(mouseEvent);
    }

    // Color and brush size selection
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            currentColor = option.getAttribute('data-color');
            colorOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            ctx.strokeStyle = currentColor;
            
            // Deactivate eraser and fill when selecting a color
            isEraserActive = false;
            isFillActive = false;
            eraserBtn.classList.remove('active');
            fillBtn.classList.remove('active');
        });
    });
    
    if (brushSize && brushSizeValue) {
        brushSize.addEventListener('input', () => {
            currentBrushSize = parseInt(brushSize.value);
            brushSizeValue.textContent = currentBrushSize + 'px';
            ctx.lineWidth = currentBrushSize;
        });
    }

    // Tool buttons
    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            if (drawingHistory.length > 0 && isCanvasInitialized) {
                try {
                    ctx.putImageData(drawingHistory.pop(), 0, 0);
                    if (typeof socket !== 'undefined' && socket) {
                        socket.emit('undo');
                    }
                } catch (error) {
                    console.error('Error undoing:', error);
                }
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

    // Clear canvas button
    if (clearCanvasBtn) {
        clearCanvasBtn.addEventListener('click', () => {
            if (!isCanvasInitialized) return;
            
            try {
                drawingHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
                if (drawingHistory.length > 50) drawingHistory.shift();
                
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (typeof socket !== 'undefined' && socket) {
                    socket.emit('clear-canvas');
                }
            } catch (error) {
                console.error('Error clearing canvas:', error);
            }
        });
    }

    // Copy room code button
    if (copyRoomCodeBtn && generatedRoomId) {
        copyRoomCodeBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(generatedRoomId.textContent).then(() => {
                // Show copied feedback
                const originalTitle = copyRoomCodeBtn.getAttribute('title');
                copyRoomCodeBtn.setAttribute('title', 'Copied!');
                copyRoomCodeBtn.innerHTML = '<i class="fas fa-check"></i>';
                
                setTimeout(() => {
                    copyRoomCodeBtn.setAttribute('title', originalTitle || 'Copy room code');
                    copyRoomCodeBtn.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy room code: ', err);
            });
        });
    }

    // Create room button
    if (createRoomBtn) {
        createRoomBtn.addEventListener('click', () => {
            username = usernameInput ? usernameInput.value.trim() : '';
            if (username) {
                if (welcomeScreen) welcomeScreen.classList.add('hidden');
                if (customizeScreen) customizeScreen.classList.remove('hidden');
                isRoomCreator = true;
                
                // Create room with the username
                if (typeof socket !== 'undefined' && socket) {
                    socket.emit('create-room', username);
                }
            } else {
                showError('Please enter a username');
            }
        });
    }

    // Back button from customize screen
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (customizeScreen) customizeScreen.classList.add('hidden');
            if (welcomeScreen) welcomeScreen.classList.remove('hidden');
            isRoomCreator = false;
        });
    }

    // Start game button with animation and message
    if (startGameBtn) {
        startGameBtn.addEventListener('click', () => {
            // Collect game settings
            const playersElement = document.querySelector('.setting-group:nth-child(1) .option-btn.selected');
            const drawTimeElement = document.querySelector('.setting-group:nth-child(2) .option-btn.selected');
            const roundsElement = document.querySelector('.setting-group:nth-child(3) .option-btn.selected');
            
            if (!playersElement || !drawTimeElement || !roundsElement) {
                showError('Please select all game settings');
                return;
            }
            
            const players = parseInt(playersElement.getAttribute('data-value'));
            const drawTime = parseInt(drawTimeElement.getAttribute('data-value'));
            const rounds = parseInt(roundsElement.getAttribute('data-value'));
            
            // Validate settings
            if (players < 2 || players > 10) {
                showError('Players must be between 2 and 10');
                return;
            }
            
            if (drawTime < 120 || drawTime > 420) {
                showError('Draw time must be between 2 and 7 minutes');
                return;
            }
            
            if (rounds < 2 || rounds > 6) {
                showError('Rounds must be between 2 and 6');
                return;
            }
            
            gameSettings = {
                players,
                drawTime,
                rounds
            };

            // Show start message
            showStartMessage();

            // Show start animation after a short delay
            setTimeout(() => {
                startAnimation.classList.remove('hidden');
                
                // After animation, proceed to game and hide message
                setTimeout(() => {
                    startAnimation.classList.add('hidden');
                    hideStartMessage(); // Remove the message when game starts
                    
                    // The room was already created, now we just need to proceed to the game screen
                    if (customizeScreen) customizeScreen.classList.add('hidden');
                    if (gameScreen) gameScreen.classList.remove('hidden');
                    if (roomIdDisplay) roomIdDisplay.textContent = 'Room: ' + roomId;
                    
                    // Initialize canvas now that game screen is visible
                    initializeCanvas();
                    
                    // Show start button only for the room creator
                    if (startGameBtnBottom) {
                        startGameBtnBottom.classList.toggle('hidden', !isRoomCreator);
                    }
                    
                    // Start the game
                    if (typeof socket !== 'undefined' && socket) {
                        socket.emit('start-game', gameSettings);
                    }
                }, 3000);
            }, 1500);
        });
    }

    // Start game button (bottom) - with message functionality
    if (startGameBtnBottom) {
        startGameBtnBottom.addEventListener('click', () => {
            // Show start message
            showStartMessage();
            
            // Start game after a short delay to show the message
            setTimeout(() => {
                hideStartMessage(); // Remove message when game starts
                if (typeof socket !== 'undefined' && socket) {
                    socket.emit('start-game', gameSettings);
                }
            }, 2000);
        });
    }

    // Join room button
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

    // Leave room button
    if (leaveRoomBtn) {
        leaveRoomBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to leave the room?')) {
                if (typeof socket !== 'undefined' && socket) {
                    socket.disconnect();
                    socket.connect();
                }
                if (gameScreen) gameScreen.classList.add('hidden');
                if (welcomeScreen) welcomeScreen.classList.remove('hidden');
            }
        });
    }

    // Send message button
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
    }
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    function sendMessage() {
        const message = messageInput ? messageInput.value.trim() : '';
        if (message && typeof socket !== 'undefined' && socket) {
            socket.emit('send-message', message);
            if (messageInput) messageInput.value = '';
        }
    }

    // View word button - Show word for 5 minutes
    if (viewWordBtn) {
        viewWordBtn.addEventListener('click', () => {
            if (typeof socket !== 'undefined' && socket) {
                socket.emit('view-word');
                // Show loading state
                viewWordBtn.innerHTML = '<i class="fas fa-spinner loading"></i> Loading...';
                setTimeout(() => {
                    viewWordBtn.innerHTML = '<i class="fas fa-eye"></i> ' + translations[selectedLanguage].viewWord;
                }, 1000);
            }
        });
    }

    // Language selector
    if (languageSelect) {
        languageSelect.addEventListener('change', updateLanguage);
    }

    // Tab buttons for leaderboard
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            
            // Update active tab
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show corresponding leaderboard
            document.querySelectorAll('.leaderboard-list').forEach(list => {
                list.classList.remove('active');
            });
            document.getElementById(tab + '-leaderboard').classList.add('active');
        });
    });

    // Back to game from leaderboard
    if (backToGameBtn) {
        backToGameBtn.addEventListener('click', () => {
            leaderboardScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');
        });
    }

    // Share leaderboard
    if (shareLeaderboardBtn) {
        shareLeaderboardBtn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: 'Technical Skribbl.io Leaderboard',
                    text: 'Check out my score on Technical Skribbl.io!',
                    url: window.location.href
                }).catch(err => {
                    console.error('Error sharing:', err);
                });
            } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(window.location.href).then(() => {
                    alert('Link copied to clipboard!');
                });
            }
        });
    }

    // Initialize socket connection
    let socket;
    try {
        socket = io();
    } catch (error) {
        console.error('Socket.io initialization failed:', error);
        showError('Connection error. Please refresh the page.');
    }

    // Socket event handlers
    if (typeof socket !== 'undefined' && socket) {
        socket.on('room-created', (roomIdFromServer) => {
            roomId = roomIdFromServer;
            if (generatedRoomId) generatedRoomId.textContent = roomId;
        });

        socket.on('room-joined', (roomData) => {
            roomId = roomData.roomId;
            if (roomIdDisplay) roomIdDisplay.textContent = 'Room: ' + roomId;
            if (customizeScreen) customizeScreen.classList.add('hidden');
            if (gameScreen) gameScreen.classList.remove('hidden');
            
            // Initialize canvas now that game screen is visible
            initializeCanvas();
            
            // Check if current player is the drawer
            const player = roomData.players.find(p => p.id === socket.id);
            isPlayerDrawing = player && player.isDrawing;
            
            // Show/hide appropriate UI elements
            if (isPlayerDrawing) {
                setupCanvasEvents();
                if (messageInput) messageInput.placeholder = "You're drawing! Others are guessing...";
                if (viewWordBtn) viewWordBtn.classList.remove('hidden');
            } else {
                removeCanvasEvents();
                if (messageInput) messageInput.placeholder = translations[selectedLanguage].typeGuess;
                if (viewWordBtn) viewWordBtn.classList.remove('hidden');
            }
            
            updatePlayersList(roomData.players);
            
            // Show start button only for the room creator
            if (startGameBtnBottom) {
                startGameBtnBottom.classList.toggle('hidden', !isRoomCreator);
            }
        });

        socket.on('join-error', (message) => {
            showError(message);
            hideStartMessage(); // Hide message if there's an error
        });

        socket.on('update-players', (players) => {
            updatePlayersList(players);
            
            // Check if current player is the drawer
            const player = players.find(p => p.id === socket.id);
            isPlayerDrawing = player && player.isDrawing;
            
            // Show/hide appropriate UI elements
            if (isPlayerDrawing) {
                setupCanvasEvents();
                if (messageInput) messageInput.placeholder = "You're drawing! Others are guessing...";
                if (viewWordBtn) viewWordBtn.classList.remove('hidden');
            } else {
                removeCanvasEvents();
                if (messageInput) messageInput.placeholder = translations[selectedLanguage].typeGuess;
                if (viewWordBtn) viewWordBtn.classList.remove('hidden');
            }
            
            // Update current drawer display
            const drawer = players.find(p => p.isDrawing);
            if (drawer && currentDrawer) {
                currentDrawer.textContent = translations[selectedLanguage].drawing + drawer.username;
            }
        });

        socket.on('drawing', (data) => {
            if (isPlayerDrawing || !isCanvasInitialized) return; // Don't draw your own drawings
            
            const rect = canvas.getBoundingClientRect();
            
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
            } catch (error) {
                console.error('Error clearing canvas:', error);
            }
        });

        socket.on('undo', () => {
            if (!isCanvasInitialized) return;
            
            if (drawingHistory.length > 0) {
                try {
                    ctx.putImageData(drawingHistory.pop(), 0, 0);
                } catch (error) {
                    console.error('Error undoing:', error);
                }
            }
        });

        socket.on('receive-message', (data) => {
            addChatMessage(data.username, data.message, data.isCorrect, data.isIncorrect);
        });

        socket.on('correct-guess', (data) => {
            const message = `${data.username} guessed correctly! +${data.score} points (${data.timeRemaining}s remaining)`;
            addChatMessage('System', message, true, false, true);
            
            // Visual feedback for the guessing player
            if (data.username === username) {
                document.body.style.backgroundColor = 'rgba(0, 204, 136, 0.1)';
                setTimeout(() => {
                    document.body.style.backgroundColor = '';
                }, 1000);
            }
        });

        socket.on('incorrect-guess', (data) => {
            addChatMessage('System', data.username + ' guessed incorrectly!', false, true, true);
        });

        socket.on('your-turn', (wordData) => {
            if (!wordDisplay) return;
            
            // Only the drawer sees both question and answer
            const wordElement = wordDisplay.querySelector('.word');
            const hintElement = wordDisplay.querySelector('.hint');
            const categoryElement = wordDisplay.querySelector('.category') || document.createElement('div');
            
            if (!wordDisplay.querySelector('.category')) {
                categoryElement.className = 'category';
                wordDisplay.appendChild(categoryElement);
            }
            
            if (wordElement) wordElement.textContent = wordData.answer;
            if (hintElement) hintElement.textContent = wordData.question;
            if (categoryElement) categoryElement.textContent = wordData.category;
            
            // Show both question and answer for the drawer
            wordDisplay.classList.remove('hidden');
            if (wordElement) wordElement.classList.remove('hidden');
            if (hintElement) hintElement.classList.remove('hidden');
            
            // Show the word for 5 minutes (300 seconds) then hide it
            if (wordDisplayTimeout) clearTimeout(wordDisplayTimeout);
            wordDisplayTimeout = setTimeout(() => {
                wordDisplay.classList.add('hidden');
            }, 300000); // 5 minutes = 300,000 milliseconds
        });

        socket.on('question-hint', (hintData) => {
            if (!wordDisplay) return;
            
            // All players (except drawer) see only the hint (question)
            const wordElement = wordDisplay.querySelector('.word');
            const hintElement = wordDisplay.querySelector('.hint');
            const categoryElement = wordDisplay.querySelector('.category') || document.createElement('div');
            
            if (!wordDisplay.querySelector('.category')) {
                categoryElement.className = 'category';
                wordDisplay.appendChild(categoryElement);
            }
            
            if (wordElement) wordElement.textContent = '';
            if (hintElement) hintElement.textContent = hintData.question;
            if (categoryElement) categoryElement.textContent = hintData.category || 'General';
            
            // Show only the question for guessers, hide the answer
            wordDisplay.classList.remove('hidden');
            if (wordElement) wordElement.classList.add('hidden');
            if (hintElement) hintElement.classList.remove('hidden');
            
            // Auto-hide after 5 minutes
            if (wordDisplayTimeout) clearTimeout(wordDisplayTimeout);
            wordDisplayTimeout = setTimeout(() => {
                wordDisplay.classList.add('hidden');
            }, 300000); // 5 minutes = 300,000 milliseconds
        });

        socket.on('game-started', (data) => {
            if (currentDrawer) currentDrawer.textContent = translations[selectedLanguage].drawing + data.drawer;
            if (timerDisplay) timerDisplay.textContent = data.time;
            if (roundInfo) roundInfo.textContent = translations[selectedLanguage].round + data.currentRound + '/' + data.totalRounds;
            
            if (!isPlayerDrawing && wordDisplay) {
                wordDisplay.classList.add('hidden');
                if (messageInput) messageInput.placeholder = translations[selectedLanguage].typeGuess;
            }
            
            if (startGameBtnBottom) startGameBtnBottom.classList.add('hidden');
            
            // Hide start message when game actually starts
            hideStartMessage();
        });

        socket.on('update-timer', (time) => {
            if (timerDisplay) timerDisplay.textContent = time;
        });

        socket.on('round-ended', (data) => {
            if (wordDisplay) wordDisplay.classList.add('hidden');
            
            if (isCanvasInitialized) {
                try {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                } catch (error) {
                    console.error('Error clearing canvas:', error);
                }
            }
            
            drawingHistory = [];
            
            // If you were drawing, you're not anymore
            if (isPlayerDrawing) {
                isPlayerDrawing = false;
                removeCanvasEvents();
                if (messageInput) messageInput.placeholder = translations[selectedLanguage].typeGuess;
            }
            
            const categoryText = data.category ? ` (${data.category})` : '';
            addChatMessage('System', 'Round ended! The word was: ' + data.answer + categoryText, false, false, true);
            
            // Show start button again for room creator
            if (startGameBtnBottom) {
                startGameBtnBottom.classList.toggle('hidden', !isRoomCreator);
            }
        });

        socket.on('game-ended', (data) => {
            showLeaderboard(data.leaderboard);
            addChatMessage('System', `Game ended! ${data.winner.username} wins with ${data.winner.score} points and IQ ${data.winner.iq}! 🏆`, false, false, true);
            
            // Reset game state
            if (isRoomCreator && startGameBtnBottom) {
                startGameBtnBottom.classList.remove('hidden');
            }
        });

        socket.on('view-word', (wordData) => {
            if (!wordDisplay) return;
            
            const wordElement = wordDisplay.querySelector('.word');
            const hintElement = wordDisplay.querySelector('.hint');
            const categoryElement = wordDisplay.querySelector('.category') || document.createElement('div');
            
            if (!wordDisplay.querySelector('.category')) {
                categoryElement.className = 'category';
                wordDisplay.appendChild(categoryElement);
            }
            
            if (isPlayerDrawing) {
                // Drawer sees both question and answer
                if (wordElement) wordElement.textContent = wordData.answer;
                if (hintElement) hintElement.textContent = wordData.question;
                if (categoryElement) categoryElement.textContent = wordData.category;
                
                wordDisplay.classList.remove('hidden');
                if (wordElement) wordElement.classList.remove('hidden');
                if (hintElement) hintElement.classList.remove('hidden');
            } else {
                // Guesser sees only the question
                if (wordElement) wordElement.textContent = '';
                if (hintElement) hintElement.textContent = wordData.question;
                if (categoryElement) categoryElement.textContent = wordData.category;
                
                wordDisplay.classList.remove('hidden');
                if (wordElement) wordElement.classList.add('hidden');
                if (hintElement) hintElement.classList.remove('hidden');
            }
            
            // Auto-hide after 5 minutes
            if (wordDisplayTimeout) clearTimeout(wordDisplayTimeout);
            wordDisplayTimeout = setTimeout(() => {
                wordDisplay.classList.add('hidden');
            }, 300000); // 5 minutes = 300,000 milliseconds
        });
    }

    // Helper functions
    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            setTimeout(() => {
                errorMessage.textContent = '';
            }, 5000);
        }
    }

    function updatePlayersList(players) {
        if (!playersContainer || !playersCount) return;
        
        playersContainer.innerHTML = '';
        playersCount.textContent = players.length + '/' + (gameSettings.players || 4);
        
        players.forEach((player, index) => {
            const li = document.createElement('li');
            if (player.isDrawing) {
                li.classList.add('drawing');
            }
            
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

    function addChatMessage(username, message, isCorrect = false, isIncorrect = false, isSystem = false) {
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');
        
        if (isCorrect) {
            messageDiv.classList.add('correct');
            messageDiv.innerHTML = `
                <div class="message-header">
                    <strong>${username}</strong>
                    <span class="guess-badge">Correct! 🎉</span>
                </div>
                <div class="message-content">${message}</div>
            `;
        } else if (isIncorrect) {
            messageDiv.classList.add('incorrect');
            messageDiv.innerHTML = `<strong>${username}:</strong> ${message}`;
        } else if (isSystem) {
            messageDiv.classList.add('system');
            messageDiv.innerHTML = `<strong>${username}:</strong> ${message}`;
        } else {
            messageDiv.innerHTML = `<strong>${username}:</strong> ${message}`;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        if (isCorrect) {
            setTimeout(() => {
                messageDiv.classList.add('celebrate');
            }, 100);
        }
    }

    function showLeaderboard(leaderboard) {
        gameScreen.classList.add('hidden');
        leaderboardScreen.classList.remove('hidden');
        
        const globalLeaderboard = document.getElementById('global-leaderboard');
        globalLeaderboard.innerHTML = '';
        
        leaderboard.forEach((player, index) => {
            const li = document.createElement('li');
            li.className = `leaderboard-item ${index === 0 ? 'winner' : ''}`;
            
            li.innerHTML = `
                <span class="player-rank">#${index + 1}</span>
                <span class="player-name">${player.username} ${player.id === socket.id ? '(You)' : ''}</span>
                <div class="player-stats">
                    <span class="player-score">${player.score} pts</span>
                    <span class="player-iq">IQ: ${player.iq}</span>
                </div>
            `;
            
            globalLeaderboard.appendChild(li);
        });
        
        if (leaderboard[0].id === socket.id) {
            document.querySelector('.leaderboard-content').classList.add('celebrate');
        }
    }

    // Initialize language on page load
    updateLanguage();
});
