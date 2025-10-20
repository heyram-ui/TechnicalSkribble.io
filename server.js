const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Store game state
const rooms = new Map();
const users = new Map();

// Enhanced technical questions with categories
const technicalQuestions = [
    // Programming Concepts
    { question: 'The first node of a tree data structure is called', answer: 'root', category: 'Data Structures' },
    { question: 'What keyword is used to define a constant variable in Java?', answer: 'final', category: 'Java' },
    { question: 'Which data structure follows LIFO principle?', answer: 'stack', category: 'Data Structures' },
    { question: 'What does API stand for in programming?', answer: 'Application Programming Interface', category: 'Programming' },
    { question: 'Which loop is guaranteed to execute at least once in Java?', answer: 'do-while', category: 'Java' },
    
    // C++ Questions
    { question: 'In C++, what operator is used for dynamic memory allocation?', answer: 'new', category: 'C++' },
    { question: 'What is the extension for C++ header files?', answer: '.h', category: 'C++' },
    { question: 'Which keyword is used for function templates in C++?', answer: 'template', category: 'C++' },
    { question: 'What does STL stand for in C++?', answer: 'Standard Template Library', category: 'C++' },
    { question: 'Which operator is used for scope resolution in C++?', answer: '::', category: 'C++' },
    
    // Java Questions
    { question: 'What is the parent class of all Java classes?', answer: 'Object', category: 'Java' },
    { question: 'Which keyword is used to implement inheritance in Java?', answer: 'extends', category: 'Java' },
    { question: 'What is the default value of a boolean variable in Java?', answer: 'false', category: 'Java' },
    { question: 'Which interface is used for collections that maintain order?', answer: 'List', category: 'Java' },
    { question: 'What annotation is used to override a method in Java?', answer: '@Override', category: 'Java' },
    
    // Python Questions
    { question: 'Which keyword is used to define a function in Python?', answer: 'def', category: 'Python' },
    { question: 'What is used to create virtual environments in Python?', answer: 'venv', category: 'Python' },
    { question: 'Which data type is used for immutable sequences in Python?', answer: 'tuple', category: 'Python' },
    { question: 'What does PEP stand for in Python?', answer: 'Python Enhancement Proposal', category: 'Python' },
    { question: 'Which operator is used for exponentiation in Python?', answer: '**', category: 'Python' },
    
    // Database Questions
    { question: 'Which clause is used to filter records in SQL?', answer: 'WHERE', category: 'Database' },
    { question: 'What is the keyword to remove duplicate rows in SQL?', answer: 'DISTINCT', category: 'Database' },
    { question: 'Which join returns all records when there is a match in either table?', answer: 'FULL OUTER JOIN', category: 'Database' },
    { question: 'What does DDL stand for in database management?', answer: 'Data Definition Language', category: 'Database' },
    { question: 'Which constraint ensures all values in a column are unique?', answer: 'UNIQUE', category: 'Database' },
    
    // Computer Science
    { question: 'The component that exhales heat from a computer is called', answer: 'cooler', category: 'Hardware' },
    { question: 'What does CPU stand for?', answer: 'Central Processing Unit', category: 'Hardware' },
    { question: 'Which type of memory is volatile?', answer: 'RAM', category: 'Hardware' },
    { question: 'What connects the processor to the main memory?', answer: 'bus', category: 'Hardware' },
    { question: 'Which port is commonly used for external hard drives?', answer: 'USB', category: 'Hardware' },
    
    // Web Development
    { question: 'What does CSS stand for?', answer: 'Cascading Style Sheets', category: 'Web' },
    { question: 'Which HTML tag is used for the largest heading?', answer: 'h1', category: 'Web' },
    { question: 'What language runs in web browsers?', answer: 'JavaScript', category: 'Web' },
    { question: 'Which method converts JSON string to object?', answer: 'JSON.parse', category: 'Web' },
    { question: 'What does DOM stand for?', answer: 'Document Object Model', category: 'Web' }
];

// Generate a random room ID
function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Get a random question
function getRandomQuestion() {
    return technicalQuestions[Math.floor(Math.random() * technicalQuestions.length)];
}

