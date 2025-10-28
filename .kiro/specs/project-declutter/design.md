# Design Document

## Overview

This design outlines a systematic approach to declutter the Ethio Herd Connect project by organizing 120+ documentation files into a professional, maintainable structure. The solution uses a phased approach with safety mechanisms (manifests) to ensure no information is permanently lost.

## Architecture

### Target Directory Structure

```
ethio-herd-connect/
├── README.md                          # Main project documentation
├── package.json                       # Dependencies
├── .env.example                       # Environment template
├── .gitignore                        # Git ignore rules
├── index.html                        # Entry point
├── CRITICAL_BUGS_TRACKING.md         # Active bug tracking (if exists)
├── QUICK_START_ACTION_PLAN.md        # Active quick start (if exists)
│
├── docs/                             # All documentation
│   ├── README.md                     # Documentation navigation hub
│   │
│   ├── guides/                       # Active guides
│   │   ├── APPLICATION_DEMO_GUIDE.md
│   │   ├── MVP_AUTH_INTEGRATION_GUIDE.md
│   │   └── SUPABASE_SETUP_GUIDE.md
│   │
│   ├── testing/                      # Testing documentation
│   │   ├── README.md                 # Testing index
│   │   ├── guides/                   # Test guides
│   │   │   ├── AUTHENTICATION_TEST_GUIDE.md
│   │   │   ├── OFFLINE_TESTING_GUIDE.md
│   │   │   ├── PERFORMANCE_TESTING_GUIDE.md
│   │   │   └── ERROR_HANDLING_TEST_GUIDE.md
│   │   └── reports/                  # Test reports
│   │       ├── FINAL_TESTING_REPORT.md
│   │       └── TEST_FIXES_SUMMARY.md
│   │
│   ├── features/                     # Feature documentation
│   │   ├── README_CALENDAR_FEATURE.md
│   │   ├── README_PHASE3_COMPLETE.md
│   │   └── ETHIOPIAN_REALITY_IMPROVEMENTS.md
│   │
│   ├── security/                     # Security docs
│   │   └── SECURITY_AUDIT_REPORT.md
│   │
│   └── archive/                      # Historical documentation
│       ├── DELETION_MANIFEST.md      # Record of deleted files
│       ├── MOVE_MANIFEST.md          # Record of moved files
│       │
│       ├── completed-tasks/          # Task completion reports
│       │   ├── TASK_2_COMPLETION_SUMMARY.md
│       │   ├── TASK_3_HOME_DASHBOARD_COMPLETE.md
│       │   └── [30+ other task files]
│       │
│       ├── phases/                   # Phase completion docs
│       │   ├── PHASE3_COMPLETION_CERTIFICATE.md
│       │   ├── PHASE3_FINAL_SUMMARY.md
│       │   └── [15+ other phase files]
│       │
│       ├── calendar-feature/         # Calendar implementation docs
│       │   ├── CALENDAR_PROJECT_COMPLETE.md
│       │   ├── CALENDAR_IMPLEMENTATION_COMPLETE.md
│       │   └── [20+ other calendar files]
│       │
│       ├── reports/                  # Status and summary reports
│       │   ├── CLEANUP_STATUS.md
│       │   ├── MIGRATION_STATUS.md
│       │   └── [20+ other reports]
│       │
│       └── obsolete-guides/          # Outdated guides
│           ├── PAGINATION_IMPLEMENTATION_GUIDE.md
│           └── [other obsolete guides]
│
├── .kiro/                            # Kiro configuration
│   └── specs/                        # Feature specs
│       ├── product-discovery/
│       ├── enhanced-marketplace/
│       └── [other active specs]
│
└── src/                              # Source code (unchanged)
```

## Components and Interfaces

### 1. File Classifier

**Purpose:** Categorize files based on naming patterns and content

**Classification Rules:**
```typescript
interface FileClassification {
  category: 'delete' | 'archive' | 'organize' | 'keep';
  destination?: string;
  reason: string;
}

const classificationRules = {
  // DELETE
  delete: [
    /Dashboard\.tsx.*-ErrorAction/,  // Malformed temp files
    /.*Remove-Item -Force$/,          // Command fragments
    /.*\.bak$/,                       // Backup files
    /.*\.tmp$/,                       // Temp files
  ],
  
  // ARCHIVE - Completed Tasks
  archiveCompletedTasks: [
    /^TASK_\d+.*COMPLETE\.md$/,
    /^TASK_\d+\.\d+.*COMPLETE\.md$/,
  ],
  
  // ARCHIVE - Phases
  archivePhases: [
    /^PHASE\d+.*COMPLETE\.md$/,
    /^PHASE\d+.*SUMMARY\.md$/,
    /^PHASE\d+.*STATUS\.md$/,
  ],
  
  // ARCHIVE - Calendar Feature
  archiveCalendar: [
    /^CALENDAR_.*\.md$/,
  ],
  
  // ORGANIZE - Testing
  organizeTesting: [
    /.*TEST.*GUIDE\.md$/,
    /.*TESTING.*\.md$/,
    /^FINAL_TESTING_REPORT\.md$/,
  ],
  
  // ORGANIZE - Guides
  organizeGuides: [
    /.*GUIDE\.md$/,
    /.*INTEGRATION.*\.md$/,
  ],
  
  // KEEP in root
  keepRoot: [
    'README.md',
    'package.json',
    '.env.example',
    '.gitignore',
    'index.html',
    'CRITICAL_BUGS_TRACKING.md',
    'QUICK_START_ACTION_PLAN.md',
  ],
};
```

