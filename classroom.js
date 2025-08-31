// Global variables
let socket;
let localStream;
let remoteStream;
let peerConnection;
let userData = null;
let currentClass = null;
let isTeacher = true; // Set to false for student
let currentTool = 'pen';
let currentColor = '#000000';
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let timer = null;
let timerSeconds = 0;
let isClassActive = false;
let isScreenSharing = false;
let participants = [];
let chatMessages = [];
let whiteboardData = [];
let classStatus = 'not-started'; // 'not-started', 'in-progress', 'ended'

// Canvas setup
const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
const chatMessagesContainer = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const timerDisplay = document.getElementById('timer');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    loadCurrentClass();
    initializeApp();
});

function loadUserData() {
    const stored = localStorage.getItem('userData');
    if (!stored) {
        window.location.href = 'index.html';
        return;
    }
    userData = JSON.parse(stored);
    isTeacher = userData.role === 'teacher';
}

async function loadCurrentClass() {
    const classId = new URLSearchParams(window.location.search).get('classId');
    if (!classId) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    try {
        const response = await fetch(`api/classes.php?id=${classId}`);
        if (response.ok) {
            currentClass = await response.json();
            
            // Update header with class info
            document.getElementById('className').textContent = currentClass.name;
            document.getElementById('classDetails').textContent = `${currentClass.student_name} • ${currentClass.duration} minutes`;
        } else {
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        console.error('Error loading class:', error);
        window.location.href = 'dashboard.html';
    }
}

async function initializeApp() {
    // Initialize canvas
    setupCanvas();
    
    // Initialize video
    await initializeVideo();
    
    // Initialize WebSocket connection
    initializeSocket();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize class status
    updateClassStatus('not-started');
    
    // Generate session URL if teacher
    if (isTeacher) {
        generateSessionURL();
    }
}

// Canvas setup
function setupCanvas() {
    // Set canvas size to fit container
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Set default styles
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

// Video initialization
async function initializeVideo() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
            audio: true
        });
        
        const localVideo = document.getElementById('localVideo');
        if (localVideo) {
            localVideo.srcObject = localStream;
            localVideo.muted = true; // Mute local video to prevent echo
            
            // Hide placeholder when video loads
            localVideo.onloadedmetadata = function() {
                const placeholder = document.getElementById('localVideoPlaceholder');
                if (placeholder) {
                    placeholder.style.display = 'none';
                }
            };
        }
        
        // Initialize peer connection for WebRTC
        initializePeerConnection();
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        addChatMessage('System', 'Camera access denied. Please allow camera permissions.', 'received');
    }
}

// WebRTC Peer Connection
function initializePeerConnection() {
    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };
    
    peerConnection = new RTCPeerConnection(configuration);
    
    // Add local stream to peer connection
    if (localStream) {
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
    }
    
    // Handle remote stream
    peerConnection.ontrack = (event) => {
        remoteStream = event.streams[0];
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo) {
            remoteVideo.srcObject = remoteStream;
        }
    };
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket) {
            socket.emit('webrtc-ice-candidate', {
                candidate: event.candidate,
                target: getOtherParticipantId()
            });
        }
    };
}

// Helper function to get other participant ID
function getOtherParticipantId() {
    // For now, return a simple ID - in a real app, you'd get this from the session
    return 'other-participant';
}

// Start video call (initiate WebRTC)
async function startVideoCall() {
    if (peerConnection && isTeacher) {
        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            
            socket.emit('webrtc-offer', {
                offer: offer,
                target: getOtherParticipantId()
            });
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    }
}

// Update participants list
function updateParticipantsList() {
    // This would update the UI to show current participants
    console.log('Participants updated:', participants);
}

