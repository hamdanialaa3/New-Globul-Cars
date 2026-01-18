# 🛣️ PROJECT_TARGET Implementation Roadmap
**Timeline:** Jan 17 - Dec 26, 2026 | **Phases:** 6 | **Risk Level:** HIGH (Complex transformation)

---

## 🎯 Vision Realignment

**FROM:** Bulgarian car marketplace with AI-assisted features  
**TO:** European AI-native development platform with spec-driven governance and autonomous agentic capabilities

**Transformation:** This is NOT a feature addition; it's an architectural pivot requiring:
- Complete governance overhaul (Spec-Driven Development)
- Core platform rewrite (agentic capabilities)
- Infrastructure migration (Firebase → PostgreSQL + K8s)
- Compliance-first design (EU AI Act)

---

## 📅 Phase Overview

| Phase | Timeline | Focus | Output | Risk |
|-------|----------|-------|--------|------|
| **0** | Jan 17-31 | Planning & Assessment | Detailed specs + team alignment | LOW |
| **1** | Feb 1-28 | SDD Governance | Constitution + governance framework | MEDIUM |
| **2** | Mar 1-31 | Agent Infrastructure | Gemini 3 Agent Mode + MCP tools | HIGH |
| **3** | Apr 1-30 | Compliance Layer | HITL + EU AI Act alignment | HIGH |
| **4** | May 1-Jun 30 | A2UI + Microservices | Agent-driven UI + architecture refactor | **CRITICAL** |
| **5** | Jul 1-Sep 30 | PostgreSQL Migration | Database migration + K8s deployment | **CRITICAL** |
| **6** | Oct 1-Dec 31 | DACH Expansion | Multi-region + European launch | HIGH |

---

## 📋 Phase 0: Planning & Assessment (Jan 17-31, 2026)

### Objectives
- [ ] Create detailed specification for each critical component
- [ ] Align team on transformation vision
- [ ] Allocate resources and define roles
- [ ] Set up governance infrastructure
- [ ] Conduct technical due diligence

### Deliverables

#### 1. **Technical Architecture Specification** (1-2 weeks)
**File:** `PROJECT_TARGET_ARCHITECTURE_SPEC.md`

```markdown
## 1.1 System Architecture Diagram
- Microservices per country (Bulgaria, Germany, Austria, Switzerland)
- Event-driven backbone (Kafka cluster)
- PostgreSQL primary + Redis cache
- Kubernetes orchestration (GKE)
- A2UI protocol services
- Agent orchestration service (Gemini 3 Pro)

## 1.2 Data Model Redesign
- From: Firestore nested documents
- To: PostgreSQL relational schema with event sourcing
- Entities: Users, Cars, Listings, Transactions, Compliance Logs, AI Decisions

## 1.3 API Specification
- REST APIs for web/mobile clients
- GraphQL for agent queries
- gRPC for inter-service communication
- Event API for pub/sub

## 1.4 Deployment Architecture
- GKE cluster with 3 regions (EU-west1 primary, EU-north1 secondary, EU-central2 tertiary)
- Service mesh (Istio) for resilience
- Prometheus + Grafana for observability
- ArgoCD for GitOps deployment

## 1.5 Security & Compliance
- HSM-based encryption key management
- Data lineage tracking system
- HITL approval workflow
- EU AI Act risk classification matrix
```

**Effort:** 1-2 weeks | **Owner:** Architect + Compliance Officer  
**Input:** This gap analysis + PROJECT_TARGET document  
**Blockers:** None (can proceed in parallel)

---

#### 2. **Governance Framework Specification** (1 week)
**File:** `SDD_GOVERNANCE_SPECIFICATION.md`

