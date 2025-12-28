import type { Config } from "tailwindcss";
import safeAreaPlugin from './tailwind-safe-area-plugin';

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		screens: {
			'xs': '375px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
			'mobile': {'max': '639px'},
			'tablet': {'min': '640px', 'max': '1023px'},
			'ipad': {'min': '768px', 'max': '1024px'},
			'desktop': {'min': '1024px'},
			'touch': {'raw': '(hover: none) and (pointer: coarse)'},
			'no-touch': {'raw': '(hover: hover) and (pointer: fine)'},
		},
    extend: {
      fontFamily: {
        sans: ['Assistant', 'Rubik', 'system-ui', 'sans-serif'],
        hebrew: ['Rubik', 'Assistant', 'Arial', 'sans-serif'],
        assistant: ['Assistant', 'Arial', 'sans-serif'],
        rubik: ['Rubik', 'Arial', 'sans-serif'],
      },
      colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
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
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				button: {
					primary: 'hsl(var(--button-primary))',
					'primary-hover': 'hsl(var(--button-primary-hover))',
					'primary-foreground': 'hsl(var(--button-primary-foreground))',
					secondary: 'hsl(var(--button-secondary))',
					'secondary-hover': 'hsl(var(--button-secondary-hover))',
					'secondary-foreground': 'hsl(var(--button-secondary-foreground))'
				},
				highlight: {
					DEFAULT: 'hsl(var(--highlight))',
					foreground: 'hsl(var(--highlight-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				}
			},
			spacing: {
				'safe-top': 'env(safe-area-inset-top)',
				'safe-bottom': 'env(safe-area-inset-bottom)',
				'safe-left': 'env(safe-area-inset-left)',
				'safe-right': 'env(safe-area-inset-right)',
				'18': '4.5rem',
				'88': '22rem',
				'104': '26rem',
				'112': '28rem',
				'128': '32rem',
			},
			fontSize: {
				'2xs': ['0.625rem', '0.75rem'],
				'mobile-xs': ['0.75rem', '1rem'],
				'mobile-sm': ['0.875rem', '1.25rem'],
				'mobile-base': ['1rem', '1.5rem'],
				'h1': ['4rem', '1.1'],
				'h2': ['3rem', '1.15'],
				'h3': ['2rem', '1.25'],
				'h4': ['1.5rem', '1.3'],
				'body': ['1.125rem', '1.6'],
				'body-sm': ['1rem', '1.5'],
				'caption': ['0.875rem', '1.4'],
				'label': ['0.875rem', '1.4'],
				'button': ['1rem', '1.25'],
				'button-lg': ['1.125rem', '1.25'],
				'nav': ['0.9375rem', '1.3'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'4xl': '2rem',
			},
			minHeight: {
				'touch': '44px',
				'button': '48px',
				'input': '52px',
			},
			minWidth: {
				'touch': '44px',
				'button': '88px',
			},
			maxWidth: {
				'mobile': '428px',
				'tablet': '768px',
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fadeIn 0.3s ease-out',
				'slide-up': 'slideUp 0.3s ease-out',
				'bounce-gentle': 'bounceGentle 0.6s ease-out',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fadeIn': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slideUp': {
					'0%': { transform: 'translateY(100%)' },
					'100%': { transform: 'translateY(0)' }
				},
				'bounceGentle': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'50%': { transform: 'scale(1.02)' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				}
			},
			boxShadow: {
				'mobile': '0 2px 8px -2px rgba(0, 0, 0, 0.1)',
				'mobile-lg': '0 4px 16px -4px rgba(0, 0, 0, 0.1)',
				'premium': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
				'premium-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				'premium-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
			},
			backdropBlur: {
				'xs': '2px',
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		safeAreaPlugin,
		function({ addUtilities, theme, addComponents }: any) {
			addUtilities({
				'.scrollbar-hide': {
					'-ms-overflow-style': 'none',
					'scrollbar-width': 'none',
					'&::-webkit-scrollbar': { display: 'none' }
				},
				'.tap-highlight-transparent': {
					'-webkit-tap-highlight-color': 'transparent'
				}
			})
			addComponents({
				'.mobile-container': {
					width: '100%',
					maxWidth: theme('maxWidth.mobile'),
					marginLeft: 'auto',
					marginRight: 'auto',
					paddingLeft: theme('spacing.4'),
					paddingRight: theme('spacing.4'),
				}
			})
		}
	],
} satisfies Config;