// WebSocket initialization
function initializeSocket() {
    // Connect to your WebSocket server
    socket = io('http://localhost:3000');
    
    socket.on('connect', function() {
        console.log('Connected to server');
        addChatMessage('System', 'Connected to class session', 'received');
        
        // Join the class session
        socket.emit('join-class', {
            classId: currentClass.id,
            userId: userData.id,
            userRole: userData.role,
            userName: userData.name
        });
    });
    
    socket.on('disconnect', function() {
        console.log('Disconnected from server');
        addChatMessage('System', 'Disconnected from class session', 'received');
    });
    
    // Chat messages
    socket.on('new-chat-message', function(data) {
        addChatMessage(data.userName, data.message, 'received');
    });
    
    // Whiteboard updates
    socket.on('whiteboard-update', function(data) {
        if (data.type === 'draw') {
            drawLine(data.x1, data.y1, data.x2, data.y2, data.color, data.width);
        } else if (data.type === 'clear') {
            clearCanvas();
        }
    });
    
    // WebRTC signaling
    socket.on('webrtc-offer', async (data) => {
        if (peerConnection) {
            await peerConnection.setRemoteDescription(data.offer);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            
            socket.emit('webrtc-answer', {
                answer: answer,
                target: data.sender
            });
        }
    });
    
    socket.on('webrtc-answer', async (data) => {
        if (peerConnection) {
            await peerConnection.setRemoteDescription(data.answer);
        }
    });
    
    socket.on('webrtc-ice-candidate', async (data) => {
        if (peerConnection) {
            await peerConnection.addIceCandidate(data.candidate);
        }
    });
    
    // Class control events
    socket.on('class-started', function(data) {
        updateClassStatus('in-progress');
        isClassActive = true;
        startTimer();
        addChatMessage('System', 'Class started', 'received');
    });
    
    socket.on('class-ended', function() {
        updateClassStatus('ended');
        isClassActive = false;
        stopTimer();
        addChatMessage('System', 'Class ended', 'received');
        if (isTeacher) {
            showFeedbackModal();
        }
    });
    
    socket.on('user joined', function(data) {
        addChatMessage('System', `${data.role} joined the class`, 'received');
    });
    
    socket.on('user left', function(data) {
        addChatMessage('System', `${data.role} left the class`, 'received');
    });
}

// Event listeners
function setupEventListeners() {
    // Canvas drawing events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);
    
    // Window resize
    window.addEventListener('resize', function() {
        setupCanvas();
    });
    
    // Feedback form
    document.getElementById('feedbackForm').addEventListener('submit', handleFeedbackSubmit);
}

// Drawing functions
function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    // Draw locally
    drawLine(lastX, lastY, currentX, currentY, currentColor, ctx.lineWidth);
    
    // Send to server
    if (socket) {
        socket.emit('whiteboard-draw', {
            type: 'draw',
            x1: lastX,
            y1: lastY,
            x2: currentX,
            y2: currentY,
            color: currentColor,
            width: ctx.lineWidth
        });
    }
    
    lastX = currentX;
    lastY = currentY;
}

function drawLine(x1, y1, x2, y2, color, width) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
}

function stopDrawing() {
    isDrawing = false;
}

// Touch handling
function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                    e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

// Tool functions
function setTool(tool) {
    currentTool = tool;
    
    // Update active button
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.tool-btn').classList.add('active');
    
    // Update canvas cursor
    if (tool === 'eraser') {
        canvas.style.cursor = 'crosshair';
        ctx.lineWidth = 20;
        currentColor = '#ffffff';
    } else {
        canvas.style.cursor = 'crosshair';
        ctx.lineWidth = 2;
        currentColor = document.getElementById('colorPicker').value;
    }
}

function setColor(color) {
    currentColor = color;
    if (currentTool !== 'eraser') {
        ctx.strokeStyle = color;
    }
}

