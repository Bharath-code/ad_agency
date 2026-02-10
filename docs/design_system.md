# Design System — AI Visibility Intelligence

> Component library and UI patterns for the application

---

## Design Principles

### 1. Clarity Over Cleverness
Data should be scannable in 3 seconds. No decorative elements that don't serve function.

### 2. Progressive Disclosure
Show what matters first. Details on demand.

### 3. Honest Feedback
Every action has a clear response. No silent failures.

### 4. Accessible By Default
WCAG AA minimum. Keyboard navigable. Screen reader friendly.

---

## Component Library

### Buttons

```svelte
<!-- Button.svelte -->
<script lang="ts">
  type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
  type Size = 'sm' | 'md' | 'lg';
  
  export let variant: Variant = 'primary';
  export let size: Size = 'md';
  export let disabled = false;
  export let loading = false;
</script>
```

#### Variants

| Variant | Use Case | Visual |
|---------|----------|--------|
| `primary` | Main CTAs, form submits | Solid indigo, white text |
| `secondary` | Secondary actions | Outline, indigo text |
| `ghost` | Tertiary actions | No border, indigo text |
| `danger` | Destructive actions | Solid red, white text |

#### Sizes

| Size | Padding | Font Size | Height |
|------|---------|-----------|--------|
| `sm` | 8px 12px | 14px | 32px |
| `md` | 10px 16px | 14px | 40px |
| `lg` | 12px 24px | 16px | 48px |

#### States

```css
/* Primary button states */
.btn-primary {
  background: var(--color-primary-600);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-700);
  transform: translateY(-1px);
}

.btn-primary:active {
  background: var(--color-primary-800);
  transform: translateY(0);
}

.btn-primary:focus-visible {
  box-shadow: var(--ring-primary);
}

.btn-primary:disabled {
  background: var(--color-neutral-300);
  cursor: not-allowed;
}
```

---

### Cards

#### Base Card

```svelte
<!-- Card.svelte -->
<script lang="ts">
  export let padding: 'sm' | 'md' | 'lg' = 'md';
  export let hoverable = false;
</script>

<div 
  class="card card--{padding}"
  class:card--hoverable={hoverable}
>
  <slot />
</div>
```

```css
.card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.card--sm { padding: var(--space-4); }
.card--md { padding: var(--space-6); }
.card--lg { padding: var(--space-8); }

.card--hoverable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

#### Metric Card (Product-Specific)

```svelte
<!-- MetricCard.svelte -->
<script lang="ts">
  export let title: string;
  export let value: string | number;
  export let change: number | null = null;
  export let changeLabel: string = 'vs last week';
</script>

<div class="metric-card">
  <p class="metric-title">{title}</p>
  <p class="metric-value">{value}</p>
  {#if change !== null}
    <p class="metric-change" class:positive={change > 0} class:negative={change < 0}>
      {change > 0 ? '↑' : '↓'} {Math.abs(change)}% {changeLabel}
    </p>
  {/if}
</div>
```

---

### Visibility Score Display

The hero component of the product.

```svelte
<!-- VisibilityScore.svelte -->
<script lang="ts">
  export let score: number; // 0-100
  export let confidence: 'high' | 'medium' | 'low';
  export let queriesMatched: number;
  export let totalQueries: number;
</script>

<div class="visibility-score">
  <div class="score-ring">
    <svg viewBox="0 0 100 100">
      <circle 
        cx="50" cy="50" r="45" 
        stroke="var(--color-neutral-200)"
        stroke-width="8"
        fill="none"
      />
      <circle 
        cx="50" cy="50" r="45" 
        stroke="var(--color-primary-500)"
        stroke-width="8"
        fill="none"
        stroke-linecap="round"
        stroke-dasharray="{score * 2.83} 283"
        transform="rotate(-90 50 50)"
      />
    </svg>
    <span class="score-value">{score}%</span>
  </div>
  
  <p class="score-label">
    Mentioned in <strong>{queriesMatched}</strong> of <strong>{totalQueries}</strong> AI answers
  </p>
  
  <span class="confidence-badge confidence--{confidence}">
    {confidence} confidence
  </span>
</div>
```

```css
.visibility-score {
  text-align: center;
  padding: var(--space-8);
}

.score-ring {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 0 auto var(--space-4);
}

.score-value {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--color-primary-600);
}

