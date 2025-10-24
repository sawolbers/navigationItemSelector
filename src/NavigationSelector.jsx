import { Component, createElement } from "react";
import "./ui/NavigationSelector.css";

const logger =
    window.mx?.logger && typeof window.mx.logger.getLogger === "function"
        ? window.mx.logger.getLogger("NavigationSelector")
        : {
              debug: (...a) => console.debug("[NavigationSelector]", ...a),
              info:  (...a) => console.info("[NavigationSelector]",  ...a),
              warn:  (...a) => console.warn("[NavigationSelector]",  ...a),
              error: (...a) => console.error("[NavigationSelector]", ...a)
          };

export default class NavigationSelector extends Component {
    componentDidMount() {
        this.menuName = this.props.menuName?.value;
        this.selectorType = this.props.selectorType;
        this.itemCaption = this.props.itemCaption?.value;
        this.itemIndex = this.props.itemIndex;
        this.navEl = null;
        this.lastActivatedEl = null;
        this.boundClickHandler = this.onNavClick.bind(this);

        if (!this.menuName) {
            logger.error("Missing menuName");
            return;
        }

        logger.info("Mounted", {
            menuName: this.menuName,
            selectorType: this.selectorType,
            itemCaption: this.itemCaption,
            itemIndex: this.itemIndex
        });

        // 1) initial activation once nav is rendered
        this.waitForNav(() => {
            this.attachClickHandler();
            this.activateCurrent();
        });

        // 2) re-run after any Mendix page open
        this.originalOpenForm = mx.ui.openForm;
        mx.ui.openForm = (...args) => {
            const ret = this.originalOpenForm.apply(mx.ui, args);
            // Schedule after the page actually renders
            requestAnimationFrame(() => this.activateCurrent());
            return ret;
        };
    }

    componentWillUnmount() {
        if (this.interval) clearInterval(this.interval);

        // Restore mx.ui.openForm
        if (this.originalOpenForm) {
            mx.ui.openForm = this.originalOpenForm;
            this.originalOpenForm = null;
        }

        // Detach click listener
        if (this.navEl && this.boundClickHandler) {
            this.navEl.removeEventListener("click", this.boundClickHandler, true);
        }

        // Clear our last active (so it doesn’t “stick” across pages)
        if (this.lastActivatedEl) {
            this.lastActivatedEl.classList.remove("active");
            this.lastActivatedEl = null;
        }

        this.navEl = null;
    }

    waitForNav(onReady) {
        const selector = `.mx-name-${this.menuName}`;
        this.interval = setInterval(() => {
            const nav = document.querySelector(selector);
            logger.debug("Looking for nav:", selector, !!nav);
            if (nav) {
                clearInterval(this.interval);
                this.interval = null;
                this.navEl = nav;
                onReady();
            }
        }, 200);
    }

    attachClickHandler() {
        if (!this.navEl) return;
        // Use capture to catch clicks before Mendix mutates anything
        this.navEl.addEventListener("click", this.boundClickHandler, true);
    }

    onNavClick(e) {
        const anchor = e.target?.closest?.('a[role="menuitem"]');
        if (!anchor || !this.navEl?.contains(anchor)) return;

        // Update active immediately on click
        this.resetAllActive();
        const isMenuBar = this.isMenuBar();
        const target = isMenuBar ? anchor : anchor.closest("li") || anchor;
        if (target) {
            target.classList.add("active");
            this.lastActivatedEl = target;
            logger.info("Activated via click:", anchor.title || anchor.innerText);
        }
    }

    activateCurrent() {
        if (!this.navEl) return;

        const items = this.collectItems();
        if (items.length === 0) return;

        let match = null;

        if (this.selectorType === "byIndex" && this.itemIndex >= 0 && this.itemIndex < items.length) {
            match = items[this.itemIndex];
        } else if (this.selectorType === "byCaption" && this.itemCaption) {
            const want = this.itemCaption.trim().toLowerCase();
            match = items.find(a =>
                (a.title && a.title.trim().toLowerCase() === want) ||
                (a.innerText && a.innerText.trim().toLowerCase() === want)
            );
        }

        this.resetAllActive();

        if (match) {
            const isMenuBar = this.isMenuBar();
            const target = isMenuBar ? match : match.closest("li") || match;
            if (target) {
                target.classList.add("active");
                this.lastActivatedEl = target;
                logger.info("Activated programmatically:", match.title || match.innerText || `(index ${this.itemIndex})`);
            }
        } else {
            logger.warn("No match found for", this.selectorType === "byCaption" ? this.itemCaption : this.itemIndex);
        }
    }

    resetAllActive() {
        if (!this.navEl) return;
        this.navEl.querySelectorAll(".active").forEach(el => el.classList.remove("active"));
        this.lastActivatedEl = null;
    }

    collectItems() {
        // Handles menu bar + tree/list
        // menubar: <a role="menuitem">
        // tree/list: <li><a role="menuitem"></a></li>
        return [
            ...this.navEl.querySelectorAll('a[role="menuitem"], li[role="menuitem"] a')
        ];
    }

    isMenuBar() {
        return this.navEl &&
               this.navEl.querySelector('a[role="menuitem"]') &&
               !this.navEl.querySelector("ul li");
    }

    render() {
        return <div style={{ display: "none" }} />;
    }
}