function clearWhiteboard() {
    if (confirm('Are you sure you want to clear the whiteboard?')) {
        clearCanvas();
        if (socket) {
            socket.emit('whiteboard-draw', {
                type: 'clear'
            });
        }
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Chat functions
function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function sendMessage() {
    const message = chatInput.value.trim();
    if (message && socket) {
        socket.emit('chat-message', {
            message: message
        });
        addChatMessage(userData.name, message, 'sent');
        chatInput.value = '';
    }
}

function addChatMessage(sender, message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;
    messageDiv.innerHTML = `
        <div class="sender">${sender}</div>
        ${message}
    `;
    
    if (chatMessagesContainer) {
        chatMessagesContainer.appendChild(messageDiv);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
}

// Timer functions
function startTimer() {
    if (timer) clearInterval(timer);
    
    timerSeconds = 0;
    timer = setInterval(function() {
        timerSeconds++;
        updateTimerDisplay();
    }, 1000);
    
    isClassActive = true;
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    isClassActive = false;
}

function restartTimer() {
    stopTimer();
    startTimer();
}

function updateTimerDisplay() {
    const hours = Math.floor(timerSeconds / 3600);
    const minutes = Math.floor((timerSeconds % 3600) / 60);
    const seconds = timerSeconds % 60;
    
    timerDisplay.textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Class status management
function updateClassStatus(status) {
    classStatus = status;
    const statusBtn = document.getElementById('classStatusBtn');
    const statusText = document.getElementById('statusText');
    const statusIcon = document.getElementById('statusIcon');
    
    // Remove all status classes
    statusBtn.classList.remove('status-not-started', 'status-in-progress', 'status-ended');
    statusIcon.classList.remove('not-started', 'in-progress', 'ended');
    
    // Add appropriate classes and update text
    switch (status) {
        case 'not-started':
            statusBtn.classList.add('status-not-started');
            statusIcon.classList.add('not-started');
            statusText.textContent = 'Not Started';
            break;
        case 'in-progress':
            statusBtn.classList.add('status-in-progress');
            statusIcon.classList.add('in-progress');
            statusText.textContent = 'In Progress';
            break;
        case 'ended':
            statusBtn.classList.add('status-ended');
            statusIcon.classList.add('ended');
            statusText.textContent = 'Class Ended';
            break;
    }
}

function toggleClassStatusDropdown() {
    const dropdown = document.getElementById('classStatusDropdown');
    dropdown.classList.toggle('show');
}

function startClass() {
    if (classStatus === 'not-started') {
        updateClassStatus('in-progress');
        isClassActive = true;
        
        if (socket) {
            socket.emit('start-class');
        } else {
            startTimer();
            addChatMessage('System', 'Class started', 'received');
        }
    }
    toggleClassStatusDropdown();
}

function restartClass() {
    if (socket) {
        socket.emit('class restarted');
    } else {
        restartTimer();
        addChatMessage('System', 'Class restarted', 'received');
    }
    toggleDropdown();
}

function leaveClass() {
    if (confirm('Are you sure you want to leave the class?')) {
        if (socket) {
            socket.emit('leave class');
        }
        stopTimer();
        addChatMessage('System', 'You left the class', 'received');
        
        // If teacher, show feedback form; if student, redirect to dashboard
        if (isTeacher) {
            showFeedbackModal();
        } else {
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }
    }
    toggleClassStatusDropdown();
}

function endClass() {
    if (confirm('Are you sure you want to end the class? This will remove all participants.')) {
        updateClassStatus('ended');
        isClassActive = false;
        
        if (socket) {
            socket.emit('end-class');
        } else {
            stopTimer();
            addChatMessage('System', 'Class ended', 'received');
            
            // If student, remove them from class
            if (!isTeacher) {
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                // Teacher stays and shows feedback form
                showFeedbackModal();
            }
        }
    }
    toggleClassStatusDropdown();
}

function resetClassStatus() {
    if (confirm('Are you sure you want to reset the class status? This will stop the timer and reset to "Not Started".')) {
        updateClassStatus('not-started');
        isClassActive = false;
        stopTimer();
        timerSeconds = 0;
        updateTimerDisplay();
        addChatMessage('System', 'Class status reset', 'received');
    }
    toggleClassStatusDropdown();
}

// Screen sharing
function toggleScreenShare() {
    if (!isScreenSharing) {
        startScreenShare();
    } else {
        stopScreenShare();
    }
}

async function startScreenShare() {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true
        });
        
        // Replace video track
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnection.getSenders().find(s => s.track.kind === 'video');
        sender.replaceTrack(videoTrack);
        
        isScreenSharing = true;
        addChatMessage('System', 'Screen sharing started', 'received');
        
    } catch (error) {
        console.error('Error starting screen share:', error);
        addChatMessage('System', 'Failed to start screen sharing', 'received');
    }
}

function stopScreenShare() {
    // Restore camera video
    if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        const sender = peerConnection.getSenders().find(s => s.track.kind === 'video');
        sender.replaceTrack(videoTrack);
    }
    
    isScreenSharing = false;
    addChatMessage('System', 'Screen sharing stopped', 'received');
}

