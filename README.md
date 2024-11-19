WondrCut - 3D Perspective Video Editor for Saas Founders (Built with AI by @madebyjace on X / @jacemade on Tiktok)

WondrCut is a powerful web application that transforms static screenshots into stunning video presentations with dynamic animations, transitions, and professional effects.

🌟 Features

Screenshot to Video Conversion: Upload up to 10 high-quality screenshots and convert them into professional video presentations

Dynamic Animations: Choose from various perspective types and transitions

Custom Settings: 

Fine-tune video parameters including:
Duration per screenshot
Animation speed and type
Perspective and rotation
Background color
Blur effects

Multiple Export Options: 
Export videos in different qualities and formats

Subscription Plans: 
Free and premium plans with different export limits and features

🛠️ Tech Stack
Frontend: React + TypeScript + Vite
Styling: Tailwind CSS + DaisyUI
3D Rendering: Three.js
Authentication: Supabase Auth
Payment Processing: Stripe
Deployment: Netlify
State Management: Zustand
Animation: Framer Motion

🚀 Getting Started
1. Clone the repository:
git clone <repository-url>
cd wondrcut
Install dependencies:
npm install
Set up environment variables:
Create a .env file with the following variables:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
Start the development server:
npm run dev

🏗️ Project Structure
src/
├── components/ # React components
├── services/ # Business logic and API calls
├── lib/ # Utility functions and configurations
├── hooks/ # Custom React hooks
├── types/ # TypeScript type definitions
├── store/ # Zustand store configuration
└── pages/ # Page components
netlify/
└── functions/ # Serverless functions for backend operations

💳 Subscription Plans
Free: 3 video exports total, basic effects
Founder ($9/mo): 50 exports/month, all effects, HD quality
Pro ($29/mo): 500 exports/month, all effects, 4K quality, priority support

🔧 Configuration
The project uses several configuration files:
vite.config.ts - Vite configuration
tailwind.config.js - Tailwind CSS configuration
tsconfig.json - TypeScript configuration
netlify.toml - Netlify deployment configuration

📝 License
MIT License

🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request
📞 Support
For support, email support@wondrcut.com or join our community Discord server.
