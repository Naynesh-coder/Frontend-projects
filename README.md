# Kanban Board

A clean, responsive and accessible Kanban board built with **pure HTML, CSS and Vanilla JavaScript (ES6+)**. No frameworks, no build step, no dependencies. Simply clone or download the repository, open the file, or view the live demo hosted directly on GitHub.

## Live Demo & Host

This project is hosted live on **GitHub Pages**.

* **GitHub Repository:** \[Insert your GitHub repo URL here\]

* **Live Site:** \[Insert your GitHub Pages URL here, e.g., `https://your-username.github.io/your-repo-name/`\]

## Features

* **Three columns:** To Do, In Progress and Completed.

* **Add and edit tasks** in an accessible modal with title (required), description, priority (Low, Medium, High) and due date.

* **Delete with confirmation** so nothing disappears by accident.

* **Move tasks two ways:**

  * Drag and drop (HTML5 Drag & Drop API) on desktop.

  * A "Move to" dropdown on every card for mobile, touch and keyboard users.

* **Search and filters:** real-time title search, plus priority and status filters.

* **Persistent data:** tasks are saved in `localStorage`, with sample tasks preloaded on the first visit.

* **Clear UX states:** styled empty-column placeholders and a friendly "no results" message with a *Clear filters* button.

* **Visual cues:** red, yellow and green priority badges, overdue due-date highlighting, hover effects and drag indicators.

* **Responsive:** side-by-side columns on desktop, swipeable snap-scrolling columns on mobile.

* **Theming:** automatic light and dark mode through CSS custom properties.

* **Multi-tab sync:** changes made in one browser tab appear in the others.

## Getting Started

### Quick Start (Local)

1. Clone the repository:

   ```
   git clone https://github.com/your-username/your-repo-name.git
   
   ```

2. Navigate to the project directory:

   ```
   cd your-repo-name
   
   ```

3. Open `kanban-board.html` (or `index.html`) directly in any modern web browser.

## Usage

| Action | How | 
| ----- | ----- | 
| Add a task | Click **+ New task**, fill in the form, then **Save task** | 
| Edit a task | Click **Edit** on a card | 
| Delete a task | Click **Delete**, then confirm | 
| Move a task | Drag the card to another column, or use the **Move to** dropdown | 
| Search | Type in the search box (filters by title as you type) | 
| Filter | Use the priority and status dropdowns, or **Clear filters** to reset | 
| Close a dialog | Press `Esc`, click outside it, or use **Cancel** | 

## Project Structure

The app is a single self-contained file with three clearly separated sections:

```
.
├──kanban board
│   ├── <index.html>   Semantic markup: header, toolbar, board container, two <dialog>s
│   ├── <script.js>    Storage layer, state, rendering, actions, event wiring
│   └── <style.css>    Design tokens (CSS variables), layout, components, responsive rules
└── README.md

```

To split it for a larger project, move the `<style>` contents to `styles.css` and the `<script>` contents to `app.js`, then link them from the HTML.

## How It Works

**State management.** One `state` object holds the tasks, the active filters and which task is being edited or deleted. All changes go through a single `setState(mutate)` helper that updates the state, saves it to `localStorage` and re-renders the board. The screen is therefore always a function of the data.

**Rendering.** The board is rebuilt from state after each change. This is simple and fast for the expected number of tasks. After a move, focus returns to the moved card's dropdown so keyboard users keep their place.

**Event delegation.** The board has only three listeners (click, change and the drag events) that survive every re-render. No per-card listeners are needed.

**Data model.** Tasks are stored under the `kanban.tasks.v1` key:

```
{
  "id": "uuid",
  "title": "Design landing page",
  "description": "Wireframes and hero section.",
  "priority": "high",
  "due": "2026-11-02",
  "status": "todo"
}

```

`priority` is `low`, `medium` or `high`. `status` is `todo`, `progress` or `done`. `due` is an ISO date string, or an empty string for no due date.

## Accessibility

* Semantic HTML5: `main`, `section`, `h1` to `h3`, lists, `time`, `label`.

* Native `<dialog>` elements provide focus trapping and `Esc` to close.

* Drag and drop is never the only option; every move is also available through a labelled dropdown.

* An `aria-live` region announces moves to screen readers.

* Visible focus rings, text-plus-colour priority badges, and respect for `prefers-reduced-motion`.

* Touch-friendly targets of at least 36px.

## Customisation

* **Colours and theme:** edit the CSS variables in `:root` (and the dark-mode override inside `@media (prefers-color-scheme: dark)`).

* **Columns:** edit the `COLUMNS` array in the script, and add a matching `--c` colour rule in the CSS.

* **Priorities:** edit the `PRIORITY` object and the `.badge.*` styles.

* **Reset the data:** run `localStorage.removeItem('kanban.tasks.v1')` in the browser console and reload.

## Browser Support

Any current evergreen browser (Chrome, Edge, Firefox or Safari). The app relies on the `<dialog>` element, CSS `color-mix()` and `crypto.randomUUID()`, so older browsers from before about 2023 may not render it correctly.

## Known Limitations and Ideas

* Dropped cards go to the end of their column, so there is no manual ordering yet.

* Data lives in the browser only: there is no sync between devices or accounts.

* Possible next steps: drop-position ordering, sort by due date or priority, labels and tags, import and export as JSON, and undo for deletes.

  ## 📈 Learning Journey

I will continue adding new projects as I learn and improve my frontend development skills.

👨‍💻 Author

Naynesh Zade
GitHub: Naynesh-coder