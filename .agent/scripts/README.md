# Master Validation Scripts

These scripts are the core validation tools orchestrating skill-level scripts within the Antigravity Kit.

## Available Scripts

### `checklist.py`
Runs the core checks for development and pre-commit steps.
- Validates Security (vulnerabilities, secrets)
- Code Quality (lint, types)
- Schema Validation
- Minimum Test Suite
- UX Audit and SEO Check

### `verify_all.py`
Runs the comprehensive verification suite before deployment.
- Runs all checks from `checklist.py`
- Runs Lighthouse (Core Web Vitals)
- Playwright E2E Tests
- Bundle Analysis
- Mobile Audit & i18n Check

## Usage

```bash
# Develop checks
python .agent/scripts/checklist.py .

# Pre-deployment validation
python .agent/scripts/verify_all.py . --url http://localhost:3000
```
