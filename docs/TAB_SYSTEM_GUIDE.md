# DUKOPS Modern Tab System - Quick Reference

## 📱 Tab System Styling Features

### Visual Effects
- **Glassmorphism**: Frosted glass background dengan blur effect
- **Smooth Transitions**: 0.5s cubic-bezier animations
- **Active Indicator**: Animated bar yang mengikuti active tab
- **Glow Effects**: Radial gradient glow pada active state
- **Ripple Animation**: Effect saat tab diklik

### States

#### Default State
```css
color: rgba(255, 255, 255, 0.7);
background: transparent;
```

#### Hover State
```css
color: rgba(255, 255, 255, 0.95);
background: rgba(255, 255, 255, 0.08);
transform: translateY(-3px);
```

#### Active State
```css
color: #ffffff;
background: linear-gradient(135deg, #4CAF50, #2b4d2b);
box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
transform: translateY(-2px) scale(1.02);
```

### Status Colors

#### ON State (Success - Green)
```html
<button class="tab-button active on">
    <i class="fas fa-check"></i>
    Status
    <span class="tab-status">ON</span>
</button>
```
- Color: #66bb6a
- Animation: pulseGreen (2s infinite)
- Badge: Green background

#### OFF State (Error - Red)
```html
<button class="tab-button active off">
    <i class="fas fa-times"></i>
    Status
    <span class="tab-status">OFF</span>
</button>
```
- Color: #ff8a80
- Animation: pulseRed (2s infinite)
- Badge: Red background

### Responsive Breakpoints

#### Desktop (> 768px)
- Full glassmorphic design
- Horizontal tabs dengan smooth transitions
- Tab indicator bergerak smooth

#### Tablet (480px - 768px)
- Smaller padding dan font-size
- Reduced gap antara elements
- Border width 1.5px

#### Mobile (< 480px)
- Vertical tab layout (flex-direction: column)
- Tab indicator hilang (display: none)
- Larger touch area untuk accessibility
- Responsive badge positioning

## 🚀 Usage Examples

### HTML Structure
```html
<div class="tab-system">
    <div class="tab-container">
        <div class="tab-indicator"></div>
        
        <button class="tab-button active" data-tab="dukops">
            <i class="fas fa-file-alt"></i>
            DUKOPS
            <span class="tab-status">ON</span>
        </button>
        
        <button class="tab-button" data-tab="jadwal">
            <i class="fas fa-calendar"></i>
            Jadwal
            <span class="tab-status">OFF</span>
        </button>
    </div>
</div>
```

### JavaScript Integration
```javascript
import { TabSystem } from './js/components/TabSystem.js';

// Initialize
const tabSystem = new TabSystem({
    containerSelector: '.tab-container',
    buttonSelector: '.tab-button',
    indicatorSelector: '.tab-indicator',
    onTabChange: (index, button) => {
        console.log(`Tab ${index} activated`);
        
        // Show/hide content based on tab
        document.querySelectorAll('.tab-content').forEach((el, i) => {
            el.style.display = i === index ? 'block' : 'none';
        });
    }
});

// Change tab programmatically
tabSystem.selectTab(1);

// Set status
tabSystem.setStatus(0, 'on');      // Green (active, ON)
tabSystem.setStatus(1, 'off');     // Red (active, OFF)

// Show loading state
tabSystem.setLoading(0, true);     // Show spinner
tabSystem.setLoading(0, false);    // Hide spinner

// Badge notification
tabSystem.showBadge(0, '3');       // Show "3"
tabSystem.removeBadge(0);          // Remove badge

// Get current state
console.log(tabSystem.getCurrentIndex());    // Current tab index
console.log(tabSystem.getCurrentButton());   // Current button element
console.log(tabSystem.getButtonCount());     // Total buttons
```

### CSS Classes Mapping

| Class | Purpose | States |
|-------|---------|--------|
| `.tab-system` | Container wrapper | - |
| `.tab-container` | Tabs container | - |
| `.tab-indicator` | Active state indicator | Animated |
| `.tab-button` | Individual tab | active, on, off, loading |
| `.tab-status` | Status badge | - |
| `.tab-badge` | Notification badge | Animated float |

### Animation Keyframes Available

