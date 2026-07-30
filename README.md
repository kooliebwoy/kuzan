# kuzan

Server-rendered HTML component library for Koze-compatible apps.

## Install

```bash
npm install @kuratchi/kuzan
```

## Wire it up

Three steps. There is no framework-level configuration — `kuzan` is a regular package consumed via imports.

**1. Import the theme stylesheet** from your global CSS (`src/app.css`):

```css
/* src/app.css */
@import '@kuratchi/kuzan/styles/theme.css';
```

The framework auto-discovers `src/app.css` and injects `<link rel="stylesheet">` into the app shell. You don't write the `<link>` tag.

**2. Set the initial color scheme** on `<html>` in your layout:

```html
<!-- src/routes/layout.koze -->
<html lang="en" class="dark">
```

Use `class="dark"` for dark mode, omit the class for light, or `data-theme="system"` to follow the OS preference.

**3. (Optional) Add `<ThemeInit />`** to `<head>` to prevent flash-of-wrong-theme on hydration:

```html
<script>
  import ThemeInit from '@kuratchi/kuzan/theme-init.koze';
</script>

<html lang="en" class="dark">
  <head>
    <ThemeInit />
  </head>
  <body><slot></slot></body>
</html>
```

## Component usage

```html
<script>
  import Badge from '@kuratchi/kuzan/badge.koze';
  import Card from '@kuratchi/kuzan/card.koze';
  import AuthCard from '@kuratchi/kuzan/auth-card.koze';
  import Alert from '@kuratchi/kuzan/alert.koze';
  import EmptyState from '@kuratchi/kuzan/empty-state.koze';
</script>

<Card title="Welcome">
  <Badge data_variant="success">Active</Badge>
  <Alert data_variant="info">Heads up.</Alert>
</Card>
```

## License and use

MIT licensed. You can use, copy, modify, merge, publish, distribute,
sublicense, and sell copies of this package for personal, internal, commercial,
or open source projects. Keep the copyright and license notice with substantial
copies of the software. This package is provided as-is, without warranty.

## Notes

- Components are `.koze` files compiled by Koze. They aren't a generic Svelte/React/Vue component library, they're framework-specific (the same way `bits-ui` is Svelte-specific).
- Theme stylesheet ships at `kuzan/styles/theme.css` — import it from `src/app.css`.
- For Tailwind, install `@tailwindcss/vite` and add it to `vite.config.ts`. See the [Theming docs](../../apps/docs/src/content/kuzan/theming.md).
