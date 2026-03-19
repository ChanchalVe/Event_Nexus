# EventMaster Pro - Product Requirements Document

## Original Problem Statement
Build a full-stack Event Management Dashboard that allows organizers to create and manage events and users to browse, register, and interact with events. The system includes JWT-based authentication with email and password, supporting two roles: organizer and user.

## User Personas
1. **Event Organizer**: Creates, manages, and tracks events with analytics
2. **Event Attendee (User)**: Browses, registers for events, receives QR tickets

## Core Requirements

### Authentication
- [x] JWT-based email/password authentication
- [x] Two roles: user and organizer
- [x] Secure token storage and validation

### Event Management (Organizer)
- [x] Create events with: title, description, date, time, location, max participants, category, banner
- [x] Edit and delete events
- [x] View registered attendees list
- [x] Export registrations to CSV
- [x] Basic analytics dashboard

### Event Browsing (User)
- [x] Browse all events with card-based UI
- [x] Search by title, description, location
- [x] Filter by category, date range, location type (online/offline)
- [x] Sort by date, title, popularity
- [x] Real-time seat availability (polling every 10-30 seconds)

### Registration System
- [x] Register/unregister for events
- [x] Duplicate registration prevention
- [x] Seat availability validation
- [x] QR code ticket generation
- [x] My Tickets page with downloadable QR codes

### Reviews & Ratings
- [x] Users can rate completed events (1-5 stars)
- [x] Comment-based feedback
- [x] Only registered attendees can review
- [x] Reviews visible on event detail page

### Notifications
- [x] In-app notifications for registration, updates, reminders
- [x] Notification bell with unread count
- [x] Mark as read functionality

## What's Been Implemented (March 2026)

### Backend (FastAPI + MongoDB)
- Complete authentication system with JWT tokens
- Event CRUD endpoints with status calculation
- Registration system with seat tracking
- QR code generation using qrcode library
- File upload for event banners
- Reviews and ratings endpoints
- Notifications system
- Analytics endpoint for organizers

### Frontend (React + Tailwind CSS + shadcn/ui)
- Landing page with hero section
- Login/Register pages with role selection
- Main dashboard with stats cards
- Event browsing with filters and search
- Event detail page with registration
- My Tickets page with QR codes
- Organizer dashboard (events list, create/edit, registrations, analytics)
- Notifications page
- Responsive sidebar navigation
- Blue-themed professional UI

## P0/P1/P2 Features Remaining

### P0 (Critical) - None remaining
All core functionality is implemented

### P1 (Important)
- [ ] Email notifications (prepared structure, needs API key)
- [ ] Password reset functionality
- [ ] Event reminder scheduling
- [ ] QR code scanner for attendance tracking

### P2 (Nice to have)
- [ ] Social sharing for events
- [ ] Calendar integration (Google Calendar, iCal)
- [ ] Event duplicate/clone feature
- [ ] Bulk event operations
- [ ] Advanced analytics with charts
- [ ] Multi-language support

## Technical Stack
- **Backend**: FastAPI, MongoDB, JWT, qrcode library
- **Frontend**: React, Tailwind CSS, shadcn/ui, recharts, qrcode.react
- **Database**: MongoDB
- **Authentication**: JWT with bcrypt password hashing

## API Endpoints
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user
- GET/POST /api/events - List/Create events
- GET/PUT/DELETE /api/events/{id} - Event CRUD
- POST /api/events/{id}/register - Register for event
- DELETE /api/events/{id}/unregister - Unregister from event
- GET /api/my-registrations - User's registrations
- GET /api/my-events - Organizer's events
- POST /api/reviews - Create review
- GET /api/notifications - Get notifications
- GET /api/analytics/overview - Organizer analytics
- POST /api/upload - File upload

## Next Steps
1. Add email notifications when API key is provided
2. Implement password reset flow
3. Add QR code scanner for attendance tracking
4. Enhance analytics with more detailed reports
