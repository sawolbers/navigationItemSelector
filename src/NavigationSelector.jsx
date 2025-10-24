import { Component, createElement } from "react";
import "./ui/NavigationSelector.css";

const rawLogger =
    window.mx?.logger && typeof window.mx.logger.getLogger === "function"
        ? window.mx.logger.getLogger("NavigationSelector")
        : console;

const logger = ["debug", "info", "warn", "error"].reduce((acc, level) => {
    acc[level] = (...args) => {
        const msg = args
            .map(a =>
                typeof a === "object"
                    ? JSON.stringify(a, null, 2)
                    : String(a)
            )
            .join(" ");
        rawLogger[level](`[NavigationSelector] ${msg}`);
    };
    return acc;
}, {});

function getLanguageCode() {
    try {
        const s = mx.session?.sessionData || {};
        const raw =
            s.locale?.code ||
            s.languageCode ||
            s.user?.language?.code ||
            mx.session?.getConfig?.()?.locale?.code ||
            "en_US";
        return String(raw).replace("-", "_").toLowerCase();
    } catch {
        return "en_us";
    }
}


export default class NavigationSelector extends Component {
    componentDidMount() {
        this.menuName = this.props.menuName?.value;
        this.selectorType = this.props.selectorType;
        this.itemIndex = this.props.itemIndex;
        this.itemCaption = this.getLocalizedCaption();

        logger.debug("Mounted", {
            menuName: this.menuName,
            selectorType: this.selectorType,
            itemCaption: this.itemCaption,
            itemIndex: this.itemIndex
        });

        this.waitForNav(() => this.activateCurrent());
    }

    // --- NEW helper ---------------------------------------------------------
    getLocalizedCaption() {
        const baseCaption = this.props.itemCaption?.value || "";
        const translations =
            typeof this.props.captionTranslations === "string"
            ? this.props.captionTranslations
            : this.props.captionTranslations?.value;

        logger.debug("captionTranslations raw:", translations);

        if (!translations) {
            logger.warn("No input found in captionTranslations:");
            return baseCaption;
        }

        try {
            const parsed = JSON.parse(translations);
            const lang = getLanguageCode();
            const map = Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k.replace("-", "_").toLowerCase(), v])); // Normalize all keys to lowercase with underscores
            const normalized = lang.replace("-", "_").toLowerCase(); // Normalize current language
            const match = map[normalized] || map[normalized.split("_")[0]] || map["en_us"]; // Try full language (en_us) → base (en) → fallback

            if (match) {
                logger.debug("Using localized caption", { lang, caption: match });
                return match;
            }
        } catch (e) {
            logger.warn("Invalid JSON in captionTranslations:", e);
        }
        return baseCaption;
    }

    waitForNav(onReady) {
        const selector = `.mx-name-${this.menuName}`;
        this.interval = setInterval(() => {
            const nav = document.querySelector(selector);
            if (nav) {
                clearInterval(this.interval);
                this.interval = null;
                this.navEl = nav;
                onReady();
            }
        }, 200);
    }

    activateCurrent() {
        if (!this.navEl) return;
        const items = [...this.navEl.querySelectorAll('a[role="menuitem"], li[role="menuitem"] a')];
        let match = null;

        if (this.selectorType === "byIndex" && this.itemIndex >= 0 && this.itemIndex < items.length) {
            match = items[this.itemIndex];
        } else if (this.selectorType === "byCaption" && this.itemCaption) {
            const want = this.itemCaption.trim().toLowerCase();
            match = items.find(
                a =>
                    (a.title && a.title.trim().toLowerCase() === want) ||
                    (a.innerText && a.innerText.trim().toLowerCase() === want)
            );
        }

        // Clear all active
        this.navEl.querySelectorAll(".active").forEach(el => el.classList.remove("active"));

        if (match) {
            const target = match.closest("li") || match;
            target.classList.add("active");
            logger.debug("Activated navigation item:", match.title || match.innerText);
        } else {
            logger.warn("No matching item found for caption:", this.itemCaption);
        }
    }

    componentWillUnmount() {
        if (this.interval) clearInterval(this.interval);
        if (this.langCheckInterval) clearInterval(this.langCheckInterval);
    }

    render() {
        return <div style={{ display: "none" }} />;
    }
}