// PDF Export
function exportToPDF() {
    // Convert canvas to image
    const imgData = canvas.toDataURL('image/png');
    
    // Create PDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(16);
    pdf.text('Class Whiteboard', 20, 20);
    
    // Add class info
    pdf.setFontSize(12);
    pdf.text(`Class: ${currentClass.name}`, 20, 30);
    pdf.text(`Student: ${currentClass.student}`, 20, 40);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
    
    // Add whiteboard image
    pdf.addImage(imgData, 'PNG', 20, 70, 170, 127.5);
    
    // Save PDF
    pdf.save(`${currentClass.name.replace(/[^a-zA-Z0-9]/g, '_')}-whiteboard.pdf`);
    
    addChatMessage('System', 'Whiteboard exported to PDF', 'received');
}

// Feedback modal
function showFeedbackModal() {
    document.getElementById('feedbackModal').style.display = 'block';
}

function closeFeedbackModal() {
    document.getElementById('feedbackModal').style.display = 'none';
}

function handleFeedbackSubmit(e) {
    e.preventDefault();
    
    const feedback = {
        classId: currentClass.id,
        className: currentClass.name,
        student: currentClass.student,
        progress: document.getElementById('progress').value,
        notes: document.getElementById('notes').value,
        homework: document.getElementById('homework').value,
        classDuration: timerSeconds,
        timestamp: new Date().toISOString()
    };
    
    // Save feedback (send to server)
    if (socket) {
        socket.emit('save feedback', feedback);
    }
    
    // Store locally as backup
    const existingFeedback = JSON.parse(localStorage.getItem('classFeedback') || '[]');
    existingFeedback.push(feedback);
    localStorage.setItem('classFeedback', JSON.stringify(existingFeedback));
    
    closeFeedbackModal();
    addChatMessage('System', 'Feedback saved successfully', 'received');
    
    // Reset form
    document.getElementById('feedbackForm').reset();
    
    // Redirect to dashboard after a delay
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 2000);
}

// Session URL generation
function generateSessionURL() {
    const sessionId = currentClass.id;
    const sessionURL = `${window.location.origin}/classroom.html?session=${sessionId}`;
    
    // Display session URL (you can create a modal for this)
    console.log('Session URL:', sessionURL);
    addChatMessage('System', `Session URL: ${sessionURL}`, 'received');
}

// WebRTC functions (basic implementation)
function createPeerConnection() {
    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
        ]
    };
    
    peerConnection = new RTCPeerConnection(configuration);
    
    // Add local stream
    if (localStream) {
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
    }
    
    // Handle incoming streams
    peerConnection.ontrack = function(event) {
        const remoteVideo = document.getElementById('remoteVideo');
        remoteVideo.srcObject = event.streams[0];
        document.getElementById('remoteVideoPlaceholder').style.display = 'none';
    };
    
    // Handle ICE candidates
    peerConnection.onicecandidate = function(event) {
        if (event.candidate && socket) {
            socket.emit('ice candidate', event.candidate);
        }
    };
}

function handleOffer(offer) {
    createPeerConnection();
    peerConnection.setRemoteDescription(offer);
    peerConnection.createAnswer().then(answer => {
        peerConnection.setLocalDescription(answer);
        socket.emit('answer', answer);
    });
}

function handleAnswer(answer) {
    peerConnection.setRemoteDescription(answer);
}

function handleIceCandidate(candidate) {
    if (peerConnection) {
        peerConnection.addIceCandidate(candidate);
    }
}

// Close dropdown when clicking outside
window.onclick = function(event) {
    if (!event.target.matches('.dropdown-btn')) {
        const dropdowns = document.getElementsByClassName('dropdown-content');
        for (let dropdown of dropdowns) {
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        }
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('feedbackModal');
    if (event.target === modal) {
        closeFeedbackModal();
    }
}

// Handle page unload
window.addEventListener('beforeunload', function() {
    if (socket) {
        socket.emit('leave class');
    }
});

