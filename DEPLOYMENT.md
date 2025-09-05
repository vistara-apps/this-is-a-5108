# KnowYourRights AI - Deployment Guide

This guide covers the complete deployment process for the KnowYourRights AI application.

## 🏗️ Infrastructure Setup

### 1. Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Set up Database Schema**
   ```sql
   -- Copy the DATABASE_SETUP_SQL from src/config/supabase.js
   -- Run in Supabase SQL Editor
   ```

3. **Configure Authentication**
   - Enable email authentication
   - Set up email templates (optional)
   - Configure redirect URLs for production

4. **Set up Row Level Security**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;
   
   -- Create policies (included in DATABASE_SETUP_SQL)
   ```

### 2. OpenAI Setup

1. **Get API Key**
   - Go to [platform.openai.com](https://platform.openai.com)
   - Create an API key
   - Set usage limits and billing

2. **Configure Usage**
   - Monitor token usage
   - Set up usage alerts
   - Consider caching strategies

### 3. Stripe Setup

1. **Create Stripe Account**
   - Set up products and pricing
   - Create webhook endpoints
   - Get publishable and secret keys

2. **Create Products**
   ```javascript
   // Premium Monthly Subscription
   Product: "KnowYourRights Premium"
   Price: $5.00/month recurring
   ```

3. **Deploy Edge Functions**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link to your project
   supabase link --project-ref your-project-ref
   
   # Deploy functions
   supabase functions deploy create-checkout-session
   supabase functions deploy webhook-handler
   ```

4. **Configure Webhooks**
   - Endpoint: `https://your-project.supabase.co/functions/v1/webhook-handler`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### 4. Pinata IPFS Setup

1. **Create Pinata Account**
   - Go to [pinata.cloud](https://pinata.cloud)
   - Get API key and secret
   - Set up billing for storage

2. **Configure IPFS Gateway**
   - Use Pinata's gateway: `https://gateway.pinata.cloud/ipfs/`
   - Consider custom domain for branding

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Push to GitHub
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect GitHub repository to Vercel
   - Configure build settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

3. **Environment Variables**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_OPENAI_API_KEY=sk-your-openai-key
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key
   VITE_PINATA_API_KEY=your-pinata-api-key
   VITE_PINATA_SECRET_KEY=your-pinata-secret-key
   ```

4. **Custom Domain** (Optional)
   - Add custom domain in Vercel dashboard
   - Configure DNS records
   - Enable SSL certificate

### Option 2: Netlify

1. **Build Settings**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [build.environment]
     NODE_VERSION = "18"
   ```

2. **Deploy**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Build and deploy
   npm run build
   netlify deploy --prod --dir=dist
   ```

### Option 3: Self-Hosted

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Server Configuration**
   ```nginx
   # nginx.conf
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           root /path/to/dist;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

## 🔧 Production Configuration

### Environment Variables

```env
# Production Environment Variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_OPENAI_API_KEY=sk-your-production-openai-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-production-stripe-key
VITE_PINATA_API_KEY=your-production-pinata-api-key
VITE_PINATA_SECRET_KEY=your-production-pinata-secret-key
```

### Security Considerations

1. **API Keys**
   - Use production keys only
   - Rotate keys regularly
   - Monitor usage and set limits

2. **CORS Configuration**
   ```javascript
   // Supabase CORS settings
   // Add your production domain
   ```

3. **Content Security Policy**
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; 
                  connect-src 'self' https://*.supabase.co https://api.openai.com https://api.stripe.com https://api.pinata.cloud;
                  media-src 'self' blob: https://gateway.pinata.cloud;">
   ```

## 📊 Monitoring & Analytics

### 1. Application Monitoring

```javascript
// Add error tracking
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
});
```

### 2. Usage Analytics

```javascript
// Add Google Analytics or similar
import { gtag } from 'ga-gtag';

gtag('config', 'GA_MEASUREMENT_ID');
```

### 3. Performance Monitoring

- Monitor Core Web Vitals
- Track API response times
- Monitor IPFS upload success rates
- Track user engagement metrics

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        VITE_OPENAI_API_KEY: ${{ secrets.VITE_OPENAI_API_KEY }}
        VITE_STRIPE_PUBLISHABLE_KEY: ${{ secrets.VITE_STRIPE_PUBLISHABLE_KEY }}
        VITE_PINATA_API_KEY: ${{ secrets.VITE_PINATA_API_KEY }}
        VITE_PINATA_SECRET_KEY: ${{ secrets.VITE_PINATA_SECRET_KEY }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 🧪 Testing in Production

### 1. Smoke Tests

```bash
# Test critical paths
curl -f https://yourdomain.com/
curl -f https://yourdomain.com/api/health
```

### 2. User Acceptance Testing

- Test user registration flow
- Test recording functionality
- Test payment processing
- Test IPFS uploads

### 3. Load Testing

```javascript
// Use tools like Artillery or k6
import http from 'k6/http';

export default function () {
  http.get('https://yourdomain.com');
}
```

## 🚨 Rollback Strategy

### Quick Rollback

1. **Vercel**: Use deployment history to rollback
2. **Netlify**: Rollback to previous deploy
3. **Self-hosted**: Keep previous build artifacts

### Database Migrations

```sql
-- Always test migrations in staging first
-- Keep rollback scripts ready
-- Use Supabase migration system
```

## 📋 Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] Stripe webhooks configured
- [ ] IPFS storage working
- [ ] Authentication flow tested
- [ ] Recording functionality tested
- [ ] Payment processing tested
- [ ] SSL certificate active
- [ ] Monitoring configured
- [ ] Error tracking active
- [ ] Performance metrics baseline established
- [ ] Backup strategy implemented

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check Supabase CORS settings
   - Verify domain configuration

2. **Authentication Issues**
   - Check redirect URLs
   - Verify email templates

3. **Payment Failures**
   - Check Stripe webhook configuration
   - Verify API keys

4. **IPFS Upload Failures**
   - Check Pinata API limits
   - Verify file size limits

### Support Contacts

- **Supabase**: [support.supabase.com](https://support.supabase.com)
- **Stripe**: [support.stripe.com](https://support.stripe.com)
- **Pinata**: [support.pinata.cloud](https://support.pinata.cloud)
- **OpenAI**: [help.openai.com](https://help.openai.com)

---

**🎉 Congratulations!** Your KnowYourRights AI application is now deployed and ready to help users understand their rights during police interactions.
