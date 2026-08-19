# JR-Userscripts

A collection of userscripts to enhance web browsing experience. This repository contains high-quality, well-maintained scripts for various websites.

---

## 📺 Pornhub v18.3.1 Userscript

### Overview

**Pornhub v18.3.1** is a comprehensive userscript that redesigns the Pornhub layout for a superior viewing experience. It creates a uniform 2-column grid layout across ALL pages and enlarges the video player on watch pages while removing clutter like ads, sidebars, and unnecessary content.

**Version:** 18.3.1  
**Namespace:** Tampermonkey  
**License:** Compatible with Tampermonkey/Greasemonkey

---

## ✨ Key Features

### 1. **Uniform 2-Column Grid Layout**
- Applies the proven homepage thumbnail grid design to **every page** (category pages, search results, playlists, related videos)
- **16:9 aspect ratio** for all thumbnails ensuring consistent appearance
- **Viewport-relative sizing** (80% width, max 1080px) that adapts to any screen size
- Grid automatically centers and maintains proportional spacing regardless of screen resolution
- Gap spacing: 44px vertical, 20px horizontal between thumbnails

### 2. **Enlarged Video Player (Watch Pages)**
- Player expanded to **80% of viewport width** (80vw) for immersive viewing
- Player remains **centered and visible** at all times
- Adaptive sizing that respects responsive design principles
- Works with multiple player engine variations (mgp-powered players)

### 3. **Clutter Removal**
Automatically hides:
- ✓ All ads and ad containers (traffic-junky, bottom/footer ads, wide ads)
- ✓ Promotional content and sponsorships
- ✓ Right sidebar column (ad placement area beside player)
- ✓ Footer content and SEO text
- ✓ Recommended pornstars section
- ✓ Multiple language recommendations
- ✓ Payment/subscription overlays

**Safety Note:** Script intelligently preserves the actual video player engine (.mgp and related containers) to prevent accidentally hiding the video.

