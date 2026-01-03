# Studify Frontend - Admin Dashboard

Modern React admin dashboard for Studify platform with Tailwind CSS, animations, and responsive design.

## Features

- 🎨 Modern UI with Tailwind CSS
- 📱 Fully Responsive Design
- 🎭 Smooth Animations with Framer Motion
- 📊 Interactive Charts with Recharts
- 🔔 Toast Notifications (react-hot-toast)
- 🔐 Authentication & Authorization
- 📈 Dashboard with Real-time Statistics
- 🎯 Clean Code Architecture

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The app will run on `http://localhost:5173`

## Build

```bash
npm run build
```

## Environment Variables

Create a `.env` file:

```
VITE_API_URL=http://localhost:6000/api
```

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   ├── pages/           # Page components
│   ├── layouts/         # Layout components
│   ├── context/         # React Context
│   ├── config/          # Configuration files
│   └── App.jsx          # Main app component
├── public/
└── package.json
```

## Pages

- **Dashboard** - Statistics and charts
- **Books** - Book management
- **Products** - Product management
- **Orders** - Order management
- **Users** - User management
- **Approvals** - Pending approvals (Doctors & Books)
- **Settings** - Account settings

## Technologies Used

- React 19
- React Router DOM
- Tailwind CSS
- Framer Motion
- Recharts
- Axios
- React Hot Toast
- Lucide React Icons