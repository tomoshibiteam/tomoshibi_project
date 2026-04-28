# AGENTS.md

## Project

TOMOSHIBI is an outdoor AI companion service.

The current source of truth is:
- `docs/tomoshibi-master-plan.md`
- `docs/tomoshibi-implementation-plan-v2.md`

When these documents conflict with older assumptions, prefer the v2 implementation plan and update the master plan before changing code.

It is not a generic AI travel guide.
It is not a generic AI chatbot.
It is an AI companion that walks with the user across daily walks, city exploration, solo travel, and local trips.

The companion remembers user preferences, past journeys, and shared memories, then uses location context and place data to suggest where to go next.

The latest product direction starts with Kyushu University students' daily outings, then connects the same growing companion to Iki mode. Characters must differ by appearance, tone, expression, and relationship style, not by limiting which outing categories they can handle.

## Core Principle

Do not let the LLM invent factual place data.

Use external APIs or our own database for:
- place existence
- location
- distance
- opening hours
- prices
- booking links
- coupons
- partner status

Use the LLM for:
- companion tone
- explanation
- recommendation reasoning
- journey recap
- memory summarization

## Architecture Rules

- TypeScript first
- Firebase Cloud Functions backend
- Firestore database
- API layer must be thin
- Services contain business logic
- Repositories contain Firestore access
- External APIs must be behind service interfaces
- LLM calls must be behind LlmClient interface
- Mock providers must exist for local development

## Character Rules

- Do not create characters specialized by outing category, such as "history character", "cafe character", or "nature character".
- Every companion character must be capable of suggesting food, cafes, history, nature, work spots, activities, daily outings, travel, and area modes.
- Character differences belong in tone, distance, expression, appearance, calling style, and wording.
- Appearance customization is a core product surface, not a cosmetic afterthought.

## Memory Rules

- Long-term memories should become user-visible, editable, and deletable.
- `preferenceSummary`, `JourneyMemory.learnedPreferences`, and `Relationship.sharedMemorySummary` are useful summaries, but v2 should move toward structured `UserMemory`.
- Do not store sensitive personal data.
- Do not use memories for recommendations when the memory has been deleted or disabled.

## Safety Rules

- Do not create dependency-oriented romantic companion behavior
- Do not provide mental health counseling
- Do not store sensitive personal data unless explicitly required
- Do not make unsafe outdoor recommendations
- Do not make unverifiable historical claims

## Development Rules

- Make small changes
- Keep files focused
- Avoid giant files
- Do not use any unless unavoidable
- Run build after changes
- Report changed files, commands, results, and TODOs
