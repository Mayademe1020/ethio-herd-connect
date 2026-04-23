# EthioHerd Connect Component Library

## Overview
This document serves as a reference for the standardized UI components available in EthioHerd Connect. All new UI development should prioritize using these components to ensure consistency, accessibility, and maintainability.

## Component Categories

### 1. Button Components
Located in: `src/components/ui/`

#### Button (`button.tsx`)
- **Purpose**: Standard action button with multiple variants
- **Variants**: default, destructive, outline, secondary, ghost, link, success, gradient, tertiary
- **Sizes**: icon, sm, default, lg, xl
- **Features**: Loading states, accessible focus states, hover/active feedback
- **Usage**: 
  ```tsx
  <Button variant="default" size="sm" onClick={handleClick}>
    Save Animal
  </Button>
  ```

#### EnhancedButton (`enhanced-button.tsx`)
- **Purpose**: Advanced button with additional variants for complex UIs
- **Additional Variants**: Same as Button plus any custom variants needed
- **Usage**: Same as Button but imported from enhanced-button

### 2. Card Components
Located in: `src/components/ui/`

#### Card (`card.tsx`)
- **Purpose**: Container component for grouping related information
- **Base Styling**: Semantic background and text colors only
- **Variants (via utility classes)**:
  - `card-standard`: Default card with padding, shadow, border
  - `card-list-item`: Compact card for lists
  - `card-hover`: Interactive card with hover effects
  - `card-elevated`: Card with pronounced shadow
- **Subcomponents**:
  - `CardHeader`: Section header with proper spacing
  - `CardTitle`: Main heading with appropriate typography
  - `CardDescription`: Secondary text content
  - `CardContent`: Main content area
  - `CardFooter`: Action area
- **Usage**:
  ```tsx
  <Card className="card-standard">
    <CardHeader>
      <CardTitle>Animal Details</CardTitle>
      <CardDescription>Important information about your livestock</CardDescription>
    </CardHeader>
    <CardContent>
      {/* Content here */}
    </CardContent>
    <CardFooter>
      <Button variant="outline">Edit</Button>
    </CardFooter>
  </Card>
  ```

### 3. Form Components
Located in: `src/components/ui/`

#### Input (`input.tsx`)
- **Purpose**: Standard text input with consistent styling
- **Features**: Proper focus states, error states, sizing options
- **Usage**:
  ```tsx
  <Input
    placeholder="Enter animal name"
    value={name}
    onChange={handleNameChange}
    className="w-full"
  />
  ```

#### Label (`label.tsx`)
- **Purpose**: Associated label for form elements
- **Features**: Proper styling, disabled state handling
- **Usage**:
  ```tsx
  <Label htmlFor="animalName">
    Animal Name
  </Label>
  <Input id="animalName" ... />
  ```

#### Switch (`switch.tsx`)
- **Purpose**: Toggle switch for boolean inputs
- **Features**: Accessible, consistent styling
- **Usage**:
  ```tsx
  <Switch
    checked={isVaccinated}
    onCheckedChange={handleVaccineChange}
    aria-label="Vaccination status"
  />
  ```

### 4. Navigation Components
Located in: `src/components/`

#### BottomNavigation (`BottomNavigation.tsx`)
- **Purpose**: Primary mobile navigation at bottom of screen
- **Features**: Consistent touch targets, active states, notification badges
- **Usage**: Used in AppLayout for main navigation

#### TopBar (`TopBar.tsx`)
- **Purpose**: Top application bar with language toggle and status indicators
- **Features**: Consistent height, spacing, shadow
- **Usage**: Used in AppLayout for consistent app header

### 5. Feedback Components
Located in: `src/components/`

#### Toast (via sonner)
- **Purpose**: Temporary feedback messages
- **Usage**: Imported and used via toast() function
- **Variants**: default, success, error, warning

#### Loading Spinner (`LoadingSpinner`)
- **Purpose**: Indicate loading state
- **Usage**: Used in page loaders and button loading states

## Usage Guidelines

### 1. Component Selection Hierarchy
1. First check: `src/components/ui/` for existing components
2. Second check: Other `src/components/` for specialized components
3. Third check: Consider creating new component ONLY if no suitable option exists
4. When creating new component: Follow patterns in this document

### 2. Styling Approach
- Use design tokens from `src/index.css` for all colors, spacing, typography
- Apply Tailwind utility classes consistently following the 8-point grid
- Avoid hardcoded values (colors, spacing, font sizes)
- Use component variants instead of custom styling when possible

### 3. Accessibility First
- All interactive elements must have proper ARIA labels
- Color contrast must meet WCAG AA standards (4.5:1 for text)
- Focus states must be visible and obvious
- Touch targets must be minimum 48x48px
- Form elements must have associated labels

### 4. Responsive Design
- Mobile-first approach
- Use responsive utility classes (sm:, md:, lg:, xl:)
- Test at multiple screen sizes
- Consider touch vs mouse interactions

## Adding New Components

When creating a new component that will be reused:

1. **Place in appropriate directory**:
   - General UI: `src/components/ui/`
   - Layout/structure: `src/components/` (if not UI-specific)
   - Feature-specific: `src/components/[feature]/` if only used there

2. **Follow existing patterns**:
   - Use `cn()` utility for conditional class merging
   - Accept `className` prop for customization
   - Export display name for React DevTools
   - Include proper TypeScript interfaces

3. **Document usage**:
   - Add JSDoc comments explaining purpose and usage
   - Consider adding to this documentation if widely applicable

4. **Ensure accessibility**:
   - Test with keyboard navigation
   - Verify screen reader compatibility
   - Check color contrast ratios
   - Ensure proper focus management

## Maintenance

This component library should be reviewed and updated:
- When new components are created
- When existing components are modified
- Quarterly to ensure consistency
- As part of UI/UX sprint planning

## Migration Strategy

Existing components should be migrated to use standardized components:
1. **Priority 1**: Buttons, Cards, Forms (highest reuse)
2. **Priority 2**: Navigation, Feedback components
3. **Priority 3**: Specialized containers and displays
4. **Priority 4**: Page layouts and unique UI

Migration approach:
- Update components as they are touched for other changes
- Create codemods for bulk changes when appropriate
- Maintain backward compatibility during transition
- Update documentation as components are standardized

---

*Last Updated: March 14, 2026*
*Version: 1.0.0*