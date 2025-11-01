/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '1rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			brand: {
  				primary: '#FF5722',
  				'primary-dark': '#E64A19',
  				'primary-light': '#FF7043'
  			},
  			orange: {
  				'50': '#FFF3E0',
  				'100': '#FFE0B2',
  				'200': '#FFCC80',
  				'300': '#FFB74D',
  				'400': '#FFA726',
  				'500': '#FF9800',
  				'600': '#FB8C00',
  				'700': '#F57C00',
  				'800': '#EF6C00',
  				'900': '#E65100'
  			},
  			dark: {
  				'500': '#424242',
  				'600': '#363636',
  				'700': '#2A2A2A',
  				'800': '#1E1E1E',
  				'900': '#121212'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				'50': '#eff6ff',
  				'100': '#dbeafe',
  				'200': '#bfdbfe',
  				'300': '#93c5fd',
  				'400': '#60a5fa',
  				'500': '#3b82f6',
  				'600': '#2563eb',
  				'700': '#1d4ed8',
  				'800': '#1e40af',
  				'900': '#1e3a8a',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				'50': '#faf5ff',
  				'100': '#f3e8ff',
  				'200': '#e9d5ff',
  				'300': '#d8b4fe',
  				'400': '#c084fc',
  				'500': '#a855f7',
  				'600': '#9333ea',
  				'700': '#7e22ce',
  				'800': '#6b21a8',
  				'900': '#581c87',
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				'50': '#fffbeb',
  				'100': '#fef3c7',
  				'200': '#fde68a',
  				'300': '#fcd34d',
  				'400': '#fbbf24',
  				'500': '#f59e0b',
  				'600': '#d97706',
  				'700': '#b45309',
  				'800': '#92400e',
  				'900': '#78350f',
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			success: {
  				'50': '#ecfdf5',
  				'100': '#d1fae5',
  				'200': '#a7f3d0',
  				'300': '#6ee7b7',
  				'400': '#34d399',
  				'500': '#10b981',
  				'600': '#059669',
  				'700': '#047857',
  				'800': '#065f46',
  				'900': '#064e3b',
  				DEFAULT: 'var(--color-success)',
  				foreground: 'var(--color-success-foreground)'
  			},
  			warning: {
  				DEFAULT: 'var(--color-warning)',
  				foreground: 'var(--color-warning-foreground)'
  			},
  			error: {
  				DEFAULT: 'var(--color-error)',
  				foreground: 'var(--color-error-foreground)'
  			},
  			ai: {
  				purple: '#8b5cf6',
  				blue: '#3b82f6',
  				cyan: '#06b6d4',
  				teal: '#14b8a6',
  				green: '#10b981',
  				pink: '#ec4899'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'JetBrains Mono',
  				'monospace'
  			]
  		},
  		fontSize: {
  			xs: [
  				'0.6875rem',
  				{
  					lineHeight: '0.875rem'
  				}
  			],
  			sm: [
  				'0.8125rem',
  				{
  					lineHeight: '1.125rem'
  				}
  			],
  			base: [
  				'0.9375rem',
  				{
  					lineHeight: '1.375rem'
  				}
  			],
  			lg: [
  				'1.0625rem',
  				{
  					lineHeight: '1.5rem'
  				}
  			],
  			xl: [
  				'1.1875rem',
  				{
  					lineHeight: '1.625rem'
  				}
  			],
  			'2xl': [
  				'1.375rem',
  				{
  					lineHeight: '1.75rem'
  				}
  			],
  			'3xl': [
  				'1.625rem',
  				{
  					lineHeight: '2rem'
  				}
  			],
  			'4xl': [
  				'1.875rem',
  				{
  					lineHeight: '2.25rem'
  				}
  			],
  			'5xl': [
  				'2.25rem',
  				{
  					lineHeight: '2.5rem'
  				}
  			],
  			'6xl': [
  				'2.75rem',
  				{
  					lineHeight: '1'
  				}
  			]
  		},
  		fontWeight: {
  			normal: '400',
  			medium: '500',
  			semibold: '600',
  			bold: '700'
  		},
  		boxShadow: {
  			sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  			DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  			md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  			lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  			xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  			'2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  			'3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
  			modal: '0 10px 25px rgba(0, 0, 0, 0.1)',
  			card: '0 1px 3px rgba(0, 0, 0, 0.1)',
  			'card-hover': '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
  			'glow-sm': '0 0 10px rgba(59, 130, 246, 0.3)',
  			'glow-md': '0 0 20px rgba(59, 130, 246, 0.4)',
  			'glow-lg': '0 0 30px rgba(59, 130, 246, 0.5)',
  			inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.2s ease-out',
  			'fade-out': 'fade-out 0.2s ease-out',
  			'slide-in': 'slide-in 0.3s ease-out',
  			'slide-out': 'slide-out 0.3s ease-out',
  			'bounce-in': 'bounce-in 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  			fadeIn: 'fadeIn 0.5s ease-out',
  			slideDown: 'slideDown 0.3s ease-out',
  			slideUp: 'slideUp 0.3s ease-out',
  			scaleIn: 'scaleIn 0.3s ease-out',
  			'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			glow: 'glow 2s ease-in-out infinite',
  			float: 'float 3s ease-in-out infinite',
  			'float-delayed': 'float 6s ease-in-out infinite 3s',
  			shimmer: 'shimmer 2s linear infinite',
  			gradient: 'gradient 8s ease infinite'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'fade-in': {
  				from: {
  					opacity: '0'
  				},
  				to: {
  					opacity: '1'
  				}
  			},
  			'fade-out': {
  				from: {
  					opacity: '1'
  				},
  				to: {
  					opacity: '0'
  				}
  			},
  			'slide-in': {
  				from: {
  					transform: 'translateY(-10px)',
  					opacity: '0'
  				},
  				to: {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			'slide-out': {
  				from: {
  					transform: 'translateY(0)',
  					opacity: '1'
  				},
  				to: {
  					transform: 'translateY(-10px)',
  					opacity: '0'
  				}
  			},
  			'bounce-in': {
  				'0%': {
  					transform: 'scale(0.3)',
  					opacity: '0'
  				},
  				'50%': {
  					transform: 'scale(1.05)'
  				},
  				'70%': {
  					transform: 'scale(0.9)'
  				},
  				'100%': {
  					transform: 'scale(1)',
  					opacity: '1'
  				}
  			},
  			fadeIn: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			slideDown: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(-10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			slideUp: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			scaleIn: {
  				'0%': {
  					opacity: '0',
  					transform: 'scale(0.9)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			glow: {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0.5'
  				}
  			},
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-10px)'
  				}
  			},
  			shimmer: {
  				'0%': {
  					backgroundPosition: '-1000px 0'
  				},
  				'100%': {
  					backgroundPosition: '1000px 0'
  				}
  			},
  			gradient: {
  				'0%, 100%': {
  					backgroundPosition: '0% 50%'
  				},
  				'50%': {
  					backgroundPosition: '100% 50%'
  				}
  			}
  		},
  		transitionTimingFunction: {
  			bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  		},
  		spacing: {
  			'18': '4.5rem',
  			'88': '22rem',
  			'128': '32rem'
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
  			'gradient-ai': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  			'gradient-ai-alt': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  			'gradient-neural': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  			'gradient-cyber': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  			shimmer: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
  		}
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}