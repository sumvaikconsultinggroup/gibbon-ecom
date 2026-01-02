{
  "brand": {
    "name": "Gibbon Nutrition",
    "attributes": ["performance-driven", "trustworthy", "laboratory-grade", "bold", "athletic"],
    "voice_tone": "Confident, concise, motivating. Replace marketing fluff with measurable benefits and proof (badges, ratings, certifications)."
  },
  "typography": {
    "font_pairing": {
      "heading": "Space Grotesk",
      "body": "Inter"
    },
    "import": {
      "google_fonts": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap",
      "setup": "Add <link> to app/(shop)/(home)/layout.js <head>. Then in globals: :root { --font-heading:'Space Grotesk',ui-sans-serif; --font-body:'Inter',ui-sans-serif; }"
    },
    "scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight",
      "h2": "text-base sm:text-lg font-bold tracking-tight",
      "body": "text-base sm:text-sm leading-relaxed",
      "small": "text-sm",
      "caps": "uppercase tracking-wider"
    },
    "utility_classes": {
      "heading_class": "font-[family-name:var(--font-heading)]",
      "body_class": "font-[family-name:var(--font-body)]"
    }
  },
  "palette": {
    "brand": {
      "primary": "#1B198F",
      "primary_dark": "#11144F",
      "accent_cyan": "#12C6FF",
      "accent_amber": "#FFC857",
      "accent_emerald": "#2ECC71",
      "neutral_950": "#0A0A0B",
      "neutral_900": "#111827",
      "neutral_100": "#F5F7FB",
      "white": "#FFFFFF"
    },
    "semantic": {
      "bg": "#FFFFFF",
      "bg_muted": "#F7F7FB",
      "surface": "#FFFFFF",
      "surface_dark": "#0E0F14",
      "text": "#0E1116",
      "text_muted": "#5B6270",
      "border": "#E6E8EE",
      "success": "#22C55E",
      "warning": "#F59E0B",
      "danger": "#EF4444",
      "info": "#0EA5E9"
    },
    "css_tokens": ":root{ --color-primary:#1B198F; --color-primary-contrast:#FFFFFF; --color-accent-cyan:#12C6FF; --color-accent-amber:#FFC857; --color-accent-emerald:#2ECC71; --color-bg:#FFFFFF; --color-bg-muted:#F7F7FB; --color-surface:#FFFFFF; --color-surface-dark:#0E0F14; --color-text:#0E1116; --color-text-muted:#5B6270; --color-border:#E6E8EE; --color-success:#22C55E; --color-warning:#F59E0B; --color-danger:#EF4444; --radius-sm:6px; --radius-md:10px; --radius-lg:16px; --shadow-sm:0 2px 10px rgba(0,0,0,.06); --shadow-md:0 8px 30px rgba(0,0,0,.08); --shadow-lg:0 16px 60px rgba(0,0,0,.10); --easing-standard:cubic-bezier(.2,.8,.2,1); --duration-fast:150ms; --duration-med:250ms; --duration-slow:450ms; }"
  },
  "gradients_and_textures": {
    "restriction_rule": "Gradients must remain mild and never exceed 20% viewport coverage. Avoid dark/saturated pairs (e.g., purple/pink, blue→purple, green→blue, red→pink). No gradients on dense text blocks or small UI elements.",
    "allowed_section_backgrounds": [
      "linear-gradient(90deg, rgba(18,198,255,0.12), rgba(27,25,143,0.10))",
      "radial-gradient(1200px 600px at 20% -10%, rgba(27,25,143,0.18), transparent)",
      "linear-gradient(180deg, rgba(255,200,87,0.16), transparent)"
    ],
    "decorative_overlays": [
      "subtle CSS noise at 3% opacity",
      "1px grid-lines using repeating-linear-gradient with 2% opacity"
    ],
    "enforcement": "If a gradient harms readability or exceeds the limit, fall back to solid surface colors (white or neutral-50/100)."
  },
  "layout": {
    "container": "w-full max-w-[1280px] mx-auto px-5 sm:px-8",
    "grid": {
      "mobile_first": true,
      "columns": {
        "sm": 6,
        "md": 8,
        "lg": 12
      },
      "section_stack": [
        "TopBanner → Header → Hero → Marquee → Categories (3x2) → Featured Products Carousel → Promo Duo Banners → Why Gibbon (Stats+Features) → Video Reels → Testimonials → Newsletter → FAQ → Instagram Grid → Footer"
      ]
    },
    "spacing": {
      "section_y": "py-16 sm:py-20 lg:py-28",
      "block_gap": "gap-6 sm:gap-8 lg:gap-10",
      "principle": "Use 2–3x more whitespace than default. Separate sections with generous vertical rhythm and clear borders on dark surfaces."
    },
    "navigation": {
      "mobile_bottom_bar": true,
      "sticky_header": true,
      "search_quick": true
    }
  },
  "motion": {
    "library": "framer-motion",
    "defaults": {
      "ease": "var(--easing-standard)",
      "duration": "var(--duration-med)",
      "spring": { "type": "spring", "stiffness": 300, "damping": 30, "mass": 0.8 }
    },
    "entrances": [
      "fade-up for section headings (y: 20, opacity: 0 → 1)",
      "scale+fade for cards on hover",
      "parallax y transforms for hero background"
    ],
    "micro_interactions": [
      "Buttons: color + shadow shift on hover, press scale 0.98",
      "Quick Add to Cart: fly-to-cart animation with confetti + toast",
      "Carousel arrows: slight rotate on hover, disabled state with reduced opacity"
    ],
    "rules": [
      "Do not use transition: all. Only transition color, background-color, opacity, box-shadow, and transform when needed.",
      "Respect reduced motion: prefers-reduced-motion => disable parallax and long transitions"
    ]
  },
  "components": {
    "buttons": {
      "style": "Professional/Corporate",
      "tokens": {
        "--btn-radius": "12px",
        "--btn-shadow": "var(--shadow-md)",
        "--btn-padding": "0.9rem 1.25rem"
      },
      "variants": {
        "primary": "bg-[var(--color-primary)] text-white hover:bg-[#17167A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]",
        "secondary": "bg-white text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-bg-muted)]",
        "ghost": "bg-transparent text-[var(--color-text)] hover:bg-black/5"
      },
      "sizes": {
        "sm": "h-9 px-3 text-sm",
        "md": "h-11 px-5 text-sm",
        "lg": "h-12 px-7 text-base"
      },
      "testid_rule": "Every button must include data-testid named by role and action, e.g., data-testid=\"hero-primary-cta-button\""
    },
    "cards": {
      "base": "rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm hover:shadow-md transition-[box-shadow,transform] duration-200",
      "dark_surface": "bg-[var(--color-surface-dark)] text-white border-white/10"
    },
    "badges": {
      "solid": "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-[var(--color-primary)] text-white",
      "soft": "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
    },
    "inputs": {
      "base": "h-11 rounded-full bg-white border border-[var(--color-border)] px-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
    },
    "carousel": {
      "notes": "Use Embla or existing horizontal scroll. Ensure drag, snap, and arrow buttons with data-testid attributes.",
      "arrow": "rounded-full border bg-white text-neutral-700 hover:bg-[var(--color-primary)] hover:text-white transition-colors"
    },
    "accordion": {
      "base": "rounded-xl border bg-white data-[open=true]:shadow-md",
      "item": "p-5 text-left flex items-center justify-between"
    },
    "toast": {
      "lib": "sonner",
      "usage": "import { toast } from 'sonner'; toast.success('Added to cart');"
    }
  },
  "component_path": {
    "note": "Create shadcn-style primitives as .js under components/ui. Avoid HTML-only widgets.",
    "paths": {
      "Button": "/app/src/components/ui/button.js",
      "Badge": "/app/src/components/ui/badge.js",
      "Card": "/app/src/components/ui/card.js",
      "Carousel": "/app/src/components/ui/carousel.js",
      "Accordion": "/app/src/components/ui/accordion.js",
      "Dialog": "/app/src/components/ui/dialog.js",
      "Sheet": "/app/src/components/ui/sheet.js",
      "Tabs": "/app/src/components/ui/tabs.js",
      "Tooltip": "/app/src/components/ui/tooltip.js",
      "ToastProvider": "/app/src/components/ui/sonner.js"
    }
  },
  "refactors_for_existing_homepage": [
    {
      "file": "/app/src/components/homepage/HeroSection.tsx",
      "changes": [
        "Add data-testid to CTAs and indicators: data-testid=\"hero-primary-cta-button\", data-testid=\"hero-watch-story-button\", data-testid=\"hero-slide-indicator-{index}\"",
        "Ensure gradient overlays stay mild: reduce from-black/80 overlay to from-black/60; keep gradient coverage under 20% viewport",
        "Right-side glow: swap any purple tints to cyan/amber variants per restriction",
        "Modal close button: add aria-label=\"Close video\" and data-testid=\"hero-video-close-button\""
      ]
    },
    {
      "file": "/app/src/components/homepage/MarqueeBanner.tsx",
      "changes": [
        "Replace ★ character with <Star /> icon from lucide-react for consistency",
        "Add role=\"marquee\" aria-label=\"trust-points\" and data-testid=\"marquee-banner\""
      ]
    },
    {
      "file": "/app/src/components/homepage/CategoryShowcase.tsx",
      "changes": [
        "Replace disallowed gradient pairs: from-purple-600 to-pink-500 → from-cyan-500 to-sky-500; from-indigo-600 to-violet-500 → from-emerald-600 to-teal-500",
        "Each <Link> wrapper: add data-testid=\"category-card-{slug}-link\" and alt text is already present",
        "Hover border effect should transition only border-color and opacity, not all"
      ]
    },
    {
      "file": "/app/src/components/homepage/FeaturedProducts.tsx",
      "changes": [
        "Add data-testid to quick actions: quick-add-button, wishlist-button, quick-view-link, product-card-{id}",
        "Quick Add: trigger toast + fly-to-cart animation (see code_recipes)",
        "Ensure arrow buttons include aria-label and data-testid"
      ]
    },
    {
      "file": "/app/src/components/homepage/PromoBanners.tsx",
      "changes": [
        "Replace from-purple-600 to-pink-600 with from-cyan-500 to-sky-500 (or amber to orange pair) to respect gradient rule",
        "Add data-testid=\"promo-banner-{id}\" on Link"
      ]
    },
    {
      "file": "/app/src/components/homepage/WhyGibbon.tsx",
      "changes": [
        "Swap purple glow to cyan/amber overlay per restriction",
        "Add data-testid=\"why-gibbon-feature-{index}\" on feature cards and data-testid=\"why-gibbon-stat-{index}\" on counters"
      ]
    },
    {
      "file": "/app/src/components/homepage/VideoReels.tsx",
      "changes": [
        "Replace emoji labels (👁, ❤️) with lucide-react icons Eye, Heart",
        "Buttons need data-testid: reel-play-toggle-{id}, reel-mute-toggle-{id}, reels-arrow-left/right",
        "Respect prefers-reduced-motion: pause auto progress bar when reduced"
      ]
    },
    {
      "file": "/app/src/components/homepage/Testimonials.tsx",
      "changes": [
        "Add data-testid=\"testimonial-card-{id}\" to each card and to nav arrows",
        "Replace any emoji like 📸 with lucide Camera icon"
      ]
    },
    {
      "file": "/app/src/components/homepage/Newsletter.tsx",
      "changes": [
        "Input + button: add data-testid=\"newsletter-email-input\" and data-testid=\"newsletter-submit-button\"",
        "On success, render confirmation with data-testid=\"newsletter-success\""
      ]
    },
    {
      "file": "/app/src/components/homepage/FAQ.tsx",
      "changes": [
        "Accordion buttons: add aria-controls and id linkage; add data-testid=\"faq-accordion-item-{index}\"",
        "Category chips: add role=\"tab\" and data-testid=\"faq-category-{name}\""
      ]
    },
    {
      "file": "/app/src/components/homepage/InstagramFeed.tsx",
      "changes": [
        "Each tile link: add data-testid=\"ig-post-{id}\" and aria-label with likes count"
      ]
    }
  ],
  "images_urls": [
    {"category": "hero-alt", "description": "Moody athlete portrait (studio, black background)", "url": "https://images.unsplash.com/photo-1633106485777-eaa336fb40df?crop=entropy&cs=srgb&fm=jpg&q=85"},
    {"category": "story-section", "description": "Training moment in gym (dark cinematic)", "url": "https://images.unsplash.com/photo-1700784795176-7ff886439d79?crop=entropy&cs=srgb&fm=jpg&q=85"},
    {"category": "testimonial-breaker", "description": "Black and white determined athlete (female)", "url": "https://images.unsplash.com/photo-1731512589836-bd662292768a?crop=entropy&cs=srgb&fm=jpg&q=85"}
  ],
  "libraries_and_setup": {
    "install": [
      "pnpm add framer-motion sonner embla-carousel-react class-variance-authority tailwind-merge",
      "pnpm add lucide-react"
    ],
    "usage_notes": [
      "Enable Sonner provider once at root and use toast for cart actions",
      "Use Embla for carousels where scroll snapping is insufficient"
    ]
  },
  "code_recipes": [
    {
      "title": "Fly-to-cart + toast (JS)",
      "snippet": "// components/animations/flyToCart.js\nexport function flyToCart(sourceEl, cartIconEl){\n  if(!sourceEl || !cartIconEl) return;\n  const src = sourceEl.getBoundingClientRect();\n  const dst = cartIconEl.getBoundingClientRect();\n  const ghost = sourceEl.cloneNode(true);\n  Object.assign(ghost.style,{ position:'fixed', left:src.left+'px', top:src.top+'px', width:src.width+'px', height:src.height+'px', pointerEvents:'none', zIndex:9999, transform:'scale(.8)', borderRadius:'12px'});\n  document.body.appendChild(ghost);\n  ghost.animate([{ transform:'translate(0,0) scale(.8)', opacity:1 },{ transform:`translate(${dst.left-src.left}px,${dst.top-src.top}px) scale(.3)`, opacity:.2 }], { duration:450, easing:'cubic-bezier(.2,.8,.2,1)' }).onfinish=()=> ghost.remove();\n}\n"
    },
    {
      "title": "Button primitive (components/ui/button.js)",
      "snippet": "import React from 'react';\nexport const Button = ({ as:Tag='button', variant='primary', size='md', className='', children, ...props }) => {\n  const base='inline-flex items-center justify-center font-semibold rounded-[12px] transition-colors disabled:opacity-60 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';\n  const variants={ primary:'bg-[var(--color-primary)] text-white hover:bg-[#17167A]', secondary:'bg-white border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-muted)]', ghost:'bg-transparent hover:bg-black/5' };\n  const sizes={ sm:'h-9 px-3 text-sm', md:'h-11 px-5 text-sm', lg:'h-12 px-7 text-base' };\n  return <Tag data-testid={props['data-testid']} className={[base,variants[variant],sizes[size],className].join(' ')} {...props}>{children}</Tag>;\n};\n"
    },
    {
      "title": "Accordion primitive (components/ui/accordion.js)",
      "snippet": "import React, { useState } from 'react';\nexport const Accordion = ({ items=[] }) => {\n  const [open,setOpen]=useState(null);\n  return (<div>{items.map((it,idx)=> (\n    <div key={idx} className=\"rounded-xl border border-[var(--color-border)] bg-white mb-3\">\n      <button data-testid={\`accordion-item-\${idx}\`} aria-expanded={open===idx} aria-controls={\`acc-panel-\${idx}\`} onClick={()=> setOpen(open===idx?null:idx)} className=\"w-full text-left p-5 flex items-center justify-between\">\n        <span className=\"font-semibold\">{it.question}</span>\n        <span className=\"i-lucide-chevron-down\"/>\n      </button>\n      {open===idx && <div id={\`acc-panel-\${idx}\`} className=\"border-t p-5 text-sm text-neutral-600\">{it.answer}</div>}\n    </div>))}</div>);\n};\n"
    },
    {
      "title": "Marquee (accessibility)",
      "snippet": "// Add role to marquee container\n<div role=\"marquee\" aria-label=\"trust-points\" data-testid=\"marquee-banner\">...</div>\n"
    }
  ],
  "accessibility_and_testing": {
    "contrast": "Minimum WCAG AA. Primary text on brand blue must be white or near-white.",
    "focus": "Use :focus-visible rings; never remove outlines.",
    "aria": "Label landmark regions and complex widgets (carousels, accordions).",
    "data_testid": {
      "format": "kebab-case by role and action (e.g., product-card-<id>, hero-primary-cta-button)",
      "coverage": "Buttons, links, inputs, menus, toggles, carousels, toasts, and all error/success messages"
    }
  },
  "instructions_to_main_agent": [
    "Inject Google Fonts and setup CSS tokens (see typography.import and palette.css_tokens).",
    "Create shadcn-style primitives in /app/src/components/ui/*.js for Button, Badge, Card, Accordion, Dialog, Sheet, Tabs, Tooltip, Carousel, ToastProvider.",
    "Refactor the listed homepage files to add data-testid attributes and replace disallowed gradients and emoji icons.",
    "Implement fly-to-cart animation and toast on Quick Add (FeaturedProducts).",
    "Ensure gradients remain decorative only and under 20% viewport; fallback to solids when in doubt.",
    "Verify dark mode backgrounds use solid colors; do not place gradients behind long-form text.",
    "Run ESLint after edits and verify no universal transition is used."
  ],
  "general_ui_ux_design_guidelines_raw": "- You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals."
}
