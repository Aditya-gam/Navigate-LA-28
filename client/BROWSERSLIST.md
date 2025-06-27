# Browserslist Configuration

This project uses [Browserslist](https://browsersl.ist/) to configure browser targets for Babel, Autoprefixer, and other tools.

## Configuration

The browser targets are defined in `.browserslistrc` and are used by:
- **Babel** - for JavaScript transpilation
- **Autoprefixer** - for CSS vendor prefixes
- **ESLint** - for linting rules
- **PostCSS** - for CSS processing

## Browser Support

### Production Environment
- **Coverage**: ~86.61% of global users
- **Criteria**:
  - Browsers with >0.5% market share
  - Last 2 versions of major browsers
  - Excludes dead browsers and very old versions
  - No Internet Explorer support
  - No Opera Mini support
  - No Android < 4.4 support
  - No Safari/iOS Safari < 12 support

### Development Environment
- Last 2 versions of Chrome, Firefox, Safari, and Edge
- Optimized for faster builds and modern debugging features

## Scripts

- `npm run browserslist:check` - Show which browsers are targeted
- `npm run browserslist:coverage` - Show global coverage percentage
- `npm run browserslist:update` - Update caniuse database

## Maintenance

The browserslist database should be updated regularly to ensure accurate browser data:

```bash
npm run browserslist:update
```

This is automatically run as part of the `npm run validate` command.

## Browser Requirements

This application requires:
- Chrome 131+
- Firefox 138+
- Safari 16.6+
- Edge 135+
- iOS Safari 16.6+
- Android Chrome 131+

## Performance Impact

The current configuration balances:
- **Bundle size** - Modern browsers require less polyfills
- **Coverage** - Supports 86.61% of global users
- **Performance** - Focuses on browsers with good JavaScript engine performance
- **Security** - Excludes browsers with known security issues

## Updating Configuration

When updating browser targets:
1. Update `.browserslistrc`
2. Run `npm run browserslist:update`
3. Check coverage with `npm run browserslist:coverage`
4. Test the build with `npm run build`
5. Update this documentation if needed 