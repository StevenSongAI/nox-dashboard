# Builder Verification Protocol

**Purpose:** Prevent false claims about implemented features. All dashboard features MUST be verified in browser before marking complete.

---

## Pre-Flight Checklist

Before claiming any feature is "working", verify ALL of the following:

### 1. Browser Verification (REQUIRED)
- [ ] Open Chrome to https://stevensongai.github.io/nox-dashboard/
- [ ] Hard refresh (Cmd+Shift+R) to clear cache
- [ ] Open DevTools (F12) → Console tab
- [ ] Clear console (click 🚫)

### 2. Feature Testing

**For Buttons:**
- [ ] Button is visible and clickable
- [ ] Click produces expected action
- [ ] No console errors after click
- [ ] UI updates reflect the action

**For Forms:**
- [ ] Form opens when triggered
- [ ] All fields accept input
- [ ] Submit button works
- [ ] Data persists after refresh (localStorage verification)
- [ ] Success/error feedback shown

**For Data Display:**
- [ ] Data loads without errors
- [ ] All expected items shown
- [ ] Empty states handled gracefully
- [ ] Loading states visible during fetch

**For Modals:**
- [ ] Opens when triggered
- [ ] Closes with × button
- [ ] Closes with Escape key
- [ ] Closes with background click
- [ ] Focus trapped inside modal

### 3. localStorage Verification

For any feature using localStorage:
- [ ] Open DevTools → Application → Local Storage
- [ ] Verify keys are created/updated
- [ ] Refresh page → verify data persists
- [ ] Verify correct JSON structure

### 4. Cross-Browser Check (if time permits)
- [ ] Works in Chrome
- [ ] Works in Safari (basic functionality)

---

## Common Builder Lies to Watch For

| Claim | Reality | How to Verify |
|-------|---------|---------------|
| "Button added" | Button not visible or not clickable | Screenshot of button in UI, test click |
| "Form opens" | Modal structure exists but doesn't trigger | Record click → open modal → close |
| "Data saves" | localStorage.setItem called but wrong key | Check Application tab, verify key/value |
| "Function works" | Function exists but has logic errors | Test full user flow end-to-end |
| "Feature complete" | Partial implementation | Test every acceptance criterion |

---

## Red Flags

**STOP and VERIFY if builder claims:**
- "Should work" (not "I tested and it works")
- "Added the code" (not "Verified in browser")
- Any feature without console verification screenshot
- Any localStorage feature without Application tab verification

---

## Report Requirements

Every builder report must include:

1. **Screenshots** of feature working in browser
2. **Console output** (should be empty or only expected logs)
3. **localStorage keys** created/verified
4. **Test steps** actually performed
5. **Git commit hash** with changes

---

## Enforcement

**If verification is skipped:**
1. Red Team will catch false claims
2. Feature marked as FAILED
3. Builder must re-do with stricter verification
4. Pattern of false claims = builder blacklisted from this project

---

## Quick Test Commands

```javascript
// Test localStorage
JSON.parse(localStorage.getItem('content-briefs') || '[]')
JSON.parse(localStorage.getItem('opportunities') || '[]')
JSON.parse(localStorage.getItem('watchlist') || '[]')

// Clear localStorage for fresh test
localStorage.clear()

// Check for JS errors
// DevTools Console should show: "No issues"
```

---

**This protocol is MANDATORY for all dashboard work.**
**Last updated:** 2026-02-09 by Nox Learning Cycle
