# Event Registration System

A backend project for browsing events and registering for them, built with Node.js, Express, and SQLite as part of the CodeAlpha Backend Development Internship.

## What it does

- Lists all upcoming events
- Lets anyone register for an event with their name and email
- Prevents double registration and blocks sign-ups once an event is full
- Lets a user look up and cancel their own registrations by email
- Organizer login lets you add or remove events from the browser

## Built with

- Node.js and Express
- SQLite (through the sql.js package)
- Plain HTML, CSS, and JavaScript for the frontend

## Getting started

1. Install the dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. Open your browser and go to:
   ```
   http://localhost:4000
   ```

The database file is created automatically the first time you run the app.

## Organizer access

Adding or deleting events requires the organizer password:
```
maisha123
```
Enter it under "Organizer sign in" on the page to unlock the event form.

## API

**GET /api/events**
Returns all events.

**GET /api/events/:id**
Returns one event, including how many people are registered.

**POST /api/events**
Creates a new event. Requires the `x-organizer-password` header.
```
{ "title": "Tech Meetup", "event_date": "2026-09-15", "location": "Dhaka", "capacity": 50 }
```

**DELETE /api/events/:id**
Deletes an event. Requires the `x-organizer-password` header.

**POST /api/events/:id/register**
Registers someone for an event.
```
{ "name": "Raha", "email": "raha@example.com" }
```

**GET /api/registrations?email=someone@example.com**
Returns all registrations tied to that email.

**DELETE /api/registrations/:id**
Cancels a registration.

## Notes

- The same email cannot register twice for the same event.
- Registration is blocked once an event reaches its capacity.
- Made for Task 2 of the CodeAlpha Backend Development Internship.