```css
@keyframes pulseGreen   /* ON state pulse */
@keyframes pulseRed     /* OFF state pulse */
@keyframes glowPulse    /* Active glow effect */
@keyframes ripple       /* Click ripple effect */
@keyframes badgeFloat   /* Badge floating animation */
@keyframes spinLoader   /* Loading spinner */
@keyframes successFlash /* Success animation */
@keyframes errorShake   /* Error shake animation */
```

## 🎨 CSS Customization

### Change Primary Color
```css
:root {
    --color-primary: #4CAF50;
    --color-primary-dark: #2b4d2b;
}
```

### Custom Variant - Minimal Style
```html
<div class="tab-system variant-minimal">
    <!-- Tabs akan memiliki style minimalis -->
</div>
```

### Custom Variant - Glass Effect
```html
<div class="tab-system variant-glass">
    <!-- Tabs akan lebih transparan dengan blur lebih besar -->
</div>
```

## ♿ Accessibility Features

- **Keyboard Navigation**: Arrow Left/Right untuk switch tabs
- **ARIA Attributes**: Bisa ditambahkan untuk screen readers
- **High Contrast Mode**: Responsive terhadap prefers-contrast
- **Reduced Motion**: Animations hilang untuk prefers-reduced-motion

### Keyboard Controls
```javascript
// Arrow Left - go to previous tab
// Arrow Right - go to next tab
// Tab - navigate ke button berikutnya
// Enter/Space - activate tab
```

## 🔄 Integration dengan Feature Lain

### Dengan DUKOPS Form
```javascript
tabSystem.setStatus(0, 'on');  // Tab DUKOPS aktif
// Tampilkan form DUKOPS
```

### Dengan Attendance Panel
```javascript
// Update tab status berdasarkan attendance data
if (attendanceData.submitted) {
    tabSystem.setStatus(1, 'on');
    tabSystem.showBadge(1, attendanceData.count);
}
```

### Dengan Jadwal Piket
```javascript
// Show badge saat ada selection
tabSystem.showBadge(2, '📋');

// Update status saat message generated
tabSystem.setStatus(2, 'on');
```

## 📊 Performance Tips

1. **Lazy Initialize**: Inisialisasi TabSystem hanya saat diperlukan
2. **Event Delegation**: Gunakan event bubbling untuk multiple tabs
3. **CSS Optimization**: Use CSS variables untuk dynamic theming
4. **Animation Performance**: GPU-accelerated dengan transform dan opacity

## 🐛 Common Issues & Solutions

### Tab Indicator Tidak Bergerak
**Solution**: Pastikan `.tab-indicator` ada di DOM
```html
<div class="tab-container">
    <div class="tab-indicator"></div>  <!-- Required! -->
    <button class="tab-button">...</button>
</div>
```

### Status Badge Tidak Tampil
**Solution**: Pastikan struktur yang benar
```html
<button class="tab-button on">
    <span class="tab-status">ON</span>  <!-- Harus ada di button -->
</button>
```

### Responsive Tidak Bekerja
**Solution**: Pastikan viewport meta tag ada di HTML
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Animasi Terlalu Cepat/Lambat
**Solution**: Ubah transition duration di CSS atau JavaScript
```javascript
tabSystem.options.transitionDuration = 800; // ms
```

## 📝 HTML Template

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <!-- Tab System -->
    <div class="tab-system">
        <div class="tab-container">
            <div class="tab-indicator"></div>
            
            <button class="tab-button active on" data-tab="dukops">
                <i class="fas fa-file-alt"></i>
                DUKOPS
                <span class="tab-status">ON</span>
            </button>
            
            <button class="tab-button off" data-tab="jadwal">
                <i class="fas fa-calendar"></i>
                Jadwal Piket
                <span class="tab-status">OFF</span>
            </button>
        </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content" id="dukops">
        <!-- DUKOPS Form -->
    </div>
    
    <div class="tab-content" id="jadwal" style="display: none;">
        <!-- Jadwal Piket Form -->
    </div>

    <!-- Scripts -->
    <script type="module" src="js/index.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

## 🎯 Production Checklist

- [x] Tab System CSS loaded
- [x] JavaScript modules initialized
- [x] Responsive design tested on all breakpoints
- [x] Keyboard navigation working
- [x] Performance optimized
- [x] Accessibility verified
- [x] Browser compatibility checked
- [x] Mobile touch events working

---

**Last Updated**: 28 Januari 2026
