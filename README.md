## NavigationSelector

Selects the correct navigation item when a page is opened or navigated to in a Mendix application.

This widget ensures that the appropriate menu item (in a navigation bar, tree, or list) is visually marked as active, even when Mendix's default behavior has been overridden or when pages are opened through custom microflows.

## Features

* Automatically detects the navigation widget type (menu bar, navigation tree, or navigation list)
* Supports selection by caption or by index
* Automatically updates when the user navigates or clicks another menu item
* Clears previous active states to prevent multiple highlights
* Uses the Mendix logging framework (mx.logger) for traceable debug output, with a safe fallback to the browser console
* Fully compatible with Mendix 9 and 10 (pluggable widget framework)

## Usage

1. Add the widget to each page or to your layout (if you want global activation)
2. Configure the following properties:

   * **Menu widget name** – The name of the menu widget in Studio Pro (e.g. `menuBar1`, `navigationTree1`)
   * **Selector type** – Choose whether to select the item by *caption* or by *index*
   * **Menu item caption** – The title or text of the navigation item to mark as active (used if selector type = by caption)
   * **Menu item index** – The zero-based position of the item (used if selector type = by index)
3. Run the application. The widget highlights the configured menu item automatically when the page loads. When users navigate or click other menu items, the highlight updates automatically.

## Demo project

A live demo will be available soon via Mendix Sandbox.
Example link placeholder: [https://navigationselector-sandbox.mendixcloud.com/](https://navigationselector-sandbox.mendixcloud.com/)

## Issues, suggestions and feature requests

Please report issues or ideas via the GitHub Issues page:
[https://github.com/mxblue/NavigationSelector/issues](https://github.com/mxblue/NavigationSelector/issues)

## Development and contribution

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to compile the widget into an `.mpk`
4. Copy the generated `.mpk` file into your Mendix project's `widgets` folder
5. To contribute improvements, create a feature branch and submit a pull request
