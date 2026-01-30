# Charger Asset Management System - Project Configuration

## 1. Project Overview
- **Name**: Charger Asset Management System
- **Framework**: React Native (Expo)
- **Design System**: Custom Futuristic / Sci-Fi UI
- **Theming**:
  - **Mode**: Dark Mode Only (Cyberpunk/Sci-Fi aesthetics)
  - **Key Elements**: Neons (Cyan, Magenta), Deep Blacks, Glassmorphism, Holo-effects.
  - **Implementation**: Custom Theme Context + Expo Linear Gradient + Expo Blur.

## 2. Architecture Rules
- **No Material 3**: Avoid standard Material Design components.
- **Visuals**: Use gradients, blurs, and glowing effects for UI elements.
- **Typography**: Tech-inspired fonts (System monospaced or similar).
- **Responsiveness**: Ensure high-performance responsiveness.
- **Code**: Modular, type-safe (TypeScript).

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