// Calculate IQ based on score and performance
function calculateIQ(score, totalRounds, correctGuesses, quickGuesses) {
    const baseIQ = 90;
    const scoreBonus = (score / totalRounds) * 10;
    const accuracyBonus = (correctGuesses / totalRounds) * 15;
    const speedBonus = (quickGuesses / totalRounds) * 5;
    return Math.min(150, Math.floor(baseIQ + scoreBonus + accuracyBonus + speedBonus));
}

// Start a new round
function startRound(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    room.gameState = 'playing';
    room.currentRound++;

    // Clear any existing timer
    if (room.timerInterval) {
        clearInterval(room.timerInterval);
    }

    // Clear canvas
    room.drawings = [];
    io.to(roomId).emit('clear-canvas');

    // Select next drawer (round-robin)
    room.drawerIndex = (room.drawerIndex + 1) % room.players.length;
    room.players.forEach((player, index) => {
        player.isDrawing = index === room.drawerIndex;
        if (player.isDrawing) {
            player.roundsDrawn = (player.roundsDrawn || 0) + 1;
        }
    });

    // Get a random question
    const questionData = getRandomQuestion();
    room.currentQuestion = questionData.question;
    room.currentAnswer = questionData.answer.toLowerCase();
    room.currentCategory = questionData.category;

    // Reset guess tracking
    room.correctGuessers = new Set();

    // Notify the drawer of the question and answer
    const drawer = room.players[room.drawerIndex];
    if (drawer) {
        io.to(drawer.id).emit('your-turn', { 
            question: room.currentQuestion, 
            answer: room.currentAnswer,
            category: room.currentCategory
        });
    }

    // Notify other players of the question only (no answer)
    room.players.forEach(player => {
        if (player.id !== drawer.id) {
            io.to(player.id).emit('question-hint', {
                question: room.currentQuestion,
                category: room.currentCategory
            });
        }
    });

    // Start the round timer
    room.currentTime = room.roundTime;

    room.timerInterval = setInterval(() => {
        room.currentTime--;

        io.to(roomId).emit('update-timer', room.currentTime);

        if (room.currentTime <= 0) {
            clearInterval(room.timerInterval);
            nextRound(roomId);
        }
    }, 1000);

    io.to(roomId).emit('game-started', {
        drawer: drawer.username,
        time: room.roundTime,
        currentRound: room.currentRound,
        totalRounds: room.rounds
    });

    io.to(roomId).emit('update-players', room.players);
}