### 2. Duplicate Detector

**Purpose:** Identify and resolve duplicate files

**Detection Strategy:**
- Compare file sizes
- Check for similar names (e.g., `SUMMARY.md` vs `COMPLETE_SUMMARY.md`)
- Analyze content similarity for files with similar names
- Keep the most comprehensive version (larger file, more recent date)

**Duplicate Patterns:**
```
- CLEANUP_STATUS.md vs CLEANUP_COMPLETION_REPORT.md
- FINAL_STATUS_REPORT.md vs SESSION_FINAL_STATUS.md
- Multiple PHASE3_*_COMPLETE.md files
- Multiple CALENDAR_*_COMPLETE.md files
```

### 3. File Mover

**Purpose:** Safely move files with manifest tracking

**Interface:**
```typescript
interface MoveOperation {
  sourcePath: string;
  destinationPath: string;
  reason: string;
  timestamp: Date;
  fileSize: number;
  checksum?: string;
}

function moveFile(operation: MoveOperation): Result {
  // 1. Verify source exists
  // 2. Create destination directory if needed
  // 3. Move file
  // 4. Log to MOVE_MANIFEST.md
  // 5. Verify move succeeded
}
```

### 4. Manifest Generator

**Purpose:** Create comprehensive records of all operations

**Manifest Structure:**
```markdown
# Move Manifest

Generated: 2025-10-27

## Summary
- Total files moved: 95
- Total files deleted: 8
- Total files kept in root: 7

## Moves by Category

### Completed Tasks (32 files)
| Original Path | New Path | Reason | Date |
|--------------|----------|--------|------|
| TASK_2_COMPLETION_SUMMARY.md | docs/archive/completed-tasks/ | Task completion report | 2025-10-27 |
...

### Deletion Log (8 files)
| File | Reason | Date |
|------|--------|------|
| Dashboard.tsx' -ErrorAction... | Malformed temp file | 2025-10-27 |
...
```

## Data Models

### File Metadata
```typescript
interface FileMetadata {
  name: string;
  path: string;
  size: number;
  created: Date;
  modified: Date;
  category: FileCategory;
  action: 'keep' | 'move' | 'delete';
  destination?: string;
}
```

### Documentation Index
```typescript
interface DocIndex {
  category: string;
  description: string;
  files: Array<{
    name: string;
    path: string;
    description: string;
  }>;
}
```

## Error Handling

### Safety Mechanisms

1. **Dry Run Mode**: Preview all operations before execution
2. **Manifest First**: Create manifests before any file operations
3. **Verification**: Verify each move/delete succeeded
4. **Rollback Info**: Manifests contain enough info to reverse operations

### Error Scenarios

| Error | Handling |
|-------|----------|
| File not found | Log warning, continue |
| Permission denied | Log error, skip file, continue |
| Destination exists | Append timestamp to filename |
| Disk space low | Abort operation, log error |

## Testing Strategy

### Manual Verification Steps

1. **Pre-Cleanup Snapshot**
   - Count files in root: `Get-ChildItem -File | Measure-Object`
   - List all .md files: `Get-ChildItem *.md`

2. **Post-Cleanup Verification**
   - Verify root has ≤10 files
   - Verify docs/ structure exists
   - Verify manifests are complete
   - Spot-check 5 random moved files

3. **Functionality Check**
   - Verify README.md still works
   - Verify package.json intact
   - Verify .kiro/specs/ unchanged
   - Verify src/ unchanged

### Rollback Plan

If issues arise:
1. Consult `docs/archive/MOVE_MANIFEST.md`
2. Use PowerShell to reverse moves:
   ```powershell
   # Example rollback
   Move-Item "docs/archive/completed-tasks/TASK_2_COMPLETION_SUMMARY.md" "./"
   ```

## Implementation Notes

### Phased Approach

**Phase 1: Analysis & Planning**
- Scan and classify all files
- Generate preview manifest
- Identify duplicates

**Phase 2: Create Structure**
- Create docs/ subdirectories
- Create README files

**Phase 3: Delete Operations**
- Remove temp files
- Remove duplicates
- Log deletions

**Phase 4: Move Operations**
- Move archived files
- Move organized files
- Log moves

**Phase 5: Finalization**
- Create navigation docs
- Update main README
- Generate final manifests

### File Operation Order

1. Create all destination directories first
2. Delete temp/malformed files
3. Move archive files (oldest first)
4. Move organized files
5. Verify root directory
6. Create index files

## Design Decisions

### Why Archive Instead of Delete?

- Preserves project history
- Allows recovery if needed
- Minimal storage cost
- Maintains audit trail

### Why Manifests?

- Provides transparency
- Enables rollback
- Documents decision-making
- Helps future maintenance

### Why Phased Approach?

- Reduces risk
- Allows verification at each step
- Easier to debug issues
- Can pause/resume if needed
