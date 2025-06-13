export interface SnackbarProps {
  message: string
  title: string
  action?: {
    label: string
    onClick: () => void
  }
  onClose?: () => void
}

interface SnackbarStyles {
  readonly reset: Readonly<Partial<CSSStyleDeclaration>>
  readonly container: Readonly<Partial<CSSStyleDeclaration>>
  readonly snackbar: Readonly<Partial<CSSStyleDeclaration>>
  readonly textSection: Readonly<Partial<CSSStyleDeclaration>>
  readonly actionSection: Readonly<Partial<CSSStyleDeclaration>>
  readonly title: Readonly<Partial<CSSStyleDeclaration>>
  readonly message: Readonly<Partial<CSSStyleDeclaration>>
  readonly actionButton: Readonly<Partial<CSSStyleDeclaration>>
  readonly closeButton: Readonly<Partial<CSSStyleDeclaration>>
  readonly svg: Readonly<Partial<CSSStyleDeclaration>>
}

type IconType = "info" | "close"

type IconConfig = Readonly<Record<IconType, string>>

export class Snackbar {
  private static instance: Snackbar | null = null

  private currentItem: SnackbarProps | null = null
  private container: HTMLElement | null = null

  private static readonly ICONS: IconConfig = {
    info: "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm-4 48a12 12 0 1 1-12 12 12 12 0 0 1 12-12Zm12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16 16 16 0 0 1 16 16v40a8 8 0 0 1 0 16Z",
    close:
      "M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128 50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z",
  } as const

