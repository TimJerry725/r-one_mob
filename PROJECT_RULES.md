# Charger Asset Management System - Project Configuration

## 1. Project Overview
- **Name**: Charger Asset Management System
- **Framework**: React Native
- **Design System**: Material 3
- **Theming**:
  - **Modes**: Light, Dark
  - **Implementation**: Use Material 3 Dynamic Color schemes
  - **Provider**: React Native Paper Provider or ConfigProvider equivalent

## 2. Architecture Rules
- Strictly use Material 3 components for both Light and Dark modes.
- Zero custom CSS: leverage theme-aware styling (`useTheme` hook).
- Ensure high-performance responsiveness across Phone and Tablet.
- Code must be modular, type-safe (TypeScript), and professional.

## 3. User Roles

### Central Team
- Project creation and resource allocation.
- Assignment of assets to field personnel.

### Field Team
- Status updates and real-time reporting.
- Field checklist execution.

## 4. Workflow States
**Status Sequence**:
1. Accept/Reject Work
2. Working
3. In Review
4. Completed

## 5. Data Model

### Hierarchy
- **Project**: Contains Checklists.

### Checklist Structure
- Contains Tasks.
- **Supported Data Types**:
  - Text/Description
  - Numeric/Measurement
  - Boolean/Toggle
  - Photo/Asset Evidence
  - Dropdown/Status Selection
