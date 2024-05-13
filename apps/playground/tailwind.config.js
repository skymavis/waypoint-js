/** @type {import('tailwindcss').Config} */

const commonColorConfig = {
  inherit: "inherit",
  current: "currentColor",
  transparent: "transparent",
}

const toDsCssVar = v => `var(--dg-${v})`

const roninThemeBg = {
  // background
  "tc-bg": toDsCssVar("tc-bg"),
  // surface
  "tc-sf": toDsCssVar("tc-sf"),
  "tc-sf-dim": toDsCssVar("tc-sf-dim"),
  "tc-sf-critical": toDsCssVar("tc-sf-critical"),
  "tc-sf-critical-dim": toDsCssVar("tc-sf-critical-dim"),
  "tc-sf-warning": toDsCssVar("tc-sf-warning"),
  "tc-sf-warning-dim": toDsCssVar("tc-sf-warning-dim"),
  "tc-sf-success": toDsCssVar("tc-sf-success"),
  "tc-sf-success-dim": toDsCssVar("tc-sf-success-dim"),
  "tc-sf-highlight": toDsCssVar("tc-sf-highlight"),
  "tc-sf-highlight-dim": toDsCssVar("tc-sf-highlight-dim"),
  // skeleton
  "tc-sf-skeleton": toDsCssVar("tc-sf-skeleton"),
}

const roninThemeInteraction = {
  // interaction - primary
  "tc-itr-primary": toDsCssVar("tc-itr-primary"),
  "tc-itr-primary-hovered": toDsCssVar("tc-itr-primary-hovered"),
  "tc-itr-primary-pressed": toDsCssVar("tc-itr-primary-pressed"),
  "tc-itr-primary-disabled": toDsCssVar("tc-itr-primary-disabled"),
  // interaction - secondary
  "tc-itr-secondary": toDsCssVar("tc-itr-secondary"),
  "tc-itr-secondary-hovered": toDsCssVar("tc-itr-secondary-hovered"),
  "tc-itr-secondary-pressed": toDsCssVar("tc-itr-secondary-pressed"),
  "tc-itr-secondary-disabled": toDsCssVar("tc-itr-secondary-disabled"),
  // interaction - critical
  "tc-itr-critical": toDsCssVar("tc-itr-critical"),
  "tc-itr-critical-hovered": toDsCssVar("tc-itr-critical-hovered"),
  "tc-itr-critical-pressed": toDsCssVar("tc-itr-critical-pressed"),
  "tc-itr-critical-disabled": toDsCssVar("tc-itr-critical-disabled"),
  // interaction - success
  "tc-itr-success": toDsCssVar("tc-itr-success"),
  "tc-itr-success-hovered": toDsCssVar("tc-itr-success-hovered"),
  "tc-itr-success-pressed": toDsCssVar("tc-itr-success-pressed"),
  "tc-itr-success-disabled": toDsCssVar("tc-itr-success-disabled"),
  // interaction - plain
  "tc-itr-plain-hovered": toDsCssVar("tc-itr-plain-hovered"),
  "tc-itr-plain-pressed": toDsCssVar("tc-itr-plain-pressed"),
  "tc-itr-plain-critical-hovered": toDsCssVar("tc-itr-plain-critical-hovered"),
  "tc-itr-plain-critical-pressed": toDsCssVar("tc-itr-plain-critical-pressed"),
}

const roninThemeBorder = {
  "tc-border": toDsCssVar("tc-border"),
  "tc-border-dim": toDsCssVar("tc-border-dim"),
  "tc-border-critical": toDsCssVar("tc-border-critical"),
  "tc-border-critical-dim": toDsCssVar("tc-border-critical-dim"),
  "tc-border-warning": toDsCssVar("tc-border-warning"),
  "tc-border-warning-dim": toDsCssVar("tc-border-warning-dim"),
  "tc-border-success": toDsCssVar("tc-border-success"),
  "tc-border-success-dim": toDsCssVar("tc-border-success-dim"),
  "tc-border-highlight": toDsCssVar("tc-border-highlight"),
  "tc-border-highlight-dim": toDsCssVar("tc-border-highlight-dim"),
  // interaction
  "tc-itr-border": toDsCssVar("tc-itr-border"),
  "tc-itr-border-hovered": toDsCssVar("tc-itr-border-hovered"),
  "tc-itr-border-pressed": toDsCssVar("tc-itr-border-pressed"),
  "tc-itr-border-error": toDsCssVar("tc-itr-border-error"),
  "tc-itr-border-disabled": toDsCssVar("tc-itr-border-disabled"),
  "tc-itr-border-outline": toDsCssVar("tc-itr-border-outline"),
}

