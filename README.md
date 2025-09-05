# KnowYourRights AI

Your Pocket Guide to Police Interactions - A mobile-first application providing instant, state-specific 'Know Your Rights' information and de-escalation scripts for individuals interacting with law enforcement.

## 🚀 Features

### ✅ Implemented Core Features

- **State-Specific Rights Guides**: One-page, mobile-optimized guides detailing user rights during police stops, tailored to the user's current or selected state
- **De-escalation Scripts & Recording**: Pre-written, accessible scripts in English designed for de-escalation, with one-tap audio/video recording
- **Shareable Rights Summary**: Automatically generates concise, shareable summaries of key rights and actions based on user location
- **User Authentication**: Secure user registration and login with Supabase
- **Premium Subscription**: Freemium model with premium features for subscribers
- **IPFS Storage**: Secure, decentralized storage for recorded interactions via Pinata
- **AI-Powered Content**: OpenAI integration for personalized scripts and rights summaries

### 🔧 Technical Implementation

- **Frontend**: React 18 with Vite, Tailwind CSS for styling
- **Backend**: Supabase for authentication, database, and real-time features
- **AI Integration**: OpenAI GPT-4 for generating personalized scripts and legal summaries
- **Payment Processing**: Stripe for subscription management
- **File Storage**: Pinata IPFS for decentralized recording storage
- **Recording**: MediaRecorder API with WebRTC for audio/video capture

## 🏗️ Architecture

### Database Schema

```sql
-- Users table (extends Supabase auth.users)
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  state TEXT,
  subscription_status TEXT DEFAULT 'free',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Rights guides table
rights_guides (
  guide_id UUID PRIMARY KEY,
  state TEXT,
  title TEXT,
  content TEXT,
  last_updated TIMESTAMP
)

-- Scripts table
scripts (
  script_id UUID PRIMARY KEY,
  language TEXT DEFAULT 'en',
  scenario TEXT,
  script_text TEXT,
  type TEXT DEFAULT 'standard',
  created_at TIMESTAMP
)

-- Recordings table
recordings (
  recording_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  file_path TEXT,
  ipfs_hash TEXT,
  timestamp TIMESTAMP,
  duration INTEGER,
  type TEXT DEFAULT 'audio',
  metadata JSONB
)
```

### API Integrations

1. **Supabase**: Backend-as-a-Service for authentication, database, and real-time features
2. **OpenAI**: AI-powered script generation and rights summaries
3. **Stripe**: Payment processing for premium subscriptions
4. **Pinata**: IPFS storage for secure, decentralized file storage

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- OpenAI API key
- Stripe account (for payments)
- Pinata account (for IPFS storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vistara-apps/this-is-a-5108.git
   cd this-is-a-5108
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your API keys and configuration:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_OPENAI_API_KEY=your-openai-api-key
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
   VITE_PINATA_API_KEY=your-pinata-api-key
   VITE_PINATA_SECRET_KEY=your-pinata-secret-key
   ```

4. **Set up Supabase database**
   
   Run the SQL from `src/config/supabase.js` in your Supabase SQL editor to create the database schema:
   ```sql
   -- Copy and paste the DATABASE_SETUP_SQL from src/config/supabase.js
   ```

5. **Deploy Stripe Edge Functions** (Optional - for full payment functionality)
   
   Deploy the Stripe webhook handlers to Supabase Edge Functions:
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Deploy edge functions
   supabase functions deploy create-checkout-session
   supabase functions deploy webhook-handler
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## 📱 Usage

### For Users

1. **Select Your State**: Choose your state to get location-specific rights information
2. **Know Your Rights**: Access state-specific legal information for police interactions
3. **De-escalation Scripts**: Use pre-written scripts designed for safe interactions
4. **Record Interactions**: One-tap recording with secure IPFS storage
5. **Share Summaries**: Generate and share rights summaries with trusted contacts

### For Developers

The app is built with a modular architecture:

- **Components**: Reusable UI components in `src/components/`
- **Services**: API integrations in `src/services/`
- **Contexts**: React contexts for state management in `src/contexts/`
- **Data**: Static data and configurations in `src/data/`
- **Utils**: Utility functions in `src/utils/`

## 🔐 Security & Privacy

- **End-to-End Encryption**: Recordings are stored on IPFS with content addressing
- **Row Level Security**: Supabase RLS policies protect user data
- **No Server Storage**: Audio/video files are never stored on traditional servers
- **User Control**: Users control their data and can delete recordings anytime

## 💰 Business Model

- **Freemium**: Core features free, premium features for $5/month
- **Premium Features**:
  - Expanded script library
  - Offline access
  - Advanced recording features
  - AI-generated custom scripts
  - Priority support

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy the dist/ folder to your hosting provider
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 Legal Disclaimer

This application provides general legal information and should not be considered legal advice. Users should consult with qualified attorneys for specific legal situations. The information provided may not be current or applicable to all jurisdictions.

## 📞 Support

For support, email support@knowyourrightsai.com or create an issue in this repository.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React, Supabase, and modern web technologies
- Legal information sourced from public legal resources and constitutional law
- Icons by Lucide React
- UI components styled with Tailwind CSS

---

**⚠️ Important**: This is a legal rights education tool. Always comply with local laws and consult legal professionals for specific situations.
