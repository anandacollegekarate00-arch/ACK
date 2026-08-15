# Ananda College Karate - Modern App

🥋 Modern, iOS-inspired karate club management system built with **Vite + React + Supabase**

## ✨ Features

- 🎨 **Beautiful Design System** - Ocean blue theme with iOS-inspired UI
- ⚡ **Lightning Fast** - Vite for instant HMR and optimized builds
- 🔐 **Secure Authentication** - Supabase Auth integration
- 📊 **Real-time Dashboard** - Live statistics and insights
- 👥 **Student Management** - Complete student profiles
- 📅 **Attendance Tracking** - Mark and track attendance
- 🏆 **Achievement System** - Tournament results and awards
- 📈 **Analytics** - Performance insights and trends
- 📱 **Mobile First** - Responsive design with bottom navigation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase project set up

### Installation

1. **Install dependencies:**

   ```powershell
   npm install
   ```

2. **Configure environment:**
   Copy `.env.example` to `.env` and add your Supabase credentials:

   ```
   VITE_SUPABASE_URL=https://velrrklvyefnpvrkidww.supabase.co
   VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```

3. **Start development server:**

   ```powershell
   npm run dev
   ```

4. **Open your browser:**
   The app will automatically open at `http://localhost:3000`

## 📁 Project Structure

```
ACK WEB/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── BottomNav.jsx
│   │   └── Icons.jsx
│   ├── screens/          # Main app screens
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Students.jsx
│   │   ├── Attendance.jsx
│   │   ├── Achievements.jsx
│   │   ├── Analytics.jsx
│   │   └── Profile.jsx
│   ├── lib/             # Utilities
│   │   └── supabase.js
│   ├── styles/          # Global styles
│   │   └── index.css
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── design-system/       # Design tokens
│   ├── colors.css
│   ├── typography.css
│   └── spacing.css
├── components/          # Original React components (JSX files)
├── index-modern.html    # HTML entry point
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies

```

## 🎨 Design System

The app uses a complete design system with:

### Colors

- **Primary**: Ocean Blue (#0EA5E9)
- **Accent**: Amber Gold (#F59E0B)
- **Success**: Emerald (#10B981)
- **Danger**: Rose (#DC2626)

### Typography

- **Headings**: Poppins (bold, extrabold)
- **Body**: Inter (regular, medium, semibold)
- **Scale**: 12px → 48px fluid scale

### Spacing

- **System**: 8px base unit
- **Scale**: 0px → 128px

All design tokens are available as CSS custom properties:

```css
var(--color-primary)
var(--text-xl)
var(--space-4)
var(--radius-2xl)
var(--shadow-lg)
```

## 🗄️ Database Schema

See `DATABASE-SCHEMA.md` for complete Supabase schema documentation.

**Main Tables:**

- `profiles` - User accounts (coaches, parents)
- `students` - Student information
- `attendance` - Daily attendance records
- `achievements` - Tournament results
- `tournaments` - Tournament information
- `sessions` - Training schedules

## 🔧 Development

### Available Scripts

```powershell
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Adding New Features

1. Create component in `src/components/` or screen in `src/screens/`
2. Import and use design system variables
3. Connect to Supabase using the `supabase` client
4. Add real-time subscriptions if needed

### Example: Supabase Query

```javascript
import { supabase } from '../lib/supabase';

// Fetch students
const { data, error } = await supabase.from('students').select('*').order('name');
```

## 📱 Mobile Features

- Bottom navigation for easy thumb access
- Safe area support for notched phones
- Touch-optimized buttons (44px minimum)
- Smooth animations and transitions
- iOS-style blur effects

## 🚢 Deployment

### Build for Production

```powershell
npm run build
```

This creates an optimized build in the `dist/` folder.

### Deploy Options

1. **Vercel** (Recommended)
   - Connect GitHub repo
   - Auto-deploys on push
   - Add environment variables in dashboard

2. **Netlify**
   - Drag & drop `dist/` folder
   - Or connect GitHub repo

3. **Supabase Hosting**
   - Integrated with your database
   - Static site hosting included

4. **Traditional Hosting**
   - Upload `dist/` contents via FTP
   - Point domain to folder

### Environment Variables

Remember to set these in your hosting platform:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 📚 Documentation

- `DATABASE-SCHEMA.md` - Complete database schema
- `IMPLEMENTATION-STATUS.md` - Project status and roadmap
- `REDESIGN-PLAN.md` - Design system decisions
- `components/README.md` - Component library docs

## 🤝 Contributing

This is a school project. To add features:

1. Check `IMPLEMENTATION-STATUS.md` for the roadmap
2. Follow the existing design patterns
3. Use the design system variables
4. Test on mobile and desktop

## 📞 Support

- Original working app: `index.html`
- Design showcase: `design-demo.html`
- New modern app: Run `npm run dev`

## 🎯 Next Steps

The foundation is complete! To finish the app:

1. **Students Screen** - Add CRUD operations
2. **Attendance Screen** - Mark attendance UI
3. **Achievements Screen** - Tournament management
4. **Analytics Screen** - Charts and statistics
5. **Real-time Updates** - Supabase subscriptions
6. **Parent Portal** - Student-specific view
7. **QR Codes** - Quick check-in

See `IMPLEMENTATION-STATUS.md` for detailed roadmap.

## 📄 License

School project for Ananda College

---

Built with ❤️ using Vite, React, and Supabase