.confidence-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.confidence--high {
  background: var(--color-secondary-100);
  color: var(--color-secondary-700);
}

.confidence--medium {
  background: var(--color-warning) / 0.1;
  color: var(--color-warning);
}

.confidence--low {
  background: var(--color-error) / 0.1;
  color: var(--color-error);
}
```

---

### Query Result Row

```svelte
<!-- QueryResultRow.svelte -->
<script lang="ts">
  export let query: string;
  export let mentioned: boolean;
  export let position: 'primary' | 'secondary' | 'not_mentioned';
  export let competitor: string | null;
  export let hasFix: boolean;
</script>

<div class="query-row" class:mentioned class:not-mentioned={!mentioned}>
  <div class="query-status">
    {#if mentioned}
      <CheckCircle class="icon icon--success" />
    {:else}
      <XCircle class="icon icon--error" />
    {/if}
  </div>
  
  <div class="query-content">
    <p class="query-text">{query}</p>
    {#if !mentioned && competitor}
      <p class="competitor-note">
        <Users class="icon-sm" /> {competitor} mentioned instead
      </p>
    {/if}
  </div>
  
  <div class="query-actions">
    {#if hasFix}
      <button class="btn-ghost btn-sm">View Fix</button>
    {/if}
  </div>
</div>
```

```css
.query-row {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: var(--space-4);
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  align-items: center;
}

.query-row:hover {
  background: var(--color-neutral-50);
}

.query-row.mentioned .query-status {
  color: var(--color-success);
}

.query-row.not-mentioned .query-status {
  color: var(--color-error);
}

.competitor-note {
  font-size: var(--text-sm);
  color: var(--color-warning);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
```

---

### Forms

#### Input Field

```svelte
<!-- Input.svelte -->
<script lang="ts">
  export let label: string;
  export let name: string;
  export let type: 'text' | 'email' | 'password' = 'text';
  export let placeholder = '';
  export let error: string | null = null;
  export let hint: string | null = null;
  export let value = '';
</script>

<div class="form-field" class:has-error={error}>
  <label for={name} class="form-label">{label}</label>
  <input
    {type}
    {name}
    id={name}
    {placeholder}
    bind:value
    class="form-input"
    aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
  />
  {#if error}
    <p id="{name}-error" class="form-error">{error}</p>
  {:else if hint}
    <p id="{name}-hint" class="form-hint">{hint}</p>
  {/if}
</div>
```

```css
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
}

.form-input {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: border-color var(--duration-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: var(--ring-primary);
}

.has-error .form-input {
  border-color: var(--color-error);
}

.form-error {
  font-size: var(--text-sm);
  color: var(--color-error);
}

.form-hint {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
```

---

### Navigation

#### Sidebar

```svelte
<!-- Sidebar.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/projects', label: 'Projects', icon: Folder },
    { href: '/reports', label: 'Reports', icon: FileText },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];
</script>

<aside class="sidebar">
  <div class="sidebar-logo">
    <Logo />
  </div>
  
  <nav class="sidebar-nav">
    {#each navItems as item}
      <a 
        href={item.href}
        class="nav-item"
        class:active={$page.url.pathname.startsWith(item.href)}
      >
        <svelte:component this={item.icon} class="nav-icon" />
        <span>{item.label}</span>
      </a>
    {/each}
  </nav>
  
  <div class="sidebar-footer">
    <UserMenu />
  </div>
</aside>
```

```css
.sidebar {
  width: 240px;
  height: 100vh;
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
}

.sidebar-logo {
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.sidebar-nav {
  flex: 1;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--duration-fast);
}

.nav-item:hover {
  background: var(--color-neutral-100);
  color: var(--color-text-primary);
}

.nav-item.active {
  background: var(--color-primary-50);
  color: var(--color-primary-600);
  font-weight: var(--font-medium);
}
```

---

### Modals

```svelte
<!-- Modal.svelte -->
<script lang="ts">
  export let open = false;
  export let title: string;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  
  function close() {
    open = false;
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <div class="modal-backdrop" on:click={close}>
    <div 
      class="modal modal--{size}"
      on:click|stopPropagation
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <header class="modal-header">
        <h2 id="modal-title">{title}</h2>
        <button on:click={close} class="modal-close" aria-label="Close">
          <X />
        </button>
      </header>
      
      <div class="modal-body">
        <slot />
      </div>
      
      {#if $$slots.footer}
        <footer class="modal-footer">
          <slot name="footer" />
        </footer>
      {/if}
    </div>
  </div>
{/if}
```

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.modal {
  background: var(--color-bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp var(--duration-normal) var(--ease-out);
}

.modal--sm { width: 400px; }
.modal--md { width: 560px; }
.modal--lg { width: 720px; }

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.modal-body {
  padding: var(--space-6);
  overflow-y: auto;
}

.modal-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

### Loading States

#### Spinner

```svelte
<!-- Spinner.svelte -->
<script lang="ts">
  export let size: 'sm' | 'md' | 'lg' = 'md';
</script>

<svg 
  class="spinner spinner--{size}"
  viewBox="0 0 24 24"
  aria-label="Loading"
>
  <circle 
    cx="12" cy="12" r="10" 
    stroke="currentColor" 
    stroke-width="4"
    fill="none"
    opacity="0.25"
  />
  <path 
    d="M12 2a10 10 0 0 1 10 10"
    stroke="currentColor"
    stroke-width="4"
    fill="none"
    stroke-linecap="round"
  />
</svg>
```

```css
.spinner {
  animation: spin 1s linear infinite;
}

.spinner--sm { width: 16px; height: 16px; }
.spinner--md { width: 24px; height: 24px; }
.spinner--lg { width: 40px; height: 40px; }

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

#### Skeleton

```svelte
<!-- Skeleton.svelte -->
<script lang="ts">
  export let width = '100%';
  export let height = '1rem';
  export let rounded = false;
</script>

<div 
  class="skeleton"
  class:rounded
  style="width: {width}; height: {height};"
/>
```

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-neutral-200) 25%,
    var(--color-neutral-100) 50%,
    var(--color-neutral-200) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

.skeleton.rounded {
  border-radius: var(--radius-full);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

### Toasts / Notifications

```svelte
<!-- Toast.svelte -->
<script lang="ts">
  export let type: 'success' | 'error' | 'warning' | 'info' = 'info';
  export let message: string;
  export let dismissible = true;
  
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };
</script>

<div class="toast toast--{type}" role="alert">
  <svelte:component this={icons[type]} class="toast-icon" />
  <p class="toast-message">{message}</p>
  {#if dismissible}
    <button class="toast-dismiss" aria-label="Dismiss">
      <X size={16} />
    </button>
  {/if}
</div>
```

```css
.toast {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  animation: slideIn var(--duration-normal) var(--ease-out);
}

.toast--success {
  background: var(--color-secondary-50);
  border-left: 4px solid var(--color-success);
}

.toast--error {
  background: #fef2f2;
  border-left: 4px solid var(--color-error);
}

.toast--warning {
  background: #fffbeb;
  border-left: 4px solid var(--color-warning);
}

.toast--info {
  background: #eff6ff;
  border-left: 4px solid var(--color-info);
}
```

---

### Empty States

```svelte
<!-- EmptyState.svelte -->
<script lang="ts">
  export let icon: any;
  export let title: string;
  export let description: string;
  export let actionLabel: string | null = null;
  export let onAction: (() => void) | null = null;
</script>

<div class="empty-state">
  <svelte:component this={icon} class="empty-icon" />
  <h3 class="empty-title">{title}</h3>
  <p class="empty-description">{description}</p>
  {#if actionLabel && onAction}
    <button class="btn btn-primary" on:click={onAction}>
      {actionLabel}
    </button>
  {/if}
</div>
```

```css
.empty-state {
  text-align: center;
  padding: var(--space-12);
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: var(--color-neutral-400);
  margin-bottom: var(--space-4);
}

.empty-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-2);
}

.empty-description {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
}
```

---

## Page Layouts

### Dashboard Layout

```
┌────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌─────────────────────────────────────────────────┐  │
│ │          │ │ Header (breadcrumb + user menu)                 │  │
│ │          │ ├─────────────────────────────────────────────────┤  │
│ │ Sidebar  │ │                                                 │  │
│ │          │ │  ┌─────────────┐  ┌─────────────┐              │  │
│ │ - Home   │ │  │ Visibility  │  │ This Week   │              │  │
│ │ - Proj   │ │  │   Score     │  │   Summary   │              │  │
│ │ - Report │ │  └─────────────┘  └─────────────┘              │  │
│ │ - Settings│ │                                                │  │
│ │          │ │  ┌───────────────────────────────────────────┐ │  │
│ │          │ │  │ Query Results Table                       │ │  │
│ │          │ │  │                                           │ │  │
│ │          │ │  └───────────────────────────────────────────┘ │  │
│ │          │ │                                                 │  │
│ └──────────┘ └─────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

### Landing Page Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  Logo                                    [Login] [Get Started]     │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│           See how AI sees you                                      │
│           ─────────────────────                                    │
│           Tagline text here                                        │
│                                                                    │
│                    [Run Free Scan]                                 │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                          Trust Block                               │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│    ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│    │ Feature  │    │ Feature  │    │ Feature  │                   │
│    │    1     │    │    2     │    │    3     │                   │
│    └──────────┘    └──────────┘    └──────────┘                   │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                         Pricing Section                            │
├────────────────────────────────────────────────────────────────────┤
│                              FAQ                                   │
├────────────────────────────────────────────────────────────────────┤
│                            Footer                                  │
└────────────────────────────────────────────────────────────────────┘
```

---

## Responsive Breakpoints

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}

/* Usage */
@media (min-width: 768px) {
  .sidebar {
    display: flex;
  }
}

@media (max-width: 767px) {
  .sidebar {
    display: none;
  }
  
  .mobile-nav {
    display: block;
  }
}
```

---

## Dark Mode Implementation

```svelte
<!-- ThemeToggle.svelte -->
<script lang="ts">
  import { browser } from '$app/environment';
  
  let theme = browser ? localStorage.getItem('theme') || 'light' : 'light';
  
  function toggle() {
    theme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }
</script>

<button on:click={toggle} aria-label="Toggle theme">
  {#if theme === 'light'}
    <Moon />
  {:else}
    <Sun />
  {/if}
</button>
```

```css
/* Apply theme on load */
:root {
  color-scheme: light;
}

:root[data-theme="dark"] {
  color-scheme: dark;
  
  --color-bg-primary: var(--color-neutral-900);
  --color-bg-secondary: var(--color-neutral-800);
  --color-text-primary: var(--color-neutral-50);
  --color-text-secondary: var(--color-neutral-300);
  --color-border: var(--color-neutral-700);
}
```

---

## Z-Index Scale

```css
:root {
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-fixed: 30;
  --z-modal-backdrop: 40;
  --z-modal: 50;
  --z-popover: 60;
  --z-tooltip: 70;
  --z-toast: 80;
}
```
