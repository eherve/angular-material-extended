# Angular Material Avatar

Standalone `AvatarComponent` (`app-avatar`), Angular 22+. Import directly from
`@eherve/angular-material-avatar`.

```ts
import { AvatarComponent } from '@eherve/angular-material-avatar';
// Add AvatarComponent to the consuming component or NgModule imports.
```

```html
<app-avatar [email]="user.email" [name]="user.name" size="24" />
<app-avatar value="+ 3" size="24" [textSizeRatio]="2" />
```

| Input | Default | Contract |
| --- | --- | --- |
| `email` | unset | Optional nullable string. Trimmed and lowercased before MD5 hashing. |
| `name` | unset | Optional nullable string; uppercase initials of all words. |
| `value` | unset | Optional nullable fallback text when name is absent. |
| `size` | `50` | Pixel dimensions; numeric HTML attributes accepted. Invalid/nonpositive sizes use 50. |
| `round` | `true` | Boolean attribute; false gives square corners. |
| `bgColor` | unset | Explicit fallback background, taking priority over theme defaults. |
| `fgColor` | theme token / white | Explicit fallback text color, taking priority over theme defaults. |
| `textSizeRatio` | `3` | Font size = floor(size / ratio); invalid/nonpositive ratio uses 3. |

Gravatar uses HTTPS, `d=404`, and double resolution on high density displays.
Image errors show initials or text. A changed normalized email or image size starts
a new image attempt. No email means no request. MD5 uses the declared `ts-md5`
dependency. Inputs and derived rendering update reactively.

Public CSS properties: `--ngx-mat-avatar-color`, `--ngx-mat-avatar-background`,
and `--ngx-mat-avatar-palette-1` through `--ngx-mat-avatar-palette-8`. Palette
selection is deterministic from name/text. Explicit color inputs win over tokens.
Tooltips, menus and click handlers belong on the component host.

Build: `npm run build:avatar`. Tests: `npm run test:avatar`.