```markdown
## 2.1 Spec-Driven Development (SDD) Process
1. **Spec Authoring** (1-2 days)
   - Product Manager + Architect write formal spec in structured format
   - Components: Requirements, Data Model, API Contract, Acceptance Criteria, Compliance Rules
   
2. **Spec Review** (1 day)
   - Tech lead reviews architecture
   - Compliance officer reviews regulatory requirements
   - Product manager confirms business requirements
   
3. **Implementation** (2-5 days)
   - Developer + AI agent implement per spec
   - Tests written first (TDD)
   - Agent suggests optimizations
   
4. **Verification** (1 day)
   - QA verifies against acceptance criteria
   - Agent runs adversarial tests
   - Compliance checks executed

## 2.2 Spec Format
```
{
  "specId": "SPEC-2026-001",
  "title": "Feature Name",
  "requirements": {...},
  "dataModel": {...},
  "apiContract": {...},
  "acceptanceCriteria": [...],
  "complianceRequirements": {...},
  "architectureDecisions": {...}
}
```

## 2.3 Constitution Rules (Enforced)
- TypeScript strict mode (no `any`)
- Business logic only in `/services`
- All secrets externalized
- Encryption at rest for PII
- i18n wrapping required
- HITL for AI-generated content
- Audit logging for compliance

## 2.4 Tools & Enforcement
- GitHub branch protection rules
- Pre-commit hooks (TypeScript, linting, secret scanning)
- GitHub Actions for spec validation
- Spec-driven test generation (TDD)
```

**Effort:** 1 week | **Owner:** Product Lead + Tech Lead  
**Input:** Current governance issues from constitution  
**Blockers:** None (can proceed in parallel)

---

#### 3. **Team & Resource Allocation** (3-4 days)
**File:** `PROJECT_TARGET_RESOURCE_PLAN.md`

```markdown
## 3.1 Team Composition
### Core Team (Required)
- 1x Platform Architect (A2UI, microservices, event-driven systems)
- 2x Backend Engineers (agentic systems, API development)
- 1x Frontend/A2UI Specialist (component composition, dynamic UI)
- 1x DevOps Engineer (K8s, GCP, CI/CD)
- 1x Compliance Officer (EU AI Act, GDPR, HITL)
- 1x AI Systems Engineer (Gemini 3 integration, Agent Mode)
- 1x QA Automation Engineer (adversarial testing, zero-regression)

### Support Team (Optional)
- Product Managers (1x for Bulgaria, 1x for DACH)
- Community Manager (ecosystem partnerships)
- Localization Manager (multi-language support)

### Budget Impact
- 7 full-time engineers: ~€420k/year (Bulgaria salary rates)
- Infrastructure (GKE, PostgreSQL, Kafka): ~€50k/month in production
- Gemini API usage: ~€10-20k/month (agent-heavy workloads)
- **Total Year 1:** ~€700k+ (pre-seed to Seed runway)

## 3.2 Roles & Responsibilities
[Detailed RACI matrix...]

## 3.3 External Support
- Compliance consultant (EU AI Act): €30-50k
- Migration specialist (Firebase → PostgreSQL): €20-30k
- Cloud architect (Kubernetes): €15-25k
```

**Effort:** 3-4 days | **Owner:** CEO/CTO  
**Input:** Current team + budget constraints  
**Blockers:** Budget approval needed

---

#### 4. **Detailed Risk Register** (3-5 days)
**File:** `PROJECT_TARGET_RISK_REGISTER.md`

```markdown
## 4.1 Technical Risks

### Risk 1: Gemini 3 Pro Agent Mode Integration Failure
- **Probability:** Medium (API is new, unknown gotchas)
- **Impact:** Critical (core to AI-native vision)
- **Mitigation:** 
  1. Prototype Agent Mode in week 1-2 of Phase 1
  2. Have fallback to enhanced tooling (MCP + local models)
  3. Budget 2-week contingency buffer
  
### Risk 2: PostgreSQL Migration Fails / Data Corruption
- **Probability:** Medium (large dataset, complex schema)
- **Impact:** Critical (production outage)
- **Mitigation:**
  1. Implement dual-write strategy (Firestore + PostgreSQL in parallel)
  2. Extensive migration testing in staging environment
  3. Canary migration (migrate 10% first, verify, then 100%)
  4. Rollback plan ready at each step

### Risk 3: A2UI Protocol Too Complex / Unrealistic
- **Probability:** Medium (new concept, unproven)
- **Impact:** High (key differentiator)
- **Mitigation:**
  1. MVP with simple component types first
  2. Validate with user feedback early
  3. Simplify spec if needed vs. ambitious initial design

### Risk 4: Timeline Overrun (Phases slip into subsequent quarters)
- **Probability:** High (common in transformations)
- **Impact:** High (miss Q3 seed round, Q4 DACH expansion)
- **Mitigation:**
  1. Aggressive scope management (cut non-essential features)
  2. Dedicated project manager + weekly status tracking
  3. Parallel workstreams where possible
  4. Contingency: Extend timeline by 1-2 months

## 4.2 Organizational Risks

### Risk 5: Team Burnout (Phases 4-5 are intensive)
- **Probability:** Medium
- **Impact:** High (team turnover, quality issues)
- **Mitigation:**
  1. Hire additional engineers in Feb/Mar
  2. Rotate intensive phases
  3. Mental health support + time off after Phase 5

### Risk 6: Compliance Oversight / Legal Issues
- **Probability:** Medium (EU regulations evolving)
- **Impact:** Critical (€35M fines possible)
- **Mitigation:**
  1. Hire compliance officer in Phase 0
  2. Monthly EU AI Act updates
  3. Sandbox participation for early feedback
  4. Legal review of all compliance-related code

## 4.3 Market Risks

### Risk 7: EU Market Entry Delay / Competition
- **Probability:** Medium (other startups also targeting EU)
- **Impact:** Medium (missed first-mover advantage)
- **Mitigation:**
  1. Build in public (write blog posts, participate in EU AI discussions)
  2. Apply to GATE sandbox ASAP (validates regulatory approach)
  3. Identify strategic partners in EU for market entry
```

