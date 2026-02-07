# 🏭 Labour Efficiency 2026

> **Interactive workforce planning dashboard for Biscuit International Bergambacht**

A modern, responsive Next.js application designed to bridge the gap between theoretical staffing blueprints and real-world production line decisions.

![Next.js](https://img.shields.io/badge/Next.js-15.1.1-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.0-FF0055?style=flat-square&logo=framer)

---

## ✨ Features

### 📊 Blueprint Tables

- Dynamic staffing overview per production line (A, B, C, D, E)
- Interactive B-line variant selector (Mini vs Normaal)
- Real-time FTE calculations with breakdown by role (Inpak, Operator, Bakoperator)

### ⏱️ Pause-Aflos Simulator

- Visual timeline simulation for break relief system
- Interactive scheduling for 3 relief workers across 2 production lines
- Real-time coverage validation

### 🔧 Technical Conditions Tracker

- Current machine/equipment issues affecting staffing
- Separated view for Inpaklijn vs Baklijn impacts
- Clear visualization of temporary FTE requirements

### 🧮 FTE Calculator

- Scenario-based workforce planning
- Toggle production lines on/off
- Planning modifiers (8-stuks wafel, Duo Meli, BIO production)
- Technical issue impacts with potential savings display
- Compact, single-viewport layout

---

## 🎨 Design System

Built with a custom brand-aligned design system:

| Color         | Hex       | Usage                      |
| ------------- | --------- | -------------------------- |
| 🟡 Brand Gold | `#C69B3E` | Primary accent, highlights |
| 🔵 Brand Navy | `#19213C` | Headers, emphasis          |

**Typography:** Geist Sans & Geist Mono (Next.js optimized fonts)

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Icons:** Heroicons
- **Deployment:** Vercel-ready

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/labeff.git

# Navigate to project
cd labeff

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout with metadata
│   ├── page.tsx        # Main page composition
│   └── globals.css     # Global styles & CSS variables
├── components/
│   ├── TopNav.tsx      # Sticky navigation with logo
│   ├── HeroSection.tsx # Landing hero with gradient
│   ├── BlueprintTables.tsx  # Staffing blueprint display
│   ├── AflosSimulator.tsx   # Break relief simulator
│   ├── CalculatorPanel.tsx  # FTE calculator
│   ├── InfoCards.tsx   # Planning conditions cards
│   ├── Section.tsx     # Reusable section wrapper
│   └── Footer.tsx      # Site footer
├── data/
│   └── aflosSchedule.ts    # Break schedule data
└── lib/
    ├── time.ts         # Time utilities
    └── ui.ts           # UI utilities (cn helper)
```

---

## 📸 Screenshots

| Blueprint Tables                                  | FTE Calculator                                      |
| ------------------------------------------------- | --------------------------------------------------- |
| Interactive staffing overview with line selection | Scenario-based planning with real-time calculations |

| Pause-Aflos Simulator        | Planning Conditions              |
| ---------------------------- | -------------------------------- |
| Visual break relief timeline | Planning scenarios affecting FTE |

---

## 🎯 Key Decisions

1. **Single Viewport Calculator** — All controls and results visible without scrolling
2. **Separated Inpak/Baklijn** — Clear distinction between packaging line and baking line FTE
3. **B-Line Variants** — Mini (5 FTE) vs Normaal (9 FTE) as mutually exclusive options
4. **Real-time Calculations** — No localStorage, all state derived from current selections

---

## 📄 License & Ownership

© 2026 **Zsolt Márku**. All rights reserved.

This project was developed by [Zsolt Márku](https://zsoltmarku.com) for Biscuit International Bergambacht. The source code, design, and implementation are the intellectual property of the developer.

**Usage Rights:**

- ✅ Portfolio showcase
- ✅ Code reference for future projects
- ❌ Redistribution without permission
- ❌ Commercial use by third parties

---

## 👨‍💻 Developer

<a href="https://zsoltmarku.com" target="_blank">
  <img src="https://zsoltmarku.com/logo.png" alt="ZSM Web Dev" width="40" style="border-radius: 50%;" />
</a>

**Zsolt Márku** — [zsoltmarku.com](https://zsoltmarku.com)

---

<p align="center">
  <sub>Built with ❤️ in 2026</sub>
</p>
