---
name: Spec Driven Development
description: Generate comprehensive specifications (Audit, Proposals, Implementation, Testing) before making code changes.
---

# Spec Driven Development

This skill guides you through the process of Spec Driven Development. When a user requests a major feature, architectural change, or explicit use of spec-driven development, follow these steps before writing any code.

## 1. System Examination and Audit
1. Gain a clear understanding of the user's request.
2. Use file exploration tools (`grep_search`, `list_dir`, `view_file`) to thoroughly explore and comprehend the codebase components relating to the requested feature. You MUST leverage the following resources for this audit:
    - System docs under `docs/systems/`
    - Project `AGENTS.md` document
    - Project `README.md` document
    - Project `docs/style_guide.md`
    - Source code under `src/` and `styles/`
3. Once the research is complete, write `docs/specs/01_current_system_audit.md`. Use `.agent/skills/spec_driven_development/templates/01_current_system_audit_template.md` as a structural guide.
    - Outline how the current system works.
    - Highlight critical implementation details and current constraints.

## 2. Proposed Changes
1. Based on the audit and the user's goal, design a proposed solution.
2. Write `docs/specs/02_proposed_system_changes.md`. Use `.agent/skills/spec_driven_development/templates/02_proposed_system_changes_template.md` as a structural guide.
    - Provide a high-level overview of the intended changes.
    - Identify logic flow, new structures, and edge cases to handle.

## 3. Implementation Plan
1. Translate the proposed changes into concrete, actionable steps.
2. Write `docs/specs/03_implementation_plan.md`. Use `.agent/skills/spec_driven_development/templates/03_implementation_plan_template.md` as a structural guide.
    - List the exact files to be created or modified.
    - Describe the specific modifications, new functions, or UI adjustments required.
    - Ensure this document is clear and granular enough to be handed off to another agent for immediate execution.

## 4. Testing and Documentation Plan
1. Define how the implementation will be validated and properly documented.
2. Write `docs/specs/04_testing_and_documentation_plan.md`. Use `.agent/skills/spec_driven_development/templates/04_testing_and_documentation_plan_template.md` as a structural guide.
    - Outline step-by-step manual testing paths.
    - Mention any unit or integration tests that should be added.
    - Flag which existing documentation files (e.g., `README.md`, `AGENTS.md`, or `docs/systems/` files) need updating.

## 5. Handoff
1. Submit all four documents together.
2. Await user review and approval before proceeding with the actual code implementation.