**Effort:** 3-5 days | **Owner:** CTO + Risk Manager  
**Input:** Technical assessment + timeline  
**Blockers:** None

---

#### 5. **Success Criteria & KPIs** (2-3 days)
**File:** `PROJECT_TARGET_SUCCESS_METRICS.md`

```markdown
## 5.1 Phase Success Criteria

### Phase 0 Success
- ✅ All 5 specifications completed and approved
- ✅ Team aligned on vision (all-hands alignment meeting)
- ✅ Resource allocation finalized
- ✅ Risk register reviewed and mitigation plans in place
- ✅ Approval to proceed to Phase 1

### Phase 1 Success
- ✅ SDD governance framework implemented and adopted
- ✅ All new code follows spec-driven process
- ✅ Constitution rules enforced by automation (pre-commit hooks)
- ✅ .gemini/settings.json deployed and validated
- ✅ First spec written and implemented per SDD process

### Phase 2 Success
- ✅ Gemini 3 Pro Agent Mode integrated and tested
- ✅ Agent executes autonomous planning with HITL approval
- ✅ MCP tools integrated and functional
- ✅ Codebase fully indexed and queryable by agents
- ✅ First autonomous refactoring task completed

### Phase 3 Success
- ✅ HITL approval workflow operational
- ✅ AI content transparency system live (watermarks + notices)
- ✅ Data lineage tracking implemented
- ✅ EU AI Act compliance audit passed
- ✅ GATE sandbox application submitted

### Phase 4 Success
- ✅ A2UI protocol specification complete and implemented
- ✅ First agent-generated UI component deployed in production
- ✅ Microservices architecture refactored (3 initial services)
- ✅ Event-driven backbone (Kafka) operational
- ✅ Zero-regression testing automated

### Phase 5 Success
- ✅ PostgreSQL migration complete (100% of data)
- ✅ Kubernetes cluster operational (3 regions)
- ✅ Zero-downtime deployment achieved
- ✅ Performance benchmarks met (P95 latency <200ms)
- ✅ Disaster recovery tested and verified

### Phase 6 Success
- ✅ DACH market services deployed (Austria, Germany, Switzerland)
- ✅ Multi-language support operational (German, Austrian German)
- ✅ Regulatory compliance verified in each country
- ✅ Seed round funding secured (€2-3M target)
- ✅ Market traction in DACH (50+ listings, 10+ transaction pilots)

## 5.2 Business KPIs

| Metric | Q1 Target | Q2 Target | Q3 Target | Q4 Target |
|--------|-----------|-----------|-----------|-----------|
| **Developer Velocity** (features/sprint) | 6 | 10 | 12 | 15 |
| **AI Agent Autonomy** (% tasks automated) | 20% | 40% | 60% | 75% |
| **Regression Rate** (% regressions per release) | 5% | 2% | 0.5% | <0.1% |
| **EU AI Act Compliance** (% requirements met) | 30% | 70% | 95% | 100% |
| **System Uptime** (% availability) | 99.5% | 99.7% | 99.9% | 99.95% |
| **DACH Market Share** (% target market) | - | - | 1% | 5% |
| **Funding Status** | Pre-seed | Pre-seed | Seed Series A | Seed Series A |

## 5.3 Technical Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **API Latency** (P95) | <200ms | Prometheus metrics |
| **Agent Planning Time** | <30 seconds | Agent execution logs |
| **Refactor Automation** | <10 min/refactor | Agent completion time |
| **Code Coverage** | >85% | Jest coverage reports |
| **Type Safety** | 100% strict | TypeScript compiler |
| **Security Audit Score** | A+ | Annual third-party audit |
| **Compliance Audit Score** | A+ | Annual compliance review |
```

