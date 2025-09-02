const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

// Store active sessions
const sessions = new Map();
const userSessions = new Map();

// In-memory demo data for REST endpoints (kept in RAM)
let classesStore = [];
let teachersStore = [
    { id: 1, username: 'teacher', name: 'Jane Smith', email: 'teacher@example.com' }
];
let studentsStore = [
    { id: 1, full_name: 'Maria Garcia', level: 'beginner' }
];
let nextIds = { class: 1, teacher: 2, student: 2 };

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/session/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId;
    if (sessions.has(sessionId)) {
        res.sendFile(path.join(__dirname, 'index.html'));
    } else {
        res.status(404).send('Session not found');
    }
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    let currentSession = null;
    let userRole = null;
    
    // Join session
    socket.on('join-class', (data) => {
        const { classId, userId, userRole: incomingRole, userName } = data;
        currentSession = classId;
        userRole = incomingRole;

        socket.join(classId);

        // Initialize session if it doesn't exist
        if (!sessions.has(classId)) {
            sessions.set(classId, {
                id: classId,
                teacher: null,
                student: null,
                chatHistory: [],
                whiteboardData: [],
                startTime: null,
                isActive: false
            });
        }

        const session = sessions.get(classId);

        // Assign user to session
        if (incomingRole === 'teacher') {
            session.teacher = socket.id;
        } else {
            session.student = socket.id;
        }

        userSessions.set(socket.id, classId);

        // Send session info to user
        socket.emit('session joined', {
            sessionId: classId,
            role: incomingRole,
            participants: {
                teacher: session.teacher,
                student: session.student
            }
        });

        // Notify other participants
        socket.to(classId).emit('user joined', {
            userId: socket.id,
            role: incomingRole
        });

        console.log(`User ${socket.id} joined session ${classId} as ${incomingRole}`);
    });
    
    // Chat messages
    socket.on('chat message', (data) => {
        if (currentSession) {
            const session = sessions.get(currentSession);
            if (session) {
                // Store message in session history
                session.chatHistory.push({
                    sender: data.sender,
                    message: data.message,
                    type: data.type,
                    timestamp: new Date().toISOString()
                });
                
                // Broadcast to all users in session
                io.to(currentSession).emit('chat message', data);
            }
        }
    });
    
    // Whiteboard drawing
    socket.on('draw', (data) => {
        if (currentSession) {
            const session = sessions.get(currentSession);
            if (session) {
                // Store drawing data
                session.whiteboardData.push({
                    ...data,
                    timestamp: new Date().toISOString()
                });
                
                // Broadcast to other users in session
                socket.to(currentSession).emit('draw', data);
            }
        }
    });
    
    // Clear whiteboard
    socket.on('clear canvas', () => {
        if (currentSession) {
            const session = sessions.get(currentSession);
            if (session) {
                session.whiteboardData = [];
                socket.to(currentSession).emit('clear canvas');
            }
        }
    });
    
    // Class control events
    socket.on('class started', () => {
        if (currentSession) {
            const session = sessions.get(currentSession);
            if (session) {
                session.isActive = true;
                session.startTime = new Date().toISOString();
                io.to(currentSession).emit('class started');
            }
        }
    });
    
    socket.on('class restarted', () => {
        if (currentSession) {
            io.to(currentSession).emit('class restarted');
        }
    });
    
    socket.on('leave class', () => {
        if (currentSession) {
            socket.to(currentSession).emit('user left', {
                userId: socket.id,
                role: userRole
            });
        }
    });
    
    socket.on('end class', () => {
        if (currentSession) {
            const session = sessions.get(currentSession);
            if (session) {
                session.isActive = false;
                io.to(currentSession).emit('class ended');
                
                // Clean up session after delay
                setTimeout(() => {
                    if (sessions.has(currentSession)) {
                        sessions.delete(currentSession);
                        console.log(`Session ${currentSession} cleaned up`);
                    }
                }, 60000); // 1 minute delay
            }
        }
    });
    
    // WebRTC signaling
    socket.on('offer', (offer) => {
        if (currentSession) {
            socket.to(currentSession).emit('offer', offer);
        }
    });
    
    socket.on('answer', (answer) => {
        if (currentSession) {
            socket.to(currentSession).emit('answer', answer);
        }
    });
    
    socket.on('ice candidate', (candidate) => {
        if (currentSession) {
            socket.to(currentSession).emit('ice candidate', candidate);
        }
    });
    
    // Save feedback
    socket.on('save feedback', (feedback) => {
        if (currentSession) {
            const session = sessions.get(currentSession);
            if (session) {
                session.feedback = feedback;
                console.log('Feedback saved for session:', currentSession);
                
                // Here you would typically save to a database
                // For now, we'll just log it
                console.log('Feedback data:', feedback);
            }
        }
    });
    
    // Get session history
    socket.on('get session history', () => {
        if (currentSession) {
            const session = sessions.get(currentSession);
            if (session) {
                socket.emit('session history', {
                    chatHistory: session.chatHistory,
                    whiteboardData: session.whiteboardData
                });
            }
        }
    });
    
    // Disconnect handling
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        if (currentSession) {
            const session = sessions.get(currentSession);
            if (session) {
                // Remove user from session
                if (session.teacher === socket.id) {
                    session.teacher = null;
                } else if (session.student === socket.id) {
                    session.student = null;
                }
                
                // Notify other participants
                socket.to(currentSession).emit('user disconnected', {
                    userId: socket.id,
                    role: userRole
                });
                
                // Clean up empty sessions
                if (!session.teacher && !session.student) {
                    setTimeout(() => {
                        if (sessions.has(currentSession)) {
                            sessions.delete(currentSession);
                            console.log(`Empty session ${currentSession} cleaned up`);
                        }
                    }, 30000); // 30 second delay
                }
            }
            
            userSessions.delete(socket.id);
        }
    });
});

