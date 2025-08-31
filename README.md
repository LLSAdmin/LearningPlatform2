# English Teaching Platform

A professional videoconference platform designed specifically for English teaching with real-time collaborative features.

## 🎯 Features

### Core Functionality
- **Real-time Video/Audio Streaming** - High-quality peer-to-peer communication
- **Collaborative Whiteboard** - Interactive drawing with real-time synchronization
- **Persistent Chat** - Messages remain even after page refresh
- **Screen Sharing** - Share your screen with students
- **PDF Export** - Export whiteboard content as PDF

### Class Management
- **Session Control** - Start, restart, leave, and end classes
- **Timer System** - Automatic class duration tracking
- **Unique Session URLs** - Easy student access via generated links
- **Feedback System** - Post-class feedback collection and storage

### Professional Design
- **Modern UI** - Clean, minimalist design with your brand colors
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Professional Styling** - Sleek and modern, not childish

## 🎨 Color Scheme
- **Primary Blue:** `#66ccff`
- **White:** `#ffffff`
- **Accent Pink:** `#ff99cc`

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   git clone <your-repository-url>
   cd english-teaching-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Open your browser and go to `http://localhost:3000`
   - The teacher interface will load automatically

### Development Mode
```bash
npm run dev
```
This will start the server with nodemon for automatic restarts during development.

## 📖 Usage Guide

### For Teachers

1. **Starting a Class**
   - Open the application in your browser
   - Allow camera and microphone permissions
   - Click the "Class Controls" dropdown
   - Select "Start Class" to begin the session
   - Share the generated session URL with your student

2. **During Class**
   - Use the whiteboard tools to draw and teach
   - Chat with your student in real-time
   - Share your screen when needed
   - Monitor the class timer

3. **Ending Class**
   - Click "End Class" to terminate the session
   - Fill out the feedback form
   - All data is automatically saved

### For Students

1. **Joining a Class**
   - Click the session URL provided by your teacher
   - Allow camera and microphone permissions
   - You'll automatically join the class session

2. **Participating**
   - Use the whiteboard to collaborate
   - Chat with your teacher
   - View shared screens

## 🛠️ Technical Architecture

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **HTML5 Canvas** - Interactive whiteboard
- **WebRTC** - Peer-to-peer video/audio
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js + Express** - Server framework
- **Socket.io** - Real-time bidirectional communication
- **Session Management** - In-memory session storage

### Key Technologies
- **WebRTC** for video/audio streaming
- **Canvas API** for whiteboard functionality
- **Socket.io** for real-time updates
- **jsPDF** for PDF export

## 📁 Project Structure

```
english-teaching-platform/
├── index.html          # Main application interface
├── app.js              # Frontend JavaScript logic
├── server.js           # Node.js server with Socket.io
├── package.json        # Dependencies and scripts
├── README.md           # This file
└── node_modules/       # Installed dependencies
```

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

### Customization
- **Colors**: Modify the CSS variables in `index.html`
- **Features**: Add new functionality in `app.js`
- **Server Logic**: Extend the Socket.io handlers in `server.js`

## 🌐 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
```bash
npm start
```

### Recommended Hosting
- **Heroku** - Easy deployment with Git integration
- **Vercel** - Serverless deployment
- **DigitalOcean** - VPS hosting
- **AWS EC2** - Scalable cloud hosting

## 🔒 Security Considerations

- **HTTPS Required** - WebRTC requires secure connections
- **Input Validation** - All user inputs are validated
- **Session Management** - Secure session handling
- **CORS Configuration** - Proper cross-origin settings

## 🐛 Troubleshooting

### Common Issues

1. **Camera/Microphone Not Working**
   - Ensure HTTPS is enabled (required for WebRTC)
   - Check browser permissions
   - Try refreshing the page

2. **Connection Issues**
   - Check your internet connection
   - Verify the server is running
   - Check browser console for errors

3. **Whiteboard Not Syncing**
   - Ensure both users are connected
   - Check Socket.io connection status
   - Refresh the page if needed

### Debug Mode
Enable debug logging by adding this to the browser console:
```javascript
localStorage.setItem('debug', 'socket.io-client:*');
```

## 📈 Future Enhancements

### Planned Features
- **Database Integration** - Persistent storage for sessions and feedback
- **User Authentication** - Teacher and student accounts
- **Recording** - Class session recording
- **File Sharing** - Document and image sharing
- **Mobile App** - Native mobile applications

### Technical Improvements
- **React Migration** - Convert to React for better maintainability
- **TypeScript** - Add type safety
- **Testing** - Unit and integration tests
- **CI/CD** - Automated deployment pipeline

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact: your-email@example.com

## 🙏 Acknowledgments

- **Socket.io** for real-time communication
- **WebRTC** for peer-to-peer streaming
- **jsPDF** for PDF export functionality
- **Font Awesome** for icons
- **Inter Font** for typography

---

**Built with ❤️ for English teachers worldwide**