**Effort:** 2-3 days | **Owner:** Product + CTO  
**Input:** Business strategy + technical capacity  
**Blockers:** None

---

### Phase 0 Deliverables Summary
| Deliverable | Owner | Effort | Status |
|-------------|-------|--------|--------|
| Technical Architecture Spec | Architect | 1-2w | Not Started |
| SDD Governance Framework | Tech Lead | 1w | Not Started |
| Resource Plan & Budget | CEO/CTO | 3-4d | Not Started |
| Risk Register & Mitigations | CTO | 3-5d | Not Started |
| Success Metrics & KPIs | Product/CTO | 2-3d | Not Started |
| **TOTAL PHASE 0** | Team | **2-3 weeks** | **Ready to Start** |

### Phase 0 Success Criteria
- ✅ All 5 detailed specifications completed
- ✅ Team alignment achieved (all-hands meeting)
- ✅ Budget approved
- ✅ Risk register reviewed
- ✅ Go/no-go decision for Phase 1

**Next:** Proceed to Phase 1 if go-decision confirmed

---

## 🚀 Phase 1: SDD Governance Framework (Feb 1-28, 2026)

### Objectives
1. Implement Spec-Driven Development governance
2. Deploy `.gemini/settings.json` and enforcement
3. Create spec template and process documentation
4. Convert first feature to spec-driven process
5. Integrate governance into CI/CD pipeline

### Key Deliverables

#### 1. **Governance Infrastructure** (1 week)

```
src/
├── governance/
│   ├── spec-schema.json          # JSON Schema for specs
│   ├── constitution-rules.ts     # Enforced constitution
│   ├── spec-validator.ts         # Validates specs
│   └── compliance-checker.ts     # Checks EU AI Act alignment
├── .gemini/
│   └── settings.json             # Agent mode configuration
└── specs/
    ├── SPEC-TEMPLATE.md          # Template for new specs
    ├── SPEC-001-example.json     # Example completed spec
    └── README.md                 # SDD process guide
```

**Implementation:**
```json
{
  ".gemini/settings.json": {
    "planningMode": "detailed",
    "autoApprove": false,
    "maxSteps": 15,
    "contextWindow": "1m",
    "thinkingLevel": "high",
    "strictMode": true,
    "requireSpecForChanges": true,
    "enforceTSStrict": true,
    "requireTests": true,
    "requireDocumentation": true
  }
}
```

**Pre-commit Hook:**
```bash
# .husky/pre-commit
npm run type-check                    # TS strict check
npm run governance:validate-spec      # Spec validation
npm run constitution:check            # Constitution compliance
npm run security:scan-secrets         # Secret scanning
```

**CI/CD Integration:**
```yaml
# .github/workflows/governance-check.yml
- Run: Validate all changed files against constitution
- Run: Check if spec exists for changes
- Run: Verify compliance rules met
- Require: Approval if governance violations found
```

**Effort:** 1 week | **Owner:** Tech Lead + DevOps  
**Output:** Governance framework deployed and enforced

#### 2. **Spec Template & Process** (3-4 days)

```markdown
# Spec Template: SPEC-YYYY-NNN

## 1. Overview
- **Title:** Feature name
- **Objective:** What problem does this solve?
- **Acceptance Criteria:** How do we verify completion?
- **Compliance Requirements:** EU AI Act, GDPR, etc.

## 2. Requirements
### Functional Requirements
- [ ] Requirement 1
- [ ] Requirement 2

### Non-Functional Requirements
- [ ] Performance: P95 latency <200ms
- [ ] Availability: 99.9% uptime
- [ ] Scalability: Handle 1M events/day
- [ ] Security: Encryption, HITL if needed

## 3. Data Model
```sql
-- Tables, relationships, indices
CREATE TABLE feature_data (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  ...
);
```

## 4. API Specification
```yaml
POST /api/v1/feature
  Request: {...}
  Response: {...}
  Errors: {...}
