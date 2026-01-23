AI Notes – Chrome Extension
Full Product Requirement Document (PRD)
1. Product Overview

Chrome extension for saving, managing, and reusing AI prompts

Deep integration with ChatGPT (primary)

Optional universal bottom bar for other websites

Direct sync with AI Notes platform

Focus on speed, usability, and minimal disruption

2. Product Goals

Eliminate prompt retyping

Improve prompt quality and reuse

Centralize prompt management

Increase daily AI productivity

Drive engagement with AI Notes platform

3. Target Users

Professionals using AI daily

Developers and engineers

Content creators

Students and researchers

AI power users

4. Supported Platforms

Chrome Browser (latest versions)

ChatGPT web interface

Other AI tools (future-ready)

5. Core Functional Modules
5.1 Authentication Module

Login (Email & Password)

Registration

Logout

Session persistence

Token-based authentication

Secure local storage

API base URL configuration

5.2 ChatGPT Integration Module

Detect ChatGPT pages

Inject UI elements safely

Read prompt input from DOM

Handle ChatGPT UI changes gracefully

No interference with native ChatGPT UX

5.3 Prompt Capture & Save Module

Capture current prompt text

Editable before saving

Optional title & description

Save to AI Notes backend

Success / error feedback

Offline-safe retry handling (future)

5.4 Extension Popup Module

Login / Register UI

User status display

Quick actions dashboard

Settings access

Logout control

5.5 Bottom Bar Module (Core UX Feature)
5.5.1 Bottom Bar Overview

Persistent bottom bar UI

Configurable enable/disable

Appears on supported pages

Minimal, non-intrusive design

5.5.2 Bottom Bar Actions
1. Templates

Opens Templates Popup

Quick apply templates to input

2. Personal Prompts

Opens Personal Prompts Popup

User-created prompts only

3. Improve Prompt

AI-powered prompt enhancement

4. Clear

Clears current input safely

5. Feedback

Collect user feedback

5.6 Templates Module
5.6.1 Templates Popup

Modal or side panel

Responsive & fast

User-friendly layout

5.6.2 Template Listing

Title

Short description

Platform compatibility

Tags & categories

5.6.3 Template Filtering

Category

Platform

Prompt type

Tags

Search by keyword

Multi-filter support

Clear all filters option

5.6.4 Template Actions

Preview

Apply to input

Copy

Favorite

5.7 Personal Prompts Module
5.7.1 Personal Prompt Popup

Same UX as Templates

Consistent layout

5.7.2 Personal Prompt Listing

User-created prompts

Title + preview

Last used date

Usage count

5.7.3 Personal Prompt Filtering

Folder

Tags

Platform

Status

Keyword search

Sort options:

Recent

Alphabetical

Most used

5.7.4 Personal Prompt Actions

Apply

Edit

Duplicate

Delete (confirmation)

5.8 Improve Prompt Module
5.8.1 Input Handling

Read current input automatically

Manual paste fallback

5.8.2 Improvement Options

Improve clarity

Improve structure

Improve tone

Improve output quality

5.8.3 Output Actions

Replace current prompt

Copy improved prompt

Save as new prompt

5.9 Clear Prompt Module

Clears only active input field

Confirmation modal

Temporary undo option

No data deletion

5.10 Feedback Module
5.10.1 Feedback Types

Bug report

Feature request

UX feedback

General feedback

5.10.2 Feedback Submission

Text input

Optional metadata (page, action)

Submit confirmation

Backend sync

6. Settings & Configuration

Enable / disable bottom bar

API base URL

Feature toggles

Debug mode (internal)

7. Data Storage

Auth token

User session data

Settings & reminders

Cached templates/prompts

8. Permissions Required

storage

activeTab

scripting

Host permissions (ChatGPT domains)

9. User Flows
9.1 Login Flow

Open extension

Login / Register

Session stored

Dashboard visible

9.2 Save Prompt Flow

Type prompt

Click Save

Edit / confirm

Save to backend

Success feedback

9.3 Template Use Flow

Open bottom bar

Select Templates

Filter & search

Apply template

9.4 Improve Prompt Flow

Click Improve Prompt

Choose improvement type

Apply or copy result

9.5 Feedback Flow

Click Feedback

Submit feedback

Confirmation shown

10. Non-Functional Requirements

Fast load (<200ms UI)

No page blocking

Minimal DOM footprint

Secure token handling

Graceful error handling

11. Analytics & Metrics

Prompt saves

Template usage

Improve prompt usage

Daily active users

Retention rate

12. Risks & Mitigation

ChatGPT UI changes → resilient selectors

API downtime → retry + messaging

Token expiry → re-auth flow

13. Release Plan
Phase 1 – MVP

Authentication

ChatGPT prompt save

Popup UI

Phase 2 – Productivity

Bottom bar

Templates

Personal prompts

Phase 3 – Intelligence

Improve prompt

Feedback loop

Advanced filters

14. Future Enhancements

Personas

Prompt versioning

Multi-AI platform support

Team/shared prompts

Offline mode