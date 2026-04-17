/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
      /* 0px border-radius — Industrial Toggle per DESIGN.md */
  		borderRadius: {
  			lg: '0px',
  			md: '0px',
  			sm: '0px'
  		},
      /* Typography — The Scholar's Contrast */
      fontFamily: {
        newsreader: ['Newsreader', 'Georgia', 'serif'],
        manrope: ['Manrope', 'system-ui', 'sans-serif'],
        space: ['Space Grotesk', 'monospace'],
      },
      /* Surface hierarchy colors */
      surface: {
        base: 'var(--surface-base)',
        'container-lowest': 'var(--surface-container-lowest)',
        'container-low': 'var(--surface-container-low)',
        DEFAULT: 'var(--surface-container)',
        'container-high': 'var(--surface-container-high)',
        'container-highest': 'var(--surface-container-highest)',
      },
      /* Extended palette */
      ivory: {
        DEFAULT: 'var(--ivory)',
        muted: 'var(--ivory-muted)',
        subtle: 'var(--ivory-subtle)',
      },
      gold: 'var(--gold)',
      crimson: 'var(--crimson)',
      bronze: 'var(--bronze)',
      /* D3 edge colors */
      edge: {
        literary: 'var(--edge-literary)',
        theme: 'var(--edge-theme)',
        crossgame: 'var(--edge-crossgame)',
        group: 'var(--edge-group)'
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
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
