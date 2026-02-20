# HB418 Research: JSON Export Button Patterns

**Date:** 2026-02-20
**Query:** "vanilla JavaScript JSON export download button UI pattern 2025"

## Sources Found

### 1. Stack Overflow - Download JSON object as file
- **URL:** https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
- **Key Pattern:** Create anchor element with data URL
```javascript
function downloadObjectAsJson(exportObj, exportName) {
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
```

### 2. Stack Overflow - React JSON export (no server)
- **URL:** https://stackoverflow.com/questions/55613438/reactwrite-to-json-file-or-export-download-no-server
- **Key Pattern:** data:text/json;charset=utf-8 with encodeURIComponent

### 3. GeeksforGeeks - Download file with Vanilla JS (Aug 2025)
- **URL:** https://www.geeksforgeeks.org/javascript/download-any-file-from-url-with-vanilla-javascript/
- **Key Pattern:** Fetch + blob handling for URL-based downloads

## Implementation Plan

1. **Export Function:** `exportKanbanState()` - exports statusOverrides as JSON
2. **UI Button:** Add "Export State" button to kanban header
3. **File Format:** `nox-kanban-backup-YYYY-MM-DD.json`
4. **Data Structure:** `{ briefId: status, ... }` from localStorage overrides
5. **Additional Button:** "Clear State" for reset functionality (existing method wired up)

## Research Commit Hash
This file committed as part of HB418 to verify research phase for auditor.
