## Use official Gully Stray Care logo

Replace the placeholder primary-colored circle currently used as the logo in the Navbar and Footer with the uploaded official logo image.

### Steps

1. Copy `user-uploads://image.png` → `src/assets/logo.png`.
2. `src/components/Navbar.tsx`: import logo, replace the `<div className="size-8 bg-primary rounded-full" />` with `<img src={logo} alt="Gully Stray Care — Life Matters" className="size-10 object-contain" />`.
3. `src/components/Footer.tsx`: same swap for the small footer mark (size-7).
4. Also use the logo as the favicon by adding a `link rel="icon"` entry in `src/routes/__root.tsx` head links.

### Notes

- Logo has a cream background; it will sit fine on the current cream `--background`. No tint/recolor applied — it's the official mark.
- No other UI/content changes.