```

## 5. Compliance Requirements
- [ ] EU AI Act compliance (if AI-involved)
- [ ] GDPR compliance (if data processing)
- [ ] HITL required? (if high-risk)
- [ ] Audit logging required?
- [ ] Transparency notices required?

## 6. Architecture Decisions
- [ ] Why this design?
- [ ] Alternatives considered?
- [ ] Trade-offs made?

## 7. Tests (TDD - Write Tests First)
```typescript
describe('Feature', () => {
  it('should satisfy acceptance criterion 1', () => {...});
  it('should satisfy acceptance criterion 2', () => {...});
});
```

## 8. Implementation Checklist
- [ ] Spec approved by tech lead
- [ ] Tests written (TDD)
- [ ] Implementation complete
- [ ] Compliance checks passed
- [ ] Code review approved
- [ ] Manual QA signed off
- [ ] Deployed to staging
- [ ] Deployed to production
```

**Effort:** 3-4 days | **Owner:** Tech Lead  
**Output:** Spec template + process guide

#### 3. **First Spec-Driven Implementation** (1.5 weeks)

**Example: Transparency & Watermarking for AI Content**

```
SPEC-2026-001: AI Content Transparency & Watermarking

Objectives:
1. Mark all AI-generated content (descriptions, image analysis)
2. Provide user option to view original + AI version
3. EU AI Act compliance for transparency

Data Model:
- ai_content_audits table: tracks all AI-generated content
- Fields: content_id, model_used, generation_date, user_consent, timestamp

API:
POST /api/v1/content/{id}/mark-ai-generated
  - Mark content as AI-generated
  - Add watermark/transparency notice
  - Log to audit trail

Acceptance Criteria:
- ✓ All car descriptions show "AI-generated" label
- ✓ User can view original + AI version side-by-side
- ✓ Audit trail complete for compliance
- ✓ Watermarks applied to images
- ✓ User consent tracked

Compliance:
- ✓ EU AI Act Article 52 (transparency)
- ✓ GDPR audit logging
- ✓ No user data leakage
```

**Implementation:**
1. Write tests first (TDD)
2. Implement data model
3. Implement API endpoints
4. Implement UI/watermarking
5. Run adversarial tests
6. Compliance verification
7. Deploy to staging
8. Production rollout

**Effort:** 1.5 weeks | **Owner:** Full team  
**Output:** First spec-driven feature live in production

#### 4. **Constitution Enforcement Automation** (1 week)

**Automated Checks:**

```typescript
// Pre-commit checks
const constitutionRules = {
  typescript: {
    strict: true,           // No 'any'
    noAny: true,
    esVersion: 'ES2017'
  },
  codeOrganization: {
    businessLogicOnly: '/services/',  // No biz logic in components
    noHardcodedSecrets: true,
    requiredI18n: true,
    noConsole: true
  },
  security: {
    encryptionAtRest: true,
    noCredentials: true,
    auditLogging: true
  },
  accessibility: {
    wcagAA: true,
    semanticHTML: true,
    ariaLabels: true
  }
};
```

**Enforcement:**
- Pre-commit hook blocks violations
- CI/CD blocks merge if violations
- Weekly constitution report
- Team training if violations

**Effort:** 1 week | **Owner:** DevOps + Tech Lead  
**Output:** Automated constitution enforcement

---

### Phase 1 Success Metrics
- ✅ `.gemini/settings.json` deployed and enforced
- ✅ SDD governance framework operational
- ✅ 3+ specs written and approved
- ✅ First spec-driven feature (transparency) live in production
- ✅ Zero governance violations in code
- ✅ Team trained on SDD process
- ✅ CI/CD pipeline enforces governance

---

## ⏸️ Remaining Phases (Summary)

Due to length constraints, here's the summary:

### **Phase 2: Agent Infrastructure (Mar 1-31, 2026)**
- Gemini 3 Pro Agent Mode integration
- MCP tool ecosystem
- Million-token context indexing
- HITL approval workflows
- **Target:** First autonomous refactoring task

### **Phase 3: Compliance Layer (Apr 1-30, 2026)**
- EU AI Act compliance automation
- HITL for high-risk decisions
- Data lineage tracking
- Transparency + watermarking
- **Target:** GATE sandbox application ready