// Move to next round or end game
function nextRound(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    room.gameState = 'waiting';

    // Clear timer
    if (room.timerInterval) {
        clearInterval(room.timerInterval);
        room.timerInterval = null;
    }

    // Announce the correct answer to everyone
    io.to(roomId).emit('round-ended', {
        answer: room.currentAnswer,
        category: room.currentCategory
    });

    // Check if game should end
    if (room.currentRound >= room.rounds) {
        // Game ended, calculate final scores and IQs
        const leaderboard = room.players.map(player => {
            const iq = calculateIQ(
                player.score, 
                room.rounds, 
                player.correctGuesses || 0,
                player.quickGuesses || 0
            );
            return {
                ...player,
                iq: iq
            };
        }).sort((a, b) => b.score - a.score);

        const winner = leaderboard[0];
        
        io.to(roomId).emit('game-ended', {
            winner: winner,
            leaderboard: leaderboard
        });
        
        // Reset game state but keep room
        room.gameState = 'waiting';
        room.currentRound = 0;
        room.drawings = [];
    } else {
        // Automatically start the next round after a short delay
        setTimeout(() => {
            startRound(roomId);
        }, 5000);
    }
}

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Handle creating a new room
    socket.on('create-room', (username) => {
        if (!username || username.trim() === '') {
            socket.emit('join-error', 'Username is required');
            return;
        }

        const roomId = generateRoomId();
        socket.join(roomId);
        
        // Initialize room state
        rooms.set(roomId, {
            players: [{ 
                id: socket.id, 
                username: username.trim(), 
                score: 0, 
                isDrawing: false,
                correctGuesses: 0,
                quickGuesses: 0,
                roundsDrawn: 0
            }],
            currentQuestion: '',
            currentAnswer: '',
            currentCategory: '',
            drawerIndex: -1,
            roundTime: 120,
            currentTime: 120,
            gameState: 'waiting',
            drawings: [],
            timerInterval: null,
            rounds: 3,
            currentRound: 0,
            maxPlayers: 4,
            correctGuessers: new Set()
        });
        
        users.set(socket.id, { roomId, username: username.trim(), isCreator: true });
        
        socket.emit('room-created', roomId);
        io.to(roomId).emit('update-players', rooms.get(roomId).players);
    });
    
    // Handle joining a room
    socket.on('join-room', (data) => {
        if (!data || !data.roomId || !data.username) {
            socket.emit('join-error', 'Room ID and username are required');
            return;
        }

        const { roomId, username } = data;
        const room = rooms.get(roomId);
        
        if (!room) {
            socket.emit('join-error', 'Room not found');
            return;
        }
        
        if (room.players.length >= room.maxPlayers) {
            socket.emit('join-error', 'Room is full');
            return;
        }

        if (room.gameState === 'playing') {
            socket.emit('join-error', 'Game is already in progress');
            return;
        }
        
        socket.join(roomId);
        
        // Add player to room
        room.players.push({ 
            id: socket.id, 
            username: username.trim(), 
            score: 0, 
            isDrawing: false,
            correctGuesses: 0,
            quickGuesses: 0,
            roundsDrawn: 0
        });
        users.set(socket.id, { roomId, username: username.trim(), isCreator: false });
        
        socket.emit('room-joined', {
            players: room.players,
            gameState: room.gameState,
            roomId: roomId
        });
        
        io.to(roomId).emit('update-players', room.players);
        io.to(roomId).emit('user-joined', username.trim());
    });
    
    // Handle drawing data
    socket.on('drawing', (data) => {
        const user = users.get(socket.id);
        if (!user) return;
        
        const room = rooms.get(user.roomId);
        if (!room || room.gameState !== 'playing') return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player || !player.isDrawing) return;
        
        room.drawings.push(data);
        socket.to(user.roomId).emit('drawing', data);
    });
    
    // Handle fill canvas
    socket.on('fill-canvas', (data) => {
        const user = users.get(socket.id);
        if (!user) return;
        
        const room = rooms.get(user.roomId);
        if (!room || room.gameState !== 'playing') return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player || !player.isDrawing) return;
        
        io.to(user.roomId).emit('fill-canvas', data);
    });
    
    // Handle clear canvas
    socket.on('clear-canvas', () => {
        const user = users.get(socket.id);
        if (!user) return;
        
        const room = rooms.get(user.roomId);
        if (!room || room.gameState !== 'playing') return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player || !player.isDrawing) return;
        
        room.drawings = [];
        io.to(user.roomId).emit('clear-canvas');
    });
    
    // Handle undo
    socket.on('undo', () => {
        const user = users.get(socket.id);
        if (!user) return;
        
        const room = rooms.get(user.roomId);
        if (!room || room.gameState !== 'playing') return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player || !player.isDrawing) return;
        
        if (room.drawings.length > 0) {
            room.drawings.pop();
        }
        
        socket.to(user.roomId).emit('undo');
    });
    
    // Handle chat messages
    socket.on('send-message', (message) => {
        const user = users.get(socket.id);
        if (!user) return;
        
        const room = rooms.get(user.roomId);
        if (!room || room.gameState !== 'playing') return;

        const player = room.players.find(p => p.id === socket.id);
        if (player && player.isDrawing) {
            socket.emit('receive-message', {
                username: 'System',
                message: 'You cannot guess while drawing',
                isSystem: true
            });
            return;
        }
        
        // Check if message is the correct answer
        const isCorrect = message.toLowerCase().trim() === room.currentAnswer.toLowerCase();
        
        if (isCorrect) {
            // Check if player already guessed correctly
            if (room.correctGuessers.has(socket.id)) {
                socket.emit('receive-message', {
                    username: 'System',
                    message: 'You already guessed correctly!',
                    isSystem: true
                });
                return;
            }

            // Award points
            const guessingPlayer = room.players.find(p => p.id === socket.id);
            if (guessingPlayer && !guessingPlayer.isDrawing) {
                // Calculate points based on time remaining
                const timeBonus = Math.floor(room.currentTime / 10);
                const points = 10 + timeBonus;
                guessingPlayer.score += points;
                guessingPlayer.correctGuesses = (guessingPlayer.correctGuesses || 0) + 1;
                
                // Track quick guesses (within first 30 seconds)
                if (room.currentTime > room.roundTime - 30) {
                    guessingPlayer.quickGuesses = (guessingPlayer.quickGuesses || 0) + 1;
                }
                
                // Add to correct guessers
                room.correctGuessers.add(socket.id);
                
                // Notify all players
                io.to(user.roomId).emit('correct-guess', {
                    username: user.username,
                    score: points,
                    timeRemaining: room.currentTime
                });
                
                io.to(user.roomId).emit('update-players', room.players);
                
                // Check if all players guessed correctly
                const remainingPlayers = room.players.filter(p => 
                    !p.isDrawing && !room.correctGuessers.has(p.id)
                );
                
                if (remainingPlayers.length === 0) {
                    // All players guessed correctly, end round early
                    clearInterval(room.timerInterval);
                    nextRound(user.roomId);
                }
            }
        } else {
            // Broadcast the message with incorrect flag
            io.to(user.roomId).emit('receive-message', {
                username: user.username,
                message: message,
                isCorrect: false,
                isIncorrect: true
            });
        }
    });
    
    // Handle view word request
    socket.on('view-word', () => {
        const user = users.get(socket.id);
        if (!user) return;
        
        const room = rooms.get(user.roomId);
        if (!room) return;
        
        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            socket.emit('view-word', {
                question: room.currentQuestion,
                answer: player.isDrawing ? room.currentAnswer : '',
                category: room.currentCategory
            });
        }
    });
    
    // Handle start game
    socket.on('start-game', (settings) => {
        const user = users.get(socket.id);
        if (!user) return;
        
        const room = rooms.get(user.roomId);
        if (!room) return;
        
        if (!user.isCreator) {
            socket.emit('join-error', 'Only the room creator can start the game');
            return;
        }

        if (room.players.length < 2) {
            socket.emit('join-error', 'Need at least 2 players to start the game');
            return;
        }
        
        // Validate settings
        if (settings.players < 2 || settings.players > 10) {
            socket.emit('join-error', 'Players must be between 2 and 10');
            return;
        }
        
        if (settings.drawTime < 30 || settings.drawTime > 300) {
            socket.emit('join-error', 'Draw time must be between 30 seconds and 5 minutes');
            return;
        }
        
        if (settings.rounds < 1 || settings.rounds > 10) {
            socket.emit('join-error', 'Rounds must be between 1 and 10');
            return;
        }
        
        // Update room settings
        room.roundTime = settings.drawTime;
        room.rounds = settings.rounds;
        room.maxPlayers = settings.players;
        room.currentRound = 0;
        
        // Reset all player scores and stats
        room.players.forEach(player => {
            player.score = 0;
            player.isDrawing = false;
            player.correctGuesses = 0;
            player.quickGuesses = 0;
            player.roundsDrawn = 0;
        });
        
        startRound(user.roomId);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        const user = users.get(socket.id);
        if (!user) return;
        
        const room = rooms.get(user.roomId);
        if (room) {
            if (room.timerInterval) {
                clearInterval(room.timerInterval);
                room.timerInterval = null;
            }
            
            const playerIndex = room.players.findIndex(player => player.id === socket.id);
            if (playerIndex !== -1) {
                const disconnectedPlayer = room.players[playerIndex];
                room.players.splice(playerIndex, 1);
                
                io.to(user.roomId).emit('user-left', disconnectedPlayer.username);
                
                if (room.players.length === 0) {
                    rooms.delete(user.roomId);
                } else {
                    if (room.gameState === 'playing' && disconnectedPlayer.isDrawing) {
                        clearInterval(room.timerInterval);
                        nextRound(user.roomId);
                    }
                    
                    if (user.isCreator) {
                        const newCreator = room.players[0];
                        if (newCreator) {
                            const newCreatorUser = users.get(newCreator.id);
                            if (newCreatorUser) {
                                newCreatorUser.isCreator = true;
                            }
                        }
                    }
                    
                    io.to(user.roomId).emit('update-players', room.players);
                }
            }
        }
        
        users.delete(socket.id);
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});