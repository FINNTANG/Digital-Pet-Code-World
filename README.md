# REALITYEATER - Interactive Digital Pet 🎮

REALITYEATER is a cyberpunk-themed web-based interactive virtual pet game that blends retro pixel art with modern UI design. Players can interact with three different virtual pets (dog, fox, snake) and take care of them by feeding them through a webcam and engaging in AI-powered conversations.

![屏幕截图 2025-02-06 094233](https://github.com/user-attachments/assets/a80a707a-7f5e-458c-bb4c-ee509888401d)

## ✨ Key Features

### 🐾 Diverse Pet Selection
- **Dog**: Loyal and energetic companion
- **Fox**: Clever and playful friend
- **Snake**: Mysterious and elegant creature

### 🎯 Interactive Gameplay
- **Real-time Webcam Feeding**: AI-powered image recognition analyzes food items shown to the camera
- **Intelligent Dialogue System**: Have conversations with your pet using advanced AI
- **Status Monitoring**: Track health and happiness levels in real-time
- **Dynamic Animations**: Pets react with different animations based on their mood and health

### 🎨 Stunning Visual Design
- **Cyberpunk Aesthetic**: Matrix-inspired green code rain background
- **Custom Cursor Effects**: Advanced dual-layer cursor with smooth animations and hover effects
- **Retro Pixel Art**: Nostalgic 8-bit style interface with modern polish
- **3D Starfield**: Interactive Three.js particle system that responds to mouse movement
- **Draggable Windows**: Intuitive window-based UI with smooth drag interactions

### 🔐 User System
- **User Authentication**: Secure login and registration system
- **Guest Mode**: Try the game without creating an account
- **Privacy Policy**: Comprehensive data protection and user privacy

### 🎵 Immersive Audio
- **Background Music**: Atmospheric soundtrack with volume controls
- **Interactive SFX**: Sound effects for actions and events
- **Opening Sequence**: Cinematic intro with synchronized audio

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern component-based UI library
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework

### Graphics & Animation
- **Three.js** - 3D graphics library for starfield effects
- **WebGL** - Hardware-accelerated graphics
- **Custom CSS Animations** - Smooth transitions and effects

### AI & APIs
- **Image Recognition API** - Analyzes webcam feed for food detection
- **Chat API** - Powers intelligent pet conversations
- **Axios** - HTTP client for API requests

### Audio
- **Web Audio API** - Native browser audio control
- **Custom Audio Components** - Background music and sound effects management

## 🎮 How to Play

### 1. Start Your Journey
- Choose between **Login**, **Register**, or **Guest Mode**
- Watch the opening cinematic sequence
- Enter a name for your pet
- Receive a randomly assigned virtual companion

### 2. Care for Your Pet
- **Feed**: Show food items to your webcam - the AI will recognize and analyze them
- **Chat**: Have meaningful conversations with your pet through the dialogue system
- **Monitor**: Keep track of health and happiness status bars

### 3. Status Management
- **Health** < 30%: Your pet will become sick 🤒
- **Happiness** < 30%: Your pet will feel sad 😢
- **Game Over**: If either stat reaches 0%, you'll need to restart

### 4. Interactive Features
- **FEED Button**: Opens webcam interface for feeding
- **TALK Button**: Initiates conversation with your pet
- **HINT Button**: Get helpful tips and guidance

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/pnpm
- Modern web browser with webcam support
- Stable internet connection for AI features

### Installation

```bash
# Clone the repository
git clone https://github.com/FINNTANG/Digital-Pet-Code-World.git

# Navigate to project directory
cd Digital-Pet-Code-World

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev
```

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
Digital-Pet-Code-World/
├── public/                  # Static assets
│   ├── pets/               # Pet GIF animations
│   └── *.mp3               # Audio files
├── src/
│   ├── api/                # API integration modules
│   │   ├── auth.js        # Authentication APIs
│   │   └── chat.js        # Chat APIs
│   ├── components/         # React components
│   │   ├── CustomCursor.jsx       # Custom cursor effect
│   │   ├── DigitalPet.jsx         # Main pet component
│   │   ├── GameScreen.jsx         # Game interface
│   │   ├── LoginForm.jsx          # Authentication UI
│   │   ├── OpeningSequence.jsx    # Intro sequence
│   │   └── ui/                    # UI components
│   ├── styles/             # CSS stylesheets
│   │   ├── Pet.css        # Pet-specific styles
│   │   └── MatrixRain.css # Background effects
│   ├── utils/              # Utility functions
│   │   ├── chatGenerate.js       # AI chat logic
│   │   ├── imageAnalysis.js      # Image recognition
│   │   ├── matrixRain.js         # Matrix effect
│   │   ├── request.js            # HTTP client
│   │   └── starfield.js          # 3D starfield
│   ├── App.jsx             # Root component
│   └── main.jsx            # Entry point
└── package.json
```

## 🎨 Design Features

### Custom Cursor System
- **Dual-layer Design**: Inner energy dot + outer ring
- **Smooth Animations**: Delayed trailing effect with easing
- **Interactive States**: 
  - Normal: Green glowing dot with ring
  - Hover: Cyan color with rotation and crosshair
  - Click: Pulse effect
- **Blend Mode**: Exclusion mode creates stunning inversion effects

### Matrix Rain Background
- Authentic Matrix-style falling characters
- Adjustable opacity and speed
- Multiple brightness levels for depth
- Smooth animations with hardware acceleration

### 3D Starfield
- 10,000+ particles creating immersive space effect
- Mouse-responsive wave animations
- Color-coded depth perception
- Smooth camera controls with OrbitControls

## 📝 Important Notes

### Browser Requirements
- Modern browser with ES6+ support (Chrome 90+, Firefox 88+, Safari 14+)
- Webcam access permission required for feeding feature
- Local storage enabled for user data

### Optimal Experience
- Headphones recommended for full audio immersion
- Good lighting for webcam food recognition
- Stable internet connection for AI features

### Privacy & Security
- User data encrypted and stored securely
- Camera access only used for feeding feature
- No personal data shared with third parties

## 🎯 Upcoming Features

- [ ] Mobile responsive design
- [ ] Multiple pet customization options
- [ ] Pet evolution system
- [ ] Social features (visit friends' pets)
- [ ] Achievement system
- [ ] Mini-games

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Write clear commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Three.js community for amazing 3D graphics tools
- React team for the robust framework
- All contributors who help improve this project

## 📞 Contact & Support

- **GitHub Issues**: Report bugs and request features
- **Email**: [Your Email]
- **Website**: [Your Website]

---

**Made with ❤️ and lots of ☕**

*Transform reality, embrace the digital companion*
