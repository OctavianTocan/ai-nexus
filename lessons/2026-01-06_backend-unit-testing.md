# 2026-01-06

- Pytest remains the most-popular way to write tests in Python.

## Testing

- Don't test ORM models in isolation.
- Do test the business logic that uses said ORM models.
- Use integration tests for database interactions.

- Maintaining mocks often costs more value than the value they provide.
- Tests become about managing mocks, not verifying behavior.

- Test what the code does, not how SQLAlchemy works (or other ORMs).

- Test full flows: API -> Service -> Database. This catches real issues without testing framework internals.