// API endpoints for session management
app.post('/api/sessions', (req, res) => {
    const sessionId = Math.random().toString(36).substring(2, 15);
    const { teacherId, studentId } = req.body;
    
    sessions.set(sessionId, {
        id: sessionId,
        teacher: teacherId,
        student: studentId,
        chatHistory: [],
        whiteboardData: [],
        startTime: null,
        isActive: false
    });
    
    res.json({ sessionId, success: true });
});

app.get('/api/sessions/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId;
    const session = sessions.get(sessionId);
    
    if (session) {
        res.json(session);
    } else {
        res.status(404).json({ error: 'Session not found' });
    }
});

app.delete('/api/sessions/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId;
    
    if (sessions.has(sessionId)) {
        sessions.delete(sessionId);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Session not found' });
    }
});

// Compatibility REST endpoints matching legacy PHP paths used by the frontend

// Auth (kept for compatibility though not used after removing login)
app.post('/api/auth.php', (req, res) => {
    res.json({ id: 'admin-1', username: 'admin', name: 'Administrator', email: 'admin@leonorlanguageschool.com', role: 'admin' });
});

// Classes
app.get('/api/classes.php', (req, res) => {
    const { id } = req.query;
    if (id) {
        const cls = classesStore.find(c => String(c.id) === String(id));
        if (!cls) return res.status(404).json({ error: 'Class not found' });
        return res.json(cls);
    }
    res.json(classesStore);
});

app.post('/api/classes.php', (req, res) => {
    const { name, student_name, teacher_name, scheduled_date, scheduled_time, duration, status } = req.body || {};
    const newClass = {
        id: nextIds.class++,
        name: name || 'Untitled Class',
        student_name: student_name || 'Student',
        teacher_name: teacher_name || 'Teacher',
        scheduled_date: scheduled_date || new Date().toISOString().slice(0,10),
        scheduled_time: scheduled_time || '09:00',
        duration: typeof duration === 'number' ? duration : 60,
        status: status || 'scheduled'
    };
    classesStore.push(newClass);
    res.json(newClass);
});

app.delete('/api/classes.php', (req, res) => {
    const { id } = req.query;
    const idx = classesStore.findIndex(c => String(c.id) === String(id));
    if (idx === -1) return res.status(404).json({ error: 'Class not found' });
    classesStore.splice(idx, 1);
    res.json({ success: true });
});

// Teachers
app.get('/api/teachers.php', (req, res) => {
    res.json(teachersStore);
});

app.post('/api/teachers.php', (req, res) => {
    const { username, name, email, password } = req.body || {};
    const newTeacher = { id: nextIds.teacher++, username: username || `teacher${Date.now()}`, name: name || 'New Teacher', email: email || '' };
    teachersStore.push(newTeacher);
    res.json(newTeacher);
});

app.delete('/api/teachers.php', (req, res) => {
    const { id } = req.query;
    const idx = teachersStore.findIndex(t => String(t.id) === String(id));
    if (idx === -1) return res.status(404).json({ error: 'Teacher not found' });
    teachersStore.splice(idx, 1);
    res.json({ success: true });
});

// Students
app.get('/api/students.php', (req, res) => {
    res.json(studentsStore);
});

app.post('/api/students.php', (req, res) => {
    const { full_name, level } = req.body || {};
    const newStudent = { id: nextIds.student++, full_name: full_name || 'New Student', level: level || 'beginner' };
    studentsStore.push(newStudent);
    res.json(newStudent);
});

app.delete('/api/students.php', (req, res) => {
    const { id } = req.query;
    const idx = studentsStore.findIndex(s => String(s.id) === String(id));
    if (idx === -1) return res.status(404).json({ error: 'Student not found' });
    studentsStore.splice(idx, 1);
    res.json({ success: true });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        activeSessions: sessions.size,
        connectedUsers: io.engine.clientsCount
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to access the application`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