  private static readonly STYLES: SnackbarStyles = {
    reset: {
      margin: "0",
      padding: "0",
      border: "0",
      fontSize: "100%",
      font: "inherit",
      verticalAlign: "baseline",
      outline: "none",
      background: "transparent",
      color: "inherit",
      textDecoration: "none",
      textTransform: "none",
      width: "auto",
      height: "auto",
      lineHeight: "normal",
      boxSizing: "border-box",
      appearance: "none",
      userSelect: "none",
      fontFamily: "inherit",
      fontWeight: "normal",
      fontStyle: "normal",
      textAlign: "left",
      whiteSpace: "normal",
      wordWrap: "normal",
      letterSpacing: "normal",
      textShadow: "none",
      boxShadow: "none",
      borderRadius: "0",
      transform: "none",
      transition: "none",
      animation: "none",
      opacity: "1",
      visibility: "visible",
      overflow: "visible",
      display: "block",
      position: "static",
      top: "auto",
      right: "auto",
      bottom: "auto",
      left: "auto",
      zIndex: "auto",
      float: "none",
      clear: "none",
    },
    container: {
      position: "fixed",
      bottom: "16px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: "2147483647",
      pointerEvents: "none",
    },
    snackbar: {
      padding: "16px",
      borderRadius: "8px",
      backgroundColor: "#1C1F26",
      color: "#F1F3F9",
      display: "flex",
      alignItems: "flex-start",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
      fontSize: "14px",
      fontFamily: "inherit",
      fontWeight: "400",
      lineHeight: "1.4",
      textAlign: "left",
      pointerEvents: "auto",
      maxWidth: "560px",
      minWidth: "320px",
      width: "fit-content",
      boxSizing: "border-box",
    },
    textSection: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      minWidth: "240px",
      marginRight: "16px",
      flex: "1",
    },
    actionSection: {
      display: "flex",
      alignItems: "center",
      alignSelf: "center",
      gap: "8px",
      flexShrink: "0",
    },
    title: {
      color: "#F1F3F9",
      fontSize: "16px",
      fontWeight: "500",
      lineHeight: "1.25",
      margin: "0",
      padding: "0",
      display: "block",
    },
    message: {
      color: "#CDD5E5BF",
      fontSize: "14px",
      fontWeight: "400",
      lineHeight: "1.43",
      margin: "0",
      padding: "0",
      display: "block",
    },
    actionButton: {
      background: "#CDD5E512",
      border: "1px solid transparent",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      padding: "6px 14px",
      borderRadius: "32px",
      color: "#F1F3F9",
      fontFamily: "inherit",
      lineHeight: "1.4",
      textAlign: "center",
      textDecoration: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "32px",
      boxSizing: "border-box",
      outline: "none",
      userSelect: "none",
      transition: "background-color 0.2s ease",
    },
    closeButton: {
      background: "transparent",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      padding: "0",
      margin: "0",
      outline: "none",
      userSelect: "none",
      flexShrink: "0",
      transition: "background-color 0.2s ease",
    },
    svg: {
      display: "block",
      flexShrink: "0",
      pointerEvents: "none",
      userSelect: "none",
    },
  } as const

  private constructor() {}

  public static getInstance(): Snackbar {
    if (!Snackbar.instance) {
      Snackbar.instance = new Snackbar()
      const root = typeof window !== "undefined" ? document.createElement("div") : null
      if (root) {
        document.body.appendChild(root)
        Snackbar.instance.attach(root)
      }
    }
    return Snackbar.instance
  }

  public attach(parentElement: HTMLElement): void {
    if (this.container) return

    this.container = this.createContainer()
    parentElement.appendChild(this.container)
  }

  public show(props: SnackbarProps): void {
    this.hide()
    this.currentItem = props
    this.render()
  }

  public hide(): void {
    this.clearContent()
    this.currentItem = null
  }

  public destroy(): void {
    this.hide()
    this.container?.remove()
    this.container = null
    Snackbar.instance = null
  }

  private createContainer(): HTMLElement {
    const element = document.createElement("div")
    this.applyStyles(element, [Snackbar.STYLES.reset, Snackbar.STYLES.container])
    return element
  }

  private render(): void {
    if (!this.container || !this.currentItem) return

    const snackbar = this.createSnackbarElement()
    this.container.appendChild(snackbar)
  }

  private createSnackbarElement(): HTMLElement {
    const snackbar = document.createElement("div")
    this.applyStyles(snackbar, [Snackbar.STYLES.reset, Snackbar.STYLES.snackbar])

    const fragments = [this.createIcon(), this.createTextSection(), this.createActionSection()]

    fragments.forEach(fragment => snackbar.appendChild(fragment))
    return snackbar
  }

  private createIcon(): SVGSVGElement {
    return this.createSVGIcon("info", "20", "20", {
      fill: "#F1F3F9",
      marginRight: "8px",
      flexShrink: "0",
    })
  }

  private createTextSection(): HTMLElement {
    const textSection = document.createElement("div")
    this.applyStyles(textSection, [Snackbar.STYLES.reset, Snackbar.STYLES.textSection])

    if (this.currentItem) {
      const titleElement = this.createTextElement(
        "div",
        this.currentItem.title,
        Snackbar.STYLES.title,
      )
      const messageElement = this.createTextElement(
        "div",
        this.currentItem.message,
        Snackbar.STYLES.message,
      )

      textSection.appendChild(titleElement)
      textSection.appendChild(messageElement)
    }

    return textSection
  }

  private createActionSection(): HTMLElement {
    const actionSection = document.createElement("div")
    this.applyStyles(actionSection, [Snackbar.STYLES.reset, Snackbar.STYLES.actionSection])

    if (this.currentItem?.action) {
      actionSection.appendChild(this.createActionButton())
    }

    actionSection.appendChild(this.createCloseButton())
    return actionSection
  }

  private createTextElement(
    tag: keyof HTMLElementTagNameMap,
    text: string,
    styles: Readonly<Partial<CSSStyleDeclaration>>,
  ): HTMLElement {
    const element = document.createElement(tag)
    element.textContent = text
    this.applyStyles(element, [Snackbar.STYLES.reset, styles])
    return element
  }

  private createActionButton(): HTMLButtonElement {
    if (!this.currentItem?.action) {
      throw new Error("Action is required to create action button")
    }

    const { label, onClick } = this.currentItem.action
    const button = document.createElement("button")

    button.textContent = label
    button.type = "button"
    this.applyStyles(button, [Snackbar.STYLES.reset, Snackbar.STYLES.actionButton])

    this.attachButtonHoverEffects(button, {
      hover: "#CDD5E520",
      default: "#CDD5E512",
    })

    button.addEventListener("click", () => {
      onClick()
      this.hide()
    })

    return button
  }

  private createCloseButton(): HTMLButtonElement {
    const svg = this.createSVGIcon("close", "20", "20", { fill: "#F1F3F9" })
    const button = document.createElement("button")

    button.appendChild(svg)
    button.setAttribute("aria-label", "Close")
    button.type = "button"
    this.applyStyles(button, [Snackbar.STYLES.reset, Snackbar.STYLES.closeButton])

    this.attachButtonHoverEffects(button, {
      hover: "rgba(255, 255, 255, 0.1)",
      default: "transparent",
    })

    button.addEventListener("click", () => {
      this.currentItem?.onClose?.()
      this.hide()
    })
    return button
  }

  private createSVGIcon(
    iconType: IconType,
    width: string,
    height: string,
    additionalStyles: Partial<CSSStyleDeclaration> = {},
  ): SVGSVGElement {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")

    const attributes = {
      viewBox: "0 0 256 256",
      width,
      height,
      role: "img",
      "aria-hidden": "true",
    }

    Object.entries(attributes).forEach(([key, value]) => {
      svg.setAttribute(key, value)
    })

    this.applyStyles(svg, [Snackbar.STYLES.reset, Snackbar.STYLES.svg, additionalStyles])

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
    path.setAttribute("d", Snackbar.ICONS[iconType])
    svg.appendChild(path)

    return svg
  }

  private attachButtonHoverEffects(
    button: HTMLButtonElement,
    colors: { hover: string; default: string },
  ): void {
    button.addEventListener("mouseenter", () => {
      button.style.backgroundColor = colors.hover
    })

    button.addEventListener("mouseleave", () => {
      button.style.backgroundColor = colors.default
    })
  }

  private applyStyles(
    element: HTMLElement | SVGElement,
    stylesList: ReadonlyArray<Readonly<Partial<CSSStyleDeclaration>>>,
  ): void {
    stylesList.forEach(styles => {
      Object.assign(element.style, styles)
    })
  }

  private clearContent(): void {
    if (this.container) {
      this.container.innerHTML = ""
    }
  }
}
