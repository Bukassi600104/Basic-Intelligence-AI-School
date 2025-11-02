# Basic Intelligence Community (BIC) School Platform

A modern React + Supabase educational platform for AI learning community management, course delivery, subscription management, and automated email workflows.

## 🚀 Key Features

- **React 18 + Vite** - Modern frontend with optimized build and code-splitting (85% bundle reduction)
- **Supabase Backend** - PostgreSQL with Row Level Security (RLS) and automated triggers
- **Role-Based Access** - Admin and student roles with tier-based content access (Starter/Pro/Elite)
- **Email Automation** - 5 database triggers for automated email workflows (8 total scenarios)
- **Content Management** - Video, PDF, documents, and images with tier-based access
- **Course System** - Structured learning paths with instructor assignments and enrollment tracking
- **Subscription Management** - Plan system (₦5k/₦15k/₦25k/month) with renewal workflow
- **Admin Dashboard** - User management, content library, course administration, notifications
- **Student Dashboard** - Learning content, subscriptions, progress tracking
- **Notification System** - Email + WhatsApp delivery with template support
- **TailwindCSS 3.4** - Custom design tokens and AI-gradient utilities
- **Data Visualization** - Recharts and D3.js for analytics
- **Form Management** - React Hook Form for efficient form handling

## 📋 Prerequisites

- Node.js (v16.x or higher)
- npm (v7+) or yarn
- Supabase account (for database backend)
- Resend API key (for email delivery)

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Bukassi600104/Basic-Intelligence-AI-School.git
   cd Basic-Intelligence-AI-School
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Fill in the following variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   VITE_RESEND_API_KEY=your_resend_api_key
   ```

4. **Start development server**:
   ```bash
   npm run dev
   # Server starts on http://localhost:4028
   ```

5. **Build for production**:
   ```bash
   npm run build
   # Output in dist/ folder
   ```

## 📁 Project Structure

```
react_app/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── styles/         # Global styles and Tailwind configuration
│   ├── App.jsx         # Main application component
│   ├── Routes.jsx      # Application routes
│   └── index.jsx       # Application entry point
├── .env                # Environment variables
├── index.html          # HTML template
├── package.json        # Project dependencies and scripts
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.js      # Vite configuration
```

## 🧩 Adding Routes

To add new routes to the application, update the `Routes.jsx` file:

```jsx
import { useRoutes } from "react-router-dom";
import HomePage from "pages/HomePage";
import AboutPage from "pages/AboutPage";

const ProjectRoutes = () => {
  let element = useRoutes([
    { path: "/", element: <HomePage /> },
    { path: "/about", element: <AboutPage /> },
    // Add more routes as needed
  ]);

  return element;
};
```

## 🎨 Styling

This project uses Tailwind CSS for styling. The configuration includes:

- Forms plugin for form styling
- Typography plugin for text styling
- Aspect ratio plugin for responsive elements
- Container queries for component-specific responsive design
- Fluid typography for responsive text
- Animation utilities

## 📱 Responsive Design

The app is built with responsive design using Tailwind CSS breakpoints.


## 📦 Deployment

Build the application for production:

```bash
npm run build
```

## 🙏 Acknowledgments

- Built with [Rocket.new](https://rocket.new)
- Powered by React and Vite
- Styled with Tailwind CSS

Built with ❤️ on Rocket.new
