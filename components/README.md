# 🎨 Component Library

Modern, iOS-inspired React components with Framer Motion animations.

## 📦 Components

### Button

Beautiful, animated buttons with multiple variants and states.

**Variants:**

- `primary` - Ocean gradient with colored shadow
- `secondary` - Ghost style with border
- `tertiary` - Minimal, text-only
- `success` - Emerald gradient
- `danger` - Rose gradient
- `warning` - Amber gradient
- `ghost` - Transparent with hover
- `glass` - Glassmorphism effect

**Sizes:** `xs`, `sm`, `md`, `lg`, `xl`

**Usage:**

```jsx
import Button from './components/Button';

<Button variant="primary" size="md" onClick={handleClick}>
  Save Changes
</Button>

<Button
  variant="secondary"
  leftIcon={<PlusIcon />}
  loading={isLoading}
>
  Add Student
</Button>
```

**Props:**

- `variant` - Button style variant
- `size` - Button size
- `fullWidth` - Stretch to container width
- `disabled` - Disable button
- `loading` - Show loading spinner
- `leftIcon` - Icon on the left
- `rightIcon` - Icon on the right
- `onClick` - Click handler

---

### Card

Flexible card component with elevation levels and composition.

**Variants:**

- `flat` - Subtle background, minimal shadow
- `elevated` - Standard card (default)
- `floating` - Higher elevation
- `glass` - Glassmorphism effect
- `gradient-ocean` - Ocean gradient background
- `gradient-sunset` - Sunset gradient
- `gradient-aurora` - Aurora gradient
- `outlined` - Border only, transparent

**Padding:** `none`, `xs`, `sm`, `md`, `lg`, `xl`

**Usage:**

```jsx
import Card, { CardHeader, CardBody, CardFooter, CardTitle } from './components/Card';

<Card variant="elevated" padding="md" hoverable>
  <CardHeader>
    <CardTitle>Student Profile</CardTitle>
  </CardHeader>
  <CardBody>Content here</CardBody>
  <CardFooter>Footer actions</CardFooter>
</Card>;
```

**Props:**

- `variant` - Card style
- `padding` - Inner spacing
- `hoverable` - Enable hover lift effect
- `clickable` - Make entire card clickable
- `onClick` - Click handler

**Sub-components:**

- `<CardHeader>` - Top section with border
- `<CardBody>` - Main content area
- `<CardFooter>` - Bottom section with border
- `<CardTitle>` - Styled heading
- `<CardDescription>` - Muted text

---

### Input

Modern input field with variants, icons, and validation.

**Variants:**

- `default` - Filled background (default)
- `outlined` - Border only
- `glass` - Glassmorphism

**Sizes:** `sm`, `md`, `lg`

**Usage:**

```jsx
import Input, { Textarea } from './components/Input';

<Input
  label="Student Name"
  placeholder="Enter name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  leftIcon={<UserIcon />}
  error={errors.name}
  required
/>

<Textarea
  label="Notes"
  placeholder="Add notes..."
  rows={4}
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
/>
```

**Props:**

- `label` - Field label
- `type` - Input type (text, email, password, etc.)
- `placeholder` - Placeholder text
- `value` - Controlled value
- `onChange` - Change handler
- `error` - Error message to display
- `helperText` - Helper text below input
- `disabled` - Disable input
- `required` - Mark as required
- `leftIcon` - Icon on the left
- `rightIcon` - Icon on the right
- `variant` - Input style
- `size` - Input size
- `fullWidth` - Stretch to container

---

## 🎨 Design System Files

All components use the design system CSS variables:

- `design-system/colors.css` - Color palette and gradients
- `design-system/typography.css` - Font scales and styles
- `design-system/spacing.css` - Spacing, layout, and grid

### Using Design Tokens