### **Phase 4: A2UI + Microservices (May-Jun 2026)**
- A2UI protocol implementation
- Microservices refactoring (Bulgaria, DE, AT, CH)
- Event-driven backbone (Kafka)
- Hyper-personalized dashboards
- **Target:** First agent-driven UI in production

### **Phase 5: PostgreSQL Migration (Jul-Sep 2026)**
- Dual-write Firestore + PostgreSQL
- Canary migration strategy
- Kubernetes deployment
- Zero-downtime architecture
- **Target:** 100% migration + 3-region deployment

### **Phase 6: DACH Expansion (Oct-Dec 2026)**
- Market-specific services (DE, AT, CH)
- Multi-language support
- Regulatory compliance per country
- Seed round closure
- **Target:** €2-3M funding + market traction in DACH

---

## 📊 Cross-Phase Dependencies

```
Phase 0 (Planning)
    ↓
Phase 1 (Governance) ← Must complete for Phase 2
    ↓
Phase 2 (Agent Infra) ← Must complete for Phase 3 & 4
    ↓
Phase 3 (Compliance) ← Must complete for GATE sandbox
    ↓
Parallel: Phase 4 (A2UI) + Phase 5 (Database Migration)
    ↓
Phase 6 (DACH Expansion) ← All previous phases must be complete
```

---

## 💰 Budget Estimate

| Phase | Team | Infrastructure | Tools | Contingency | Total |
|-------|------|-----------------|-------|-------------|-------|
| **0** | €5k | €1k | €2k | €2k | **€10k** |
| **1** | €25k | €5k | €5k | €10k | **€45k** |
| **2** | €35k | €10k | €10k | €20k | **€75k** |
| **3** | €40k | €15k | €10k | €25k | **€90k** |
| **4** | €50k | €25k | €15k | €35k | **€125k** |
| **5** | €60k | €40k | €20k | €50k | **€170k** |
| **6** | €45k | €20k | €10k | €30k | **€105k** |
| **TOTAL** | **€260k** | **€116k** | **€72k** | **€172k** | **€620k** |

**Funding Source:** Pre-seed runway (12 months) + Q3 seed round

---

## 🎯 Decision Gates

| Gate | Timing | Success Criteria | Decision |
|------|--------|------------------|----------|
| **Gate 0→1** | End of Phase 0 | Specs approved, team aligned, budget confirmed | Go/No-Go Phase 1 |
| **Gate 1→2** | End of Phase 1 | SDD operational, governance enforced | Go/No-Go Phase 2 |
| **Gate 2→3** | End of Phase 2 | Agent Mode integrated, first autonomous task | Go/No-Go Phase 3 |
| **Gate 3→4** | End of Phase 3 | GATE sandbox approved, compliance verified | Go/No-Go Phase 4 |
| **Gate 4+5→6** | End of Phase 5 | PostgreSQL 100% migrated, K8s operational | Go/No-Go Phase 6 |
| **Phase 6→** | Q4 2026 | DACH services live, seed round closed | Scale/Exit decision |

---

## 🚨 Critical Path Items (Cannot Slip)

1. **Phase 0 Gate (Feb 1):** If delayed, entire timeline slips
2. **Phase 1 Completion (Feb 28):** SDD must be operational by Phase 2
3. **Phase 2 Completion (Mar 31):** Agent Mode essential for autonomous workflows
4. **Phase 3 Completion (Apr 30):** GATE sandbox deadline (apply by May 15)
5. **Phase 5 Completion (Sep 30):** Must be production-ready before Q4 DACH launch
6. **Seed Round (Oct 1):** Required to fund Phase 6 and beyond

---

## 📞 Stakeholder Communication

| Stakeholder | Frequency | Update Type | Owner |
|-------------|-----------|-------------|-------|
| **Board/Investors** | Monthly | Business metrics, funding needs | CEO |
| **Engineering Team** | Weekly | Technical progress, blockers | CTO |
| **Product Managers** | Bi-weekly | Feature status, customer feedback | PM |
| **Compliance Officer** | Weekly | Regulatory progress, audit status | Compliance |
| **EU Partners** (INSAIT, GATE) | Monthly | Sandbox progress, partnership opportunities | BD |

---

**Created:** Jan 17, 2026  
**Status:** Ready for Execution  
**Next Step:** Schedule Phase 0 kickoff meeting and assign owners to each deliverable

