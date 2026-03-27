/**
 * Tests for documentation changes introduced in the PR that consolidates
 * multiple README files into the root README.md and restructures PLAN.md.
 *
 * Changed files covered:
 *   - README.md (modified - reorganized with new sections and mermaid diagram)
 *   - PLAN.md (modified - restructured from Vietnamese to English)
 *   - CODEBASE.md (deleted - content consolidated into README.md)
 *   - bento-microservices-express/README.md (deleted)
 *   - bento-social-next/README.md (deleted)
 *   - sync-db/README.md (deleted)
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function readFile(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function fileExists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

// ---------------------------------------------------------------------------
// File Existence / Deletion Verification
// ---------------------------------------------------------------------------

describe('PR consolidation: deleted files', () => {
  it('should have removed CODEBASE.md (content merged into README.md)', () => {
    assert.equal(fileExists('CODEBASE.md'), false,
      'CODEBASE.md should not exist after consolidation into README.md');
  });

  it('should have removed bento-microservices-express/README.md', () => {
    assert.equal(fileExists('bento-microservices-express/README.md'), false,
      'bento-microservices-express/README.md should not exist after consolidation');
  });

  it('should have removed bento-social-next/README.md', () => {
    assert.equal(fileExists('bento-social-next/README.md'), false,
      'bento-social-next/README.md should not exist after consolidation');
  });

  it('should have removed sync-db/README.md', () => {
    assert.equal(fileExists('sync-db/README.md'), false,
      'sync-db/README.md should not exist after consolidation');
  });
});

describe('PR consolidation: kept files', () => {
  it('should keep root README.md', () => {
    assert.equal(fileExists('README.md'), true, 'README.md must exist');
  });

  it('should keep PLAN.md', () => {
    assert.equal(fileExists('PLAN.md'), true, 'PLAN.md must exist');
  });
});

// ---------------------------------------------------------------------------
// README.md – Section Structure
// ---------------------------------------------------------------------------

describe('README.md section structure', () => {
  const readme = readFile('README.md');

  it('should have a top-level project title', () => {
    assert.match(readme, /^#\s+Bento Social Network/m,
      'README.md must have a top-level # heading "Bento Social Network"');
  });

  it('should contain section 1: Getting Started & Setup', () => {
    assert.match(readme, /##\s+1\.\s+Getting Started/,
      'README.md must have section "1. Getting Started"');
  });

  it('should contain section 2: System Architecture & Codebase Map', () => {
    assert.match(readme, /##\s+2\.\s+System Architecture/,
      'README.md must have section "2. System Architecture"');
  });

  it('should contain section 3: Technical Specification', () => {
    assert.match(readme, /##\s+3\.\s+Technical Specification/,
      'README.md must have section "3. Technical Specification"');
  });

  it('should contain section 4: Database Synchronization', () => {
    assert.match(readme, /##\s+4\.\s+Database Synchronization/,
      'README.md must have section "4. Database Synchronization"');
  });

  it('should contain section 5: Contributing', () => {
    assert.match(readme, /##\s+5\.\s+Contributing/,
      'README.md must have section "5. Contributing"');
  });

  it('should have exactly 5 numbered level-2 sections', () => {
    const numbered = (readme.match(/^##\s+\d+\./gm) || []);
    assert.equal(numbered.length, 5,
      `README.md should have 5 numbered ## sections, found ${numbered.length}`);
  });
});

// ---------------------------------------------------------------------------
// README.md – Mermaid Architecture Diagram (from new README)
// ---------------------------------------------------------------------------

describe('README.md mermaid architecture diagram', () => {
  const readme = readFile('README.md');

  it('should include a mermaid code block', () => {
    assert.match(readme, /```mermaid/,
      'README.md must contain a mermaid diagram block');
  });

  it('should show Next.js frontend node in diagram', () => {
    assert.match(readme, /Next\.js/,
      'mermaid diagram must reference Next.js frontend');
  });

  it('should show Express.js API node in diagram', () => {
    assert.match(readme, /Express\.js/,
      'mermaid diagram must reference Express.js API');
  });

  it('should show MySQL database node in diagram', () => {
    assert.match(readme, /MySQL/,
      'mermaid diagram must reference MySQL database');
  });

  it('should show Redis cache node in diagram', () => {
    assert.match(readme, /Redis/,
      'mermaid diagram must reference Redis cache');
  });

  it('should reference port 3001 for the frontend', () => {
    assert.match(readme, /:3001/,
      'README.md diagram should mention frontend port 3001');
  });

  it('should reference port 3000 for the backend', () => {
    assert.match(readme, /:3000/,
      'README.md diagram should mention backend port 3000');
  });
});

// ---------------------------------------------------------------------------
// README.md – Getting Started (was in sub-READMEs, now consolidated)
// ---------------------------------------------------------------------------

describe('README.md installation and running instructions', () => {
  const readme = readFile('README.md');

  it('should include pnpm install command for backend', () => {
    assert.match(readme, /pnpm install/,
      'README.md must include "pnpm install" for dependency installation');
  });

  it('should reference bento-microservices-express directory', () => {
    assert.match(readme, /bento-microservices-express/,
      'README.md must mention the backend directory bento-microservices-express');
  });

  it('should reference bento-social-next directory', () => {
    assert.match(readme, /bento-social-next/,
      'README.md must mention the frontend directory bento-social-next');
  });

  it('should document the start-localhost.bat entry point', () => {
    assert.match(readme, /start-localhost\.bat/,
      'README.md must document start-localhost.bat for local development');
  });

  it('should document the start-network.bat entry point', () => {
    assert.match(readme, /start-network\.bat/,
      'README.md must document start-network.bat for LAN access');
  });

  it('should document the stop.bat teardown script', () => {
    assert.match(readme, /stop\.bat/,
      'README.md must document stop.bat for graceful shutdown');
  });

  it('should mention environment file .env.development', () => {
    assert.match(readme, /\.env\.development/,
      'README.md must mention .env.development environment file');
  });

  it('should mention environment file .env.network', () => {
    assert.match(readme, /\.env\.network/,
      'README.md must mention .env.network environment file');
  });
});

// ---------------------------------------------------------------------------
// README.md – Technical Specification (key stack items)
// ---------------------------------------------------------------------------

describe('README.md technical specification completeness', () => {
  const readme = readFile('README.md');

  it('should list Prisma as the ORM', () => {
    assert.match(readme, /Prisma/,
      'README.md must mention Prisma ORM in technical specification');
  });

  it('should list Socket.io for real-time communication', () => {
    assert.match(readme, /Socket\.io/,
      'README.md must mention Socket.io for real-time features');
  });

  it('should list TSyringe for dependency injection', () => {
    assert.match(readme, /TSyringe/,
      'README.md must mention TSyringe for dependency injection');
  });

  it('should list Zod for validation', () => {
    assert.match(readme, /Zod/,
      'README.md must mention Zod for schema validation');
  });

  it('should list Tailwind CSS for styling', () => {
    assert.match(readme, /Tailwind/,
      'README.md must mention Tailwind CSS in technical specification');
  });

  it('should list React Query for state management', () => {
    assert.match(readme, /React Query/,
      'README.md must mention React Query for state management');
  });

  it('should list JWT for auth security', () => {
    assert.match(readme, /JWT/,
      'README.md must mention JWT in the security stack');
  });

  it('should list Bcrypt for password hashing', () => {
    assert.match(readme, /[Bb]crypt/,
      'README.md must mention Bcrypt for password hashing');
  });
});

// ---------------------------------------------------------------------------
// README.md – Database Synchronization (was sync-db/README.md)
// ---------------------------------------------------------------------------

describe('README.md database synchronization section (consolidated from sync-db/README.md)', () => {
  const readme = readFile('README.md');

  it('should reference the export-db.bat script', () => {
    assert.match(readme, /export-db\.bat/,
      'README.md must reference export-db.bat for database export');
  });

  it('should reference the import-db.bat script', () => {
    assert.match(readme, /import-db\.bat/,
      'README.md must reference import-db.bat for database import');
  });

  it('should mention the sync-db/dumps directory for SQL files', () => {
    assert.match(readme, /sync-db\/dumps/,
      'README.md must mention sync-db/dumps as the dump storage directory');
  });

  it('should warn that import overwrites the active database', () => {
    assert.match(readme, /overwrites/i,
      'README.md should warn that import overwrites the active development database');
  });
});

// ---------------------------------------------------------------------------
// README.md – Contributing section
// ---------------------------------------------------------------------------

describe('README.md contributing section', () => {
  const readme = readFile('README.md');

  it('should instruct contributors to create a new branch', () => {
    assert.match(readme, /git checkout -b/,
      'Contributing section must include branch creation command');
  });

  it('should refer contributors to PLAN.md for active tasks', () => {
    assert.match(readme, /PLAN\.md/,
      'Contributing section must direct contributors to PLAN.md for active issues');
  });

  it('should mention Pull Request as the contribution mechanism', () => {
    assert.match(readme, /Pull Request/i,
      'Contributing section must mention submitting a Pull Request');
  });
});

// ---------------------------------------------------------------------------
// PLAN.md – Title and Language Restructuring
// ---------------------------------------------------------------------------

describe('PLAN.md title and language restructuring', () => {
  const plan = readFile('PLAN.md');

  it('should have an English title', () => {
    assert.match(plan, /^#\s+Project Plan/m,
      'PLAN.md top-level heading should be "Project Plan" (English)');
  });

  it('should not have the old Vietnamese title', () => {
    assert.doesNotMatch(plan, /Tóm tắt Issue/,
      'Old Vietnamese title "Tóm tắt Issue" should be removed');
  });

  it('should describe the document purpose in English', () => {
    assert.match(plan, /tracks the current open issues/,
      'PLAN.md introductory sentence should describe issue tracking in English');
  });

  it('should reference the long-dev branch', () => {
    assert.match(plan, /long-dev/,
      'PLAN.md should reference the long-dev branch where work is happening');
  });
});

// ---------------------------------------------------------------------------
// PLAN.md – All 5 Issues Are Documented
// ---------------------------------------------------------------------------

describe('PLAN.md issue coverage', () => {
  const plan = readFile('PLAN.md');

  it('should document Issue 1: search functionality for topics', () => {
    assert.match(plan, /Issue 1.*[Ss]earch/s,
      'PLAN.md must document Issue 1 about search functionality');
  });

  it('should document Issue 2: user profile update functionality', () => {
    assert.match(plan, /Issue 2.*profile/s,
      'PLAN.md must document Issue 2 about user profile update');
  });

  it('should document Issue 3: password reset functionality', () => {
    assert.match(plan, /Issue 3.*password/si,
      'PLAN.md must document Issue 3 about password reset');
  });

  it('should document Issue 4: summary of implemented functionality', () => {
    assert.match(plan, /Issue 4/,
      'PLAN.md must document Issue 4 about implemented functionality summary');
  });

  it('should document Issue 5: theme and settings functionality', () => {
    assert.match(plan, /Issue 5.*[Tt]heme/s,
      'PLAN.md must document Issue 5 about theme and settings');
  });
});

// ---------------------------------------------------------------------------
// PLAN.md – Implementation Steps Per Issue
// ---------------------------------------------------------------------------

describe('PLAN.md implementation steps', () => {
  const plan = readFile('PLAN.md');

  it('should include Implementation Steps sections for each issue', () => {
    const stepSections = (plan.match(/###\s+Implementation Steps/gm) || []);
    assert.equal(stepSections.length, 5,
      `PLAN.md should have 5 "Implementation Steps" subsections, found ${stepSections.length}`);
  });

  it('Issue 1 implementation should specify the /v1/topics/search endpoint', () => {
    assert.match(plan, /\/v1\/topics\/search/,
      'Issue 1 implementation steps must specify the /v1/topics/search endpoint');
  });

  it('Issue 1 implementation should mention case-insensitive search', () => {
    assert.match(plan, /case-insensitive/i,
      'Issue 1 implementation steps must mention case-insensitive search');
  });

  it('Issue 2 implementation should specify PUT /v1/users/profile endpoint', () => {
    assert.match(plan, /PUT \/v1\/users\/profile/,
      'Issue 2 implementation steps must specify PUT /v1/users/profile endpoint');
  });

  it('Issue 2 implementation should mention multer for file uploads', () => {
    assert.match(plan, /multer/,
      'Issue 2 implementation steps must mention multer for avatar uploads');
  });

  it('Issue 3 implementation should specify the forgot-password endpoint', () => {
    assert.match(plan, /\/v1\/auth\/forgot-password/,
      'Issue 3 implementation must specify /v1/auth/forgot-password endpoint');
  });

  it('Issue 3 implementation should specify the reset-password endpoint', () => {
    assert.match(plan, /\/v1\/auth\/reset-password/,
      'Issue 3 implementation must specify /v1/auth/reset-password endpoint');
  });

  it('Issue 3 implementation should mention Redis for token storage', () => {
    assert.match(plan, /Redis/,
      'Issue 3 implementation must mention Redis for caching reset tokens');
  });

  it('Issue 4 implementation should reference prisma/schema.prisma', () => {
    assert.match(plan, /prisma\/schema\.prisma/,
      'Issue 4 implementation must reference prisma/schema.prisma for audit');
  });

  it('Issue 5 implementation should specify ThemeProvider component', () => {
    assert.match(plan, /ThemeProvider/,
      'Issue 5 implementation must specify a ThemeProvider component');
  });

  it('Issue 5 implementation should mention localStorage for theme persistence', () => {
    assert.match(plan, /local.*storage|localStorage/i,
      'Issue 5 implementation must mention local storage for theme persistence');
  });
});

// ---------------------------------------------------------------------------
// PLAN.md – Component Labels (new structured format)
// ---------------------------------------------------------------------------

describe('PLAN.md component labeling', () => {
  const plan = readFile('PLAN.md');

  it('should label Issue 1 as a Backend - API concern', () => {
    assert.match(plan, /\*\*Component:\*\*\s+Backend\s*-\s*API/,
      'Issue 1 must be labeled as Backend - API component');
  });

  it('should label Issue 5 as a Frontend - UI / UX concern', () => {
    assert.match(plan, /\*\*Component:\*\*\s+Frontend\s*-\s*UI/,
      'Issue 5 must be labeled as Frontend - UI/UX component');
  });
});

// ---------------------------------------------------------------------------
// Boundary / Regression Tests
// ---------------------------------------------------------------------------

describe('README.md boundary and regression checks', () => {
  const readme = readFile('README.md');

  it('should not reference old nested directory path from the original README (regression)', () => {
    // Old README had: cd bento-microservices-express/bento-microservices-express
    assert.doesNotMatch(readme, /bento-microservices-express\/bento-microservices-express/,
      'README should not contain the old doubled directory path from the previous version');
  });

  it('should not be empty', () => {
    assert.ok(readme.trim().length > 500,
      'README.md should have substantial content (> 500 chars)');
  });

  it('should use markdown headings (not plain text headers)', () => {
    const headings = (readme.match(/^#{1,3}\s+\S/gm) || []);
    assert.ok(headings.length >= 5,
      'README.md should have at least 5 markdown headings');
  });
});

describe('PLAN.md boundary and regression checks', () => {
  const plan = readFile('PLAN.md');

  it('should not be empty', () => {
    assert.ok(plan.trim().length > 200,
      'PLAN.md should have substantial content (> 200 chars)');
  });

  it('should have numbered issue sections (## 1. through ## 5.)', () => {
    const numbered = (plan.match(/^##\s+\d+\./gm) || []);
    assert.equal(numbered.length, 5,
      `PLAN.md should have exactly 5 numbered ## issue sections, found ${numbered.length}`);
  });

  it('should not contain the old action plan section in Vietnamese (Kế hoạch hành động)', () => {
    assert.doesNotMatch(plan, /Kế hoạch hành động/,
      'Old Vietnamese "Kế hoạch hành động" section should be replaced with structured implementation steps');
  });
});