```css
/* Colors */
background: var(--color-primary);
color: var(--color-text-secondary);

/* Gradients */
background: var(--gradient-ocean);
background: var(--gradient-sunset);

/* Spacing */
padding: var(--space-4);
gap: var(--gap-md);
margin: var(--space-section);

/* Radius */
border-radius: var(--radius-card);
border-radius: var(--radius-button);

/* Shadows */
box-shadow: var(--shadow-md);
box-shadow: var(--shadow-ocean);

/* Typography */
font-size: var(--text-lg);
font-weight: var(--font-bold);
line-height: var(--leading-normal);
```

---

## 🎬 Animation Guidelines

All components use Framer Motion for animations. Follow these principles:

### 1. Spring Physics

```jsx
transition={{ type: "spring", stiffness: 300, damping: 20 }}
```

### 2. Hover Effects

```jsx
whileHover={{ y: -4, scale: 1.01 }}
```

### 3. Tap/Click Feedback

```jsx
whileTap={{ scale: 0.98 }}
```

### 4. Page Transitions

```jsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -20 }}
```

### 5. Stagger Children

```jsx
variants={{
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  },
  item: {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  }
}}
```

---

## 📱 Responsive Patterns

### Mobile First

```css
/* Base styles for mobile */
.component {
  padding: var(--space-4);
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    padding: var(--space-6);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .component {
    padding: var(--space-8);
  }
}
```

### Container Queries (Modern)

```css
@container (min-width: 400px) {
  .card {
    flex-direction: row;
  }
}
```

---

## ♿ Accessibility

All components include:

- ✅ Keyboard navigation support
- ✅ Focus visible indicators
- ✅ ARIA attributes
- ✅ Screen reader friendly
- ✅ Color contrast (WCAG AA)

### Best Practices

```jsx
// Always provide labels
<Input label="Email" />

// Use semantic HTML
<Button type="submit">Submit</Button>

// Provide alt text
<img src={photo} alt="Student photo" />

// Use ARIA when needed
<button aria-label="Close modal">
  <X />
</button>
```

---

## 🎯 Coming Soon

Additional components to be added:

- [ ] **Badge** - Status indicators and labels
- [ ] **Avatar** - User/student photos
- [ ] **Modal** - Dialogs and overlays
- [ ] **Toast** - Notification system
- [ ] **Select** - Dropdown menus
- [ ] **Checkbox** - Checkboxes and switches
- [ ] **Navigation** - Bottom nav and sidebar
- [ ] **Tabs** - Tabbed interfaces
- [ ] **Progress** - Progress bars and rings
- [ ] **Skeleton** - Loading placeholders
- [ ] **Charts** - Data visualization

---

## 🚀 Usage in Your Project

### 1. Import Design System

```jsx
// In your main App.jsx or index.jsx
import './design-system/colors.css';
import './design-system/typography.css';
import './design-system/spacing.css';
```

### 2. Use Components

```jsx
import Button from './components/Button';
import Card from './components/Card';
import Input from './components/Input';

function MyComponent() {
  return (
    <Card variant="elevated" padding="md">
      <Input label="Name" />
      <Button variant="primary">Submit</Button>
    </Card>
  );
}
```

### 3. Install Dependencies

```bash
npm install framer-motion
```

---

## 💡 Tips

### Combine Components

```jsx
<Card variant="glass" hoverable onClick={handleClick}>
  <div className="inline">
    <Avatar src={photo} />
    <CardTitle>{name}</CardTitle>
  </div>
  <Button variant="tertiary" size="sm">
    View Profile
  </Button>
</Card>
```

### Use Composition

```jsx
<Card variant="floating" padding="lg">
  <CardHeader>
    <div className="inline space-between">
      <CardTitle>Dashboard</CardTitle>
      <Button variant="ghost" size="sm">
        <Settings />
      </Button>
    </div>
  </CardHeader>
  <CardBody>
    <div className="grid-auto-fit">
      {stats.map((stat) => (
        <StatCard key={stat.id} {...stat} />
      ))}
    </div>
  </CardBody>
</Card>
```

### Custom Variants

```css
/* Add your own in your CSS */
.btn--custom {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
```

---

**Need help?** Check the `REDESIGN-PLAN.md` for detailed design guidelines!
