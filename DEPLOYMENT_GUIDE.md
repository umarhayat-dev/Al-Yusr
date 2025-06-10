# Firebase Full-Stack Deployment Guide

## Project Structure Overview
Your React + Express app is now configured for Firebase deployment with:
- **Frontend**: React app served via Firebase Hosting
- **Backend**: Express server deployed as Firebase Functions
- **Database**: Firebase Realtime Database + Google Sheets integration

## Files Created/Modified

### Firebase Functions Setup
1. `functions/` - New directory containing your backend as a Firebase Function
2. `functions/package.json` - Dependencies for Firebase Functions
3. `functions/tsconfig.json` - TypeScript configuration for Functions
4. `functions/src/index.ts` - Your Express app exported as Firebase Function
5. `firebase.json` - Updated to route `/api/**` to Functions, everything else to Hosting

### Key Configuration Changes
- Added CORS configuration for your Firebase domains
- Converted Express server to Firebase Function export
- Removed `app.listen()` calls (Firebase handles this)
- Configured Firebase Hosting to serve from `dist/public`

## Deployment Commands

### 1. Build Frontend
```bash
npm run build
```

### 2. Build Functions (if needed separately)
```bash
cd functions && npm run build
```

### 3. Deploy Everything to Firebase
```bash
firebase deploy
```

### 4. Deploy Only Hosting
```bash
firebase deploy --only hosting
```

### 5. Deploy Only Functions
```bash
firebase deploy --only functions
```

## How It Works

### Request Routing
- `https://your-app.web.app/` → React frontend (Firebase Hosting)
- `https://your-app.web.app/api/*` → Express backend (Firebase Functions)
- All other routes → React app (SPA routing)

### Local Development
Your existing local development setup continues to work:
```bash
npm run dev
```
This runs Express on port 5000 with Vite serving the frontend.

### Production Architecture
- **Firebase Hosting**: Serves built React app from `dist/public`
- **Firebase Functions**: Runs your Express server serverlessly
- **Firebase RTDB**: Stores courses, users, and other data
- **Google Sheets**: Handles form submissions and admin reviews

## Environment Variables
Production environment variables are embedded in the build via `.env`:
- Firebase configuration
- Google Sheets API keys
- Service account credentials

## CORS Configuration
Your backend now accepts requests from:
- `https://alyusrinstitute-net.web.app`
- `https://alyusrinstitute-net.firebaseapp.com`
- Local development URLs

## API Endpoints Available
All your existing API routes work in production:
- `/api/courses` - Get courses
- `/api/reviews` - Get/submit reviews
- `/api/google-sheets-reviews` - Get approved reviews from Sheets
- `/api/submit-enrollment-to-sheets` - Submit enrollments
- `/api/submit-contact-to-sheets` - Submit contact forms
- `/api/admin/pending-reviews` - Admin review management
- `/api/admin/delete-review/:id` - Delete reviews

## Deployment Checklist

### Pre-deployment
- [ ] Firebase project created and configured
- [ ] Service account credentials in place
- [ ] Google Sheets API access enabled
- [ ] Environment variables set in `.env`

### Deploy
- [ ] Run `npm run build` to build frontend
- [ ] Run `firebase deploy` to deploy both hosting and functions
- [ ] Verify deployment URL works

### Post-deployment Testing
- [ ] Frontend loads correctly
- [ ] API endpoints respond (test `/api/health`)
- [ ] Course data loads from Firebase RTDB
- [ ] Form submissions work (contact, enrollment, reviews)
- [ ] Admin dashboard functions properly
- [ ] Google Sheets integration operational

## Troubleshooting

### Common Issues
1. **API calls fail**: Check CORS configuration and Firebase Functions logs
2. **Build fails**: Ensure all dependencies are installed in `functions/`
3. **Routes not working**: Verify `firebase.json` rewrite rules
4. **Sheets integration fails**: Check service account permissions

### Firebase CLI Commands
```bash
# View function logs
firebase functions:log

# Test locally with emulators
firebase emulators:start

# Check deployment status
firebase projects:list
```

## Benefits of This Setup
- **Scalability**: Functions auto-scale based on demand
- **Cost-effective**: Pay only for actual usage
- **Global CDN**: Frontend served from Firebase's global network
- **Integrated**: Single deployment command for full stack
- **Monitoring**: Built-in Firebase monitoring and logging