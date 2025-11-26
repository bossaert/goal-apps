# Goal Apps - Results Prototype

A Vue 3 + Quasar financial planning dashboard prototype that visualizes retirement planning scenarios with interactive charts and detailed projections.

## 🎯 Features

### Dashboard Overview
- **Probability of Success**: Circular progress indicator showing Monte Carlo simulation results
- **Key Metrics Display**: Retirement income goals, account values, and portfolio allocations
- **Interactive Tabs**: Switch between Projection, Cash Flow, and Portfolio views

### Chart Visualizations
- **Portfolio Projection Fan Chart**: 
  - Displays P10, P50, P90 percentile ranges
  - Shows median (P50) path overlay
  - Interactive tooltips with detailed information
  - Export functionality (PNG, PDF, SVG, CSV, XLS)

- **Cash Flow Chart**:
  - Stacked column chart showing income sources
  - Portfolio withdrawals visualization
  - Spending target line overlay
  - Comprehensive annual cash flow breakdown

### Technical Features
- ✅ Responsive design (mobile-friendly)
- ✅ Accessibility support (ARIA labels, screen reader compatible)
- ✅ Export functionality (multiple formats)
- ✅ Performance optimizations for large datasets
- ✅ Modern UI with Quasar Framework

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/goal-apps.git
cd goal-apps
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

## 📁 Project Structure

```
goal-apps/
├── src/
│   ├── components/
│   │   ├── Zone2Header.vue      # Header with KPIs and metrics
│   │   ├── Zone3Projection.vue  # Portfolio projection chart
│   │   └── Zone3CashFlow.vue   # Cash flow visualization
│   ├── App.vue                 # Main application component
│   ├── main.js                 # Application entry point
│   ├── mockData.js             # Sample financial data
│   └── quasar-variables.sass   # Quasar theme customization
├── index.html
├── vite.config.js              # Vite configuration
└── package.json
```

## 🛠️ Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Quasar Framework** - Vue.js based framework for building responsive apps
- **Highcharts** - Interactive charting library
- **Vite** - Next-generation frontend build tool
- **SASS** - CSS preprocessor

## 📊 Chart Features

### Portfolio Projection Chart
- **Type**: Area spline range (fan chart)
- **Data**: P10, P50, P90 percentile projections
- **Features**:
  - Confidence interval visualization
  - Median path overlay
  - Interactive tooltips
  - Export capabilities

### Cash Flow Chart
- **Type**: Stacked column with spline overlay
- **Data**: Income sources, withdrawals, spending targets
- **Features**:
  - Stacked income visualization
  - Spending target line
  - Year-over-year comparison
  - Detailed tooltips

## 🎨 Customization

### Quasar Theme
Edit `src/quasar-variables.sass` to customize colors:
```sass
$primary   : #1976d2
$secondary : #26a69a
$accent    : #9c27b0
```

### Chart Configuration
Chart options are defined in:
- `src/components/Zone3Projection.vue` - Portfolio projection
- `src/components/Zone3CashFlow.vue` - Cash flow visualization

## 📝 Data Format

The application uses mock data from `src/mockData.js`. Replace this with your API integration:

```javascript
export const projectionYears = [2025, 2026, ...]
export const projectionP10 = [867860.0, ...]
export const projectionP50 = [1239800.0, ...]
export const projectionP90 = [1611740.0, ...]
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📦 Dependencies

### Production
- `vue`: ^3.5.0
- `quasar`: ^2.16.0
- `@quasar/extras`: ^1.16.0
- `highcharts`: ^11.4.0
- `highcharts-vue`: ^2.0.0

### Development
- `vite`: ^5.0.0
- `@vitejs/plugin-vue`: ^5.0.0
- `@quasar/vite-plugin`: ^1.7.0
- `sass`: ^1.77.0

## 🐛 Troubleshooting

### Charts Not Rendering
- Ensure all Highcharts modules are properly initialized in `src/main.js`
- Check browser console for JavaScript errors
- Verify container elements have explicit dimensions

### Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify all dependencies are installed

## 📄 License

This project is private and proprietary.

## 👥 Contributing

This is a prototype project. For contributions, please contact the project maintainer.

## 🔗 Related Resources

- [Vue.js Documentation](https://vuejs.org/)
- [Quasar Framework](https://quasar.dev/)
- [Highcharts Documentation](https://www.highcharts.com/docs)
- [Vite Documentation](https://vitejs.dev/)

---

**Version**: 1.0.0  
**Last Updated**: 2024