const roninThemeText = {
  // text
  "tc-text": toDsCssVar("tc-text"),
  "tc-text-dim": toDsCssVar("tc-text-dim"),
  "tc-text-hovered": toDsCssVar("tc-text-hovered"),
  "tc-text-disabled": toDsCssVar("tc-text-disabled"),
  "tc-text-critical": toDsCssVar("tc-text-critical"),
  "tc-text-warning": toDsCssVar("tc-text-warning"),
  "tc-text-success": toDsCssVar("tc-text-success"),
  "tc-text-highlight": toDsCssVar("tc-text-highlight"),
  "tc-text-on-primary": toDsCssVar("tc-text-on-primary"),
  "tc-text-on-secondary": toDsCssVar("tc-text-on-secondary"),
  "tc-text-on-critical": toDsCssVar("tc-text-on-critical"),
  // interaction - link
  "tc-itr-link": toDsCssVar("tc-itr-link"),
  "tc-itr-link-hovered": toDsCssVar("tc-itr-link-hovered"),
  "tc-itr-link-pressed": toDsCssVar("tc-itr-link-pressed"),
  "tc-itr-link-disabled": toDsCssVar("tc-itr-link-disabled"),
  // interaction - link mono
  "tc-itr-link-mono": toDsCssVar("tc-itr-link-mono"),
  "tc-itr-link-mono-dim": toDsCssVar("tc-itr-link-mono-dim"),
  "tc-itr-link-mono-hovered": toDsCssVar("tc-itr-link-mono-hovered"),
  "tc-itr-link-mono-pressed": toDsCssVar("tc-itr-link-mono-pressed"),
  "tc-itr-link-mono-disabled": toDsCssVar("tc-itr-link-mono-disabled"),
}

const roninThemeIcon = {
  // icon
  "tc-icon": toDsCssVar("tc-icon"),
  "tc-icon-dim": toDsCssVar("tc-icon-dim"),
  "tc-icon-critical": toDsCssVar("tc-icon-critical"),
  "tc-icon-warning": toDsCssVar("tc-icon-warning"),
  "tc-icon-success": toDsCssVar("tc-icon-success"),
  "tc-icon-highlight": toDsCssVar("tc-icon-highlight"),
  "tc-icon-on-primary": toDsCssVar("tc-icon-on-primary"),
  "tc-icon-on-secondary": toDsCssVar("tc-icon-on-secondary"),
  "tc-icon-on-critical": toDsCssVar("tc-icon-on-critical"),
  // interaction - icon
  "tc-itr-icon-critical": toDsCssVar("tc-itr-icon-critical"),
  "tc-itr-icon-hovered": toDsCssVar("tc-itr-icon-hovered"),
  "tc-itr-icon-pressed": toDsCssVar("tc-itr-icon-pressed"),
  "tc-itr-icon-disabled": toDsCssVar("tc-itr-icon-disabled"),
}

const roninDecor = {
  "decor-blue-light": toDsCssVar("decor-blue-light"),
  "decor-blue-medium": toDsCssVar("decor-blue-medium"),
  "decor-blue-dark": toDsCssVar("decor-blue-dark"),
  "decor-orange-light": toDsCssVar("decor-orange-light"),
  "decor-orange-medium": toDsCssVar("decor-orange-medium"),
  "decor-orange-dark": toDsCssVar("decor-orange-dark"),
  "decor-cyan-light": toDsCssVar("decor-cyan-light"),
  "decor-cyan-medium": toDsCssVar("decor-cyan-medium"),
  "decor-cyan-dark": toDsCssVar("decor-cyan-dark"),
  "decor-red": toDsCssVar("decor-red"),
}

module.exports = {
  mode: "jit",
  content: ["./src/app/**/*.{ts,jsx,tsx}", "./src/components/**/*.{ts,jsx,tsx}"],
  corePlugins: {
    preflight: false,
  },
  theme: {
    // Optimized
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px",
    },
    zIndex: {
      "negative-bg": toDsCssVar("z-negative-bg"),
      sticky: toDsCssVar("z-sticky"),
      fixed: toDsCssVar("z-fixed"),
      "dialog-backdrop": toDsCssVar("z-dialog-backdrop"),
      offcanvas: toDsCssVar("z-offcanvas"),
      dialog: toDsCssVar("z-dialog"),
      popover: toDsCssVar("z-popover"),
      tooltip: toDsCssVar("z-tooltip"),
      top: toDsCssVar("z-top"),
    },
    backgroundColor: {
      ...commonColorConfig,
      ...roninThemeBg,
      ...roninThemeInteraction,
      ...roninDecor,
    },
    borderColor: {
      ...commonColorConfig,
      ...roninThemeBorder,
    },
    textColor: {
      ...commonColorConfig,
      ...roninThemeText,
      ...roninThemeIcon,
    },
    fontFamily: {
      sans: toDsCssVar("font-family"),
      mono: toDsCssVar("font-family-mono"),
    },

    // TODO: Need optimization
    spacing: {
      0: "0px",
      1: "1px",
      4: "4px",
      8: "8px",
      12: "12px",
      16: "16px",
      20: "20px",
      24: "24px",
      28: "28px",
      32: "32px",
      36: "36px",
      40: "40px",
      44: "44px",
      48: "48px",
    },
    borderRadius: {
      none: "0px",
      x: "8px",
      "2x": "16px",
      full: "9999px",
    },
    boxShadow: {
      none: "none",
      "divider-right": toDsCssVar("divider-right"),
      popover: toDsCssVar("sd-popover"),
    },
  },
}
