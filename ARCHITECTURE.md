# Architecture Document: VerifAI

## Overview
VerifAI is an Agent-Driven Lifecycle (ADLC) engine built for Track A: Business Process Automation.
It ingests employee onboarding payloads, evaluates document completeness against internal company policies using Google Gemini LLMs, and maintains an auditable trail with Human-in-the-Loop decision verification.

## High-Level Architecture
- **Frontend / Client**: Single-Page Application (HTML5, CSS3, Vanilla JavaScript).
- **AI Engine**: Google Gemini 1.5 Flash API (Free Tier).
- **Control Flow**: Document Payload Ingestion → VerifAI Compliance Engine → Real-Time Audit Log → Human Approval/Rejection Action.