### 4. **Smart Scroll-to-Top Button**
- Circular button with upward arrow (▲)
- Positioned in bottom-left corner
- Smoothly scrolls page to top with animation
- Appears automatically after scrolling 500px down
- Styled with:
  - Dark background (#1c1c1c)
  - White text
  - Hover effect: Orange background (#ff9000) with slight scale increase
  - Subtle shadow for depth
  - High z-index (999999) to stay above all content

### 5. **Full-Width Content**
- Removes all width caps and maximum-width constraints
- Forces all containers to fill the available viewport
- Eliminates restrictive padding that limits content display
- Ensures thumbnails never collapse to default small sizes

### 6. **Hover Preview Support**
- Maintains thumbnail hover preview functionality (hover video previews)
- Both static images and hover video previews respect the 16:9 layout
- Uses `object-fit: cover` to ensure proper scaling without distortion

---

## 📋 How It Works

### Initialization Process

1. **Initial Setup** (on page load)
   - Injects custom CSS rules via `GM_addStyle()`
   - Detects if current page is a video watch page
   - Applies grid layout to all listing containers
   - Centers video player if on watch page

2. **Dynamic Content Handling**
   - Uses **MutationObserver** to detect DOM changes (lazy-loading, tab switches, dynamic content)
   - Runs updates every 400ms when mutations are detected
   - Ensures newly loaded content gets properly styled

3. **Navigation Tracking**
   - Hooks into `history.pushState` to detect AJAX-based navigation
   - Monitors `popstate` events for browser back/forward navigation
   - Reapplies styling after navigation completes (400ms delay)

4. **Fallback Updates**
   - Runs updates on an interval (800ms) up to 8 times for reliability
   - Catches any content that might have been missed by observers

### Core Functions

#### `isVideoPage()`
Detects if the current page is a video watch page by checking for `view_video.php` in the URL.

#### `isLikelyVideoCard(el)`
Identifies video thumbnail elements by checking for known class patterns:
- `.pcVideoListItem`, `.videoblock`, `.ph-video-block`, `.full-width`
- `<li>` elements containing thumbnail indicators (`.js-videoThumb`, `.videoPreviewBg`, etc.)

#### `getCardNodes()`
Discovers all video thumbnail cards on the page using multiple selection strategies to ensure comprehensive coverage.

#### `discoverGridContainers(cards)`
Identifies parent containers that hold 4+ video cards, marking them for grid transformation.

#### `fixThumbSizes()`
Overrides hardcoded thumbnail dimensions (320x180) and forces them to:
- 530x298.13px (16:9 aspect ratio)
- 100% width/height with `object-fit: cover`
- Prevents thumbnail collapse regardless of parent CSS

#### `applyGridToContainer(g)`
Transforms any container into a uniform 2-column grid by:
1. Removing conflicting layout classes (col-2, col-3, col-4, etc.)
2. Adding `.ph-grid-2col` class and styling
3. Marking children as `.ph-card-2col` cards
4. Setting CSS Grid properties for 2-column layout
5. Calling `fillWidth()` to remove parent width restrictions

#### `centerPlayer()`
Customizes watch page layout:
- Centers the main player container using flexbox
- Enlarges player to 80vw width
- Removes sidebar content
- Ensures player visibility by targeting all known player wrapper patterns
- Removes playlist width caps for consistency

#### `fillWidth(el)`
Recursively removes width restrictions (up 8 levels) from an element and its parents:
- Sets `max-width: none` and `width: 100%`
- Removes left/right padding
- Allows content to expand to full viewport

---

## 🔧 Installation Guide

### Step 1: Install a Userscript Manager
You need a browser extension to run userscripts. Choose one:
- **Tampermonkey** (recommended, multi-browser) - https://www.tampermonkey.net/
- **Greasemonkey** (Firefox) - https://addons.mozilla.org/firefox/addon/greasemonkey/
- **Violentmonkey** (Chrome/Brave/Edge) - https://violentmonkey.github.io/

### Step 2: Install the Script
1. Download or copy the `pornhubscript-18.3.1.js` file
2. In your userscript manager, select **"Create a new script"** or **"Import script"**
3. Paste the entire script content
4. Click **Save**
5. Ensure the script is **Enabled** in your userscript manager dashboard

### Step 3: Verify Installation
- Navigate to pornhub.com (or .org or .rt.pornhub.com)
- Look for the **scroll-to-top button** (▲) in the bottom-left corner
- Check that thumbnails display in a 2-column grid
- If on a watch page, the player should be centered and enlarged

### Supported Domains
The script automatically runs on:
- `*://*.pornhub.com/*`
- `*://*.pornhub.org/*`
- `*://*.rt.pornhub.com/*`

---

## 📊 Technical Specifications

| Aspect | Details |
|--------|---------|
| **Script Name** | Pornhub v18.3.1 |
| **Version** | 18.3.1 |
| **Execution Time** | document-idle (waits for DOM ready) |
| **Permissions** | `GM_addStyle` (CSS injection only) |
| **Grid Layout** | 2 columns, CSS Grid |
| **Responsive Width** | `min(80vw, 1080px)` |
| **Player Width (Video Pages)** | 80vw |
| **Thumbnail Aspect Ratio** | 16:9 |
| **Scroll-to-Top Trigger** | 500px scroll depth |
| **DOM Monitoring** | MutationObserver + fallback interval |
| **Update Debounce** | 400ms |
| **Fallback Retry Count** | 8 iterations at 800ms intervals |

---

## 🎨 Visual Customization

### Scroll-to-Top Button Styling
Located in the CSS section (lines 98-108), you can customize:
```javascript
#ph-scroll-top-btn {
  position: fixed; bottom: 24px; left: 24px;      // Position
  width: 46px; height: 46px;                       // Size
  background: #1c1c1c; color: #fff;              // Colors
  border: 1px solid #555;                         // Border
  border-radius: 50%;                             // Circular
  z-index: 999999;                                // Layer
  box-shadow: 0 4px 14px rgba(0,0,0,.45);        // Shadow
}
```

**Hover Effect:**
```javascript
#ph-scroll-top-btn:hover {
  background: #ff9000;  // Orange on hover
  color: #000;
  border-color: #ff9000;
  transform: scale(1.07);  // Slight zoom
}
```

### Grid Customization (Advanced)
To adjust the grid layout, modify these CSS properties in the `.ph-grid-2col` section:

- **Column Count:** Change `repeat(2, ...)` to `repeat(3, ...)` for 3 columns
- **Grid Gap:** Adjust `gap: 44px 20px` (vertical and horizontal spacing)
- **Maximum Width:** Modify `min(80vw, 1080px)` to preferred width
- **Thumbnail Aspect Ratio:** Change `aspect-ratio: 16 / 9` in `.phimage` section

---

## 🔍 Troubleshooting

### Script Not Working?
1. ✓ Confirm your userscript manager is enabled
2. ✓ Check that the script is enabled in your manager's dashboard
3. ✓ Verify the URL matches one of the supported domains
4. ✓ Check browser console (F12 > Console) for errors
5. ✓ Try refreshing the page or clearing browser cache

### Grid Layout Not Appearing?
- The script uses high `!important` priorities to override site CSS
- If still not working, check if site layout changed (submit issue with screenshot)
- Try disabling other userscripts to check for conflicts

### Player Not Centered/Enlarged?
- This only applies to watch pages (URLs containing `view_video.php`)
- Confirm you're on an actual video watch page, not a playlist or category page

### Scroll-to-Top Button Not Showing?
- Button appears after scrolling 500px down the page
- Check if bottom-left corner is clear (some pages may have overlapping elements)
- Button has `z-index: 999999` but site may override it

---

## 📝 Version History

### v18.3.1 (Current)
- Uniform 2-column grid on all pages
- Enlarged 80vw player on watch pages
- Comprehensive ad removal
- Scroll-to-top button
- Smart DOM mutation handling
- Navigation-aware updates
- Multiple player engine compatibility

---

## ⚠️ Disclaimer

This userscript is provided as-is for personal use. Users are responsible for:
- Compliance with local laws and website terms of service
- Reviewing and understanding the script before installation
- Any consequences resulting from script usage

This script does **not**:
- Download or store content
- Bypass authentication or access controls
- Collect or transmit user data
- Modify server-side functionality

---

## 🤝 Contributing

To report bugs, suggest improvements, or contribute enhancements:
1. Open an issue with a clear description
2. Include browser, OS, and version information
3. Provide screenshots when possible
4. Submit pull requests with improvements

---

## 📄 License

See LICENSE file in repository for details.

---

**Last Updated:** Version 18.3.1  
**Maintained By:** JR-REPOS
