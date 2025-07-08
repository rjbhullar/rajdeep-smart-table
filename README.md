# Smart Table - Take Home Assignment

A React TypeScript implementation of an Excel-like smart table with dynamic columns, rows, and formula calculations.

## 🚀 Project Overview

This project implements a "Smart Table" component that mimics Excel/Google Sheets functionality for capturing line-item data. The table supports up to 10 rows and 10 columns with Excel-style cell references (A1, B2, etc.) and basic arithmetic operations.

## 📋 Requirements Met

- ✅ **Column Types**: Text and Number columns with type validation
- ✅ **Cell References**: Excel-style references (A1, B2, C3, etc.)
- ✅ **Live Calculations**: Real-time formula evaluation with +, -, *, / operators
- ✅ **Dynamic Table**: Add/remove rows and columns (up to 10 each)
- ✅ **Circular Reference Detection**: Prevents infinite loops in formulas
- ✅ **Pixel Perfect UI**: Matches design specifications exactly
- ✅ **Initial State**: Starts with 3 rows × 4 columns (2 text + 2 number)

## 🏗️ Architecture Decisions

### Technology Stack
- **React 18** - Latest stable version for optimal performance
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast development and build tooling
- **Plain CSS** - Pixel-perfect styling without framework overhead
- **Jest + React Testing Library** - Comprehensive testing suite

### Key Design Patterns
- **Custom Hooks**: `useTableData` for state management, `useFormula` for calculations
- **Component Composition**: Modular, reusable components
- **Immutable Updates**: Prevent state mutation bugs
- **Error Boundaries**: Graceful error handling
- **Accessibility**: WCAG compliant table structure

### Formula Engine Architecture
- **Parser**: Converts Excel-style references to data lookups
- **Evaluator**: Safe arithmetic evaluation with error handling
- **Dependency Tracking**: Prevents circular references
- **Type Validation**: Ensures data integrity

## 🤖 AI Usage in Development

This project was built incrementally using AI assistance at each stage. Each feature was developed, tested, and refined before moving to the next.

**AI Tools Used**: Claude + Claude Code (CLI tool) 

### Development Methodology
1. **Feature Planning** - Document requirements and approach
2. **AI Prompt Engineering** - Craft specific prompts for implementation
3. **Code Generation** - Use AI to generate initial implementation
4. **Testing & Refinement** - Test thoroughly and iterate
5. **Documentation** - Document decisions and learnings

### AI Log Summary
- **Features Built with AI**: Project setup, table structure, cell editing, formula engine with comprehensive testing

- **Prompts Used**: See `.ai-log/` folder for detailed prompts and implementation decisions

## 📊 Time Tracking

| Phase | Estimated | Actual | Notes |
|-------|-----------|--------|-------|
| Project Setup | 30 min | 40min | Vite setup, initial structure |
| Table Structure | 45 min | 45 minutes | Basic table layout and styling |
| Cell Editing | 60 min | 55 min | Inline editing functionality |
| Formula Engine | 90 min | 50 min | Excel-style calculations + 47 comprehensive tests |
| Dynamic Management | 75 min | 110 min | Add/remove rows/columns |
| Testing & Polish | 60 min | [PLACEHOLDER] | Unit tests and refinements |
| Documentation | 30 min | [PLACEHOLDER] | README and deployment |
| **Total** | **≤ 6 hours** | **[PLACEHOLDER]**

## 🧪 Testing Strategy

### Unit Tests ✅ IMPLEMENTED
- **Formula calculation engine** - 47 comprehensive tests covering all functionality
- **Cell reference parsing** - Complete validation and error handling
- **Circular reference detection** - Multi-level circular reference prevention
- **Error handling** - All edge cases and invalid inputs tested
- **Mathematical operations** - Operator precedence, parentheses, division by zero
- **Integration scenarios** - Real-world business calculation examples

**Test Command:** `npm test`  
**Current Status:** ✅ 47/47 tests passing
- Data validation
- Error handling

### Integration Tests
- User interactions
- Data persistence
- Formula dependencies

### Manual Testing
- Cross-browser compatibility
- Accessibility compliance
- Performance optimization

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Live Demo

**Production URL**: [PLACEHOLDER - will add after deployment]

## 📁 Project Structure

```
src/
├── components/
│   ├── SmartTable.tsx       # Main table component
│   ├── SmartTable.css       # Table styling
│   ├── TableCell.tsx        # Individual cell with editing
│   └── AddColumnModal.tsx   # Optional modal for column management
├── hooks/
│   ├── useTableData.ts      # Table state management
│   ├── useFormula.ts        # Formula calculation logic
│   └── useTableActions.ts   # Add/remove operations
├── utils/
│   ├── formulaEngine.ts     # Core calculation engine
│   ├── cellReferences.ts    # Excel-style reference parsing
│   └── validation.ts        # Input validation
├── types/
│   └── index.ts             # TypeScript definitions
└── __tests__/
    ├── formulaEngine.test.ts
    └── SmartTable.test.tsx
```

## 🔄 Git Workflow

This project follows a clean, incremental development approach:

1. Each feature is developed in isolation
2. Meaningful commit messages tell the development story
3. Progressive complexity with proper testing
4. AI assistance is documented at each step

---

**Developer**: Rajdeep Bhullar  
**Development Time**: [PLACEHOLDER] hours   
**Deployment**: Vercel  