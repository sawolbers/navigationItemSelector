import { createElement } from "react";

export class preview {
    render() {
        const { menuName, targetPage } = this.props;
        return (
            <div
                style={{
                    border: "1px dashed #bbb",
                    background: "#fafafa",
                    padding: "8px 10px",
                    borderRadius: "4px",
                    color: "#555",
                    fontSize: "12px",
                    lineHeight: "1.4"
                }}
            >
                <strong>NavigationItemSelector</strong>
                <div>Menu name: {menuName?.value || "—"}</div>
                <div>Target page: {targetPage?.value || "—"}</div>
                <em style={{ color: "#888" }}>Highlights nav item at runtime</em>
            </div>
        );
    }
}

// Keep this if you have styles under ./ui/
export function getPreviewCss() {
    return require("./ui/NavigationSelector.css");
}
