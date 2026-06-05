# GitHub Calendar Component

A premium, highly customizable GitHub-style contributions calendar heatmap for React and Tailwind CSS. Built to integrate seamlessly with shadcn/ui and powered by Framer Motion.

Live Demo: [https://github-calendar-kappa.vercel.app/](https://github-calendar-kappa.vercel.app/)

---

## Features

- ⚡ **Zero Backend Setup:** Automatically fetches contribution data directly on the client side using a public endpoint.
- 🎨 **Fully Customizable:** Customize colors (preset schemes or custom 5-stop arrays), cell sizes, spacing, time range limits, month/day labels, and cell shapes (`square`, `circle`, `rounded`).
- ✨ **Shimmering Skeleton Loader:** Beautiful pulsing cell animation on load that matches the selected time range dimensions.
- ♿ **Accessible & Semantic:** Keyboard navigability, proper role declarations, tooltips, and screen-reader friendly labels.
- 📦 **shadcn/ui Compatible:** Easily download and incorporate directly into your own project using the CLI or copy-paste.

---

## Installation

### Method 1: Using shadcn/ui CLI (Recommended)

You can automatically add the component to your project's `components/ui` directory by running:

```bash
npx shadcn@latest add https://github-calendar-kappa.vercel.app/r/github-calendar.json
```

### Method 2: Manual Copy-Paste

Copy the contents of [github-calendar.tsx](https://github-calendar-kappa.vercel.app/components/ui/github-calendar.tsx) and paste them into your project at `components/ui/github-calendar.tsx`.

Make sure to install the following dependencies in your project:
```bash
npm install motion clsx tailwind-merge lucide-react
# or
pnpm add motion clsx tailwind-merge lucide-react
```

---

## Usage

Here is a basic example of how to use the component:

```tsx
import { GitHubCalendar } from "@/components/ui/github-calendar"

export default function App() {
  return (
    <GitHubCalendar
      username="om2309"
      colorScheme="blue"
      cellSize={16}
      cellShape="circle"
      timeRange="3-months"
    />
  )
}
```

---

## Props Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `username` | `string` | *required* | GitHub username to fetch and display contributions for |
| `colorScheme` | `green` \| `blue` \| `purple` \| `orange` \| `pink` \| `dracula` \| `halloween` | `"blue"` | Preset theme palette for the levels |
| `colors` | `[string, string, string, string, string]` | `—` | Custom 5-stop color array override `[empty, level1, level2, level3, level4]` |
| `cellSize` | `number` | `16` | Width and height of each grid cell in pixels |
| `cellGap` | `number` | `4` | Spacing between grid cells in pixels |
| `cellShape` | `"square"` \| `"circle"` \| `"rounded"` | `"circle"` | Shape styling for each contribution cell |
| `showTooltip` | `boolean` | `true` | Toggle displaying the hover information tooltip |
| `showMonthLabels` | `boolean` | `true` | Toggle showing month names above columns |
| `showDayLabels` | `boolean` | `true` | Toggle showing day of week labels on the left (Mon, Wed, Fri) |
| `weekStart` | `"sun"` \| `"mon"` | `"sun"` | Determines which day of the week to start the columns on |
| `animate` | `boolean` | `false` | Enable staggered mounting scale animation for cells |
| `timeRange` | `"3-months"` \| `"6-months"` \| `"1-year"` | `"3-months"` | Adjusts the historical date limit shown in the calendar |
| `onDataLoaded` | `(data: ContributionDay[]) => void` | `—` | Callback function fired when data is successfully loaded client-side |

---

## Running Locally

To run this demo application locally:

1. Clone this repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run the development server:
   ```bash
   pnpm dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## License

MIT License. Feel free to use and distribute!
