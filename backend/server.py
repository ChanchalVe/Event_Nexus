from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import qrcode
import io
import base64
import aiofiles
import json
import resend

ROOT_DIR = Path(__file__).parent
load_dotenv()

print("RESEND KEY:", os.environ.get("RESEND_API_KEY"))
print("RESEND KEY:", os.environ.get("RESEND_API_KEY"))

# Create uploads directory
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'eventmaster-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

#-- email function
resend.api_key = os.environ.get("RESEND_API_KEY")


def send_email(to_email, subject, content):
    try:
        print("🚀 send_email CALLED")
        print("TO:", to_email)
        DEMO_EMAIL = "your_email@gmail.com"  # 👈 your email here

        response = resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": DEMO_EMAIL,  # 🔥 force all emails here
            "subject": subject,
            "text": f"""
[Originally for: {to_email}]

{content}
""",
        })

        print("✅ Email sent to demo inbox:", DEMO_EMAIL)

    except Exception as e:
        print("❌ Email error:", e)
# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "user"  # "user" or "organizer"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    created_at: str

class EventCreate(BaseModel):
    title: str
    description: str
    date: str  # ISO date string
    time: str  # HH:MM format
    location: str
    location_type: str = "offline"  # "online" or "offline"
    max_participants: int
    category: str
    banner_url: Optional[str] = None

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    location_type: Optional[str] = None
    max_participants: Optional[int] = None
    category: Optional[str] = None
    banner_url: Optional[str] = None

class EventResponse(BaseModel):
    id: str
    title: str
    description: str
    date: str
    time: str
    location: str
    location_type: str
    max_participants: int
    current_participants: int
    category: str
    banner_url: Optional[str]
    organizer_id: str
    organizer_name: str
    status: str  # "upcoming", "ongoing", "completed"
    created_at: str

class RegistrationResponse(BaseModel):
    id: str
    event_id: str
    event_title: str
    user_id: str
    user_name: str
    user_email: str
    qr_code: str
    registered_at: str

class ReviewCreate(BaseModel):
    event_id: str
    rating: int  # 1-5
    comment: str

class ReviewResponse(BaseModel):
    id: str
    event_id: str
    user_id: str
    user_name: str
    rating: int
    comment: str
    created_at: str

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str  # "registration", "reminder", "update"
    read: bool
    created_at: str

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return pwd_context.hash(password[:72])
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password[:72], hashed_password)


def create_access_token(user_id: str, email: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": expire
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def get_event_status(date_str: str, time_str: str) -> str:
    """Determine event status based on current time"""
    try:
        event_datetime = datetime.fromisoformat(f"{date_str}T{time_str}:00")
        now = datetime.now()
        
        # Assume event lasts 3 hours
        event_end = event_datetime + timedelta(hours=3)
        
        if now < event_datetime:
            return "upcoming"
        elif now >= event_datetime and now <= event_end:
            return "ongoing"
        else:
            return "completed"
    except:
        return "upcoming"

def generate_qr_code(data: str) -> str:
    """Generate QR code and return as base64 string"""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    
    return base64.b64encode(buffer.getvalue()).decode()

async def create_notification(user_id: str, title: str, message: str, notif_type: str):
    """Create an in-app notification"""
    notification = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": notif_type,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notification)

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register", response_model=dict)
async def register(user: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate role
    if user.role not in ["user", "organizer"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'user' or 'organizer'")
    
    # Create user
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user.email,
        "name": user.name,
        "password": hash_password(user.password),
        "role": user.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    # Create welcome notification
    await create_notification(
        user_id,
        "Welcome to EventMaster!",
        f"Hi {user.name}, welcome to EventMaster Pro. Start exploring events now!",
        "update"
    )
    
    token = create_access_token(user_id, user.email, user.role)
    
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": user.email,
            "name": user.name,
            "role": user.role
        }
    }

@api_router.post("/auth/login", response_model=dict)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token(user["id"], user["email"], user["role"])
    
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"]
        }
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        role=current_user["role"],
        created_at=current_user["created_at"]
    )

# ==================== EVENT ENDPOINTS ====================

@api_router.post("/events", response_model=EventResponse)
async def create_event(event: EventCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "organizer":
        raise HTTPException(status_code=403, detail="Only organizers can create events")
    
    event_id = str(uuid.uuid4())
    event_doc = {
        "id": event_id,
        "title": event.title,
        "description": event.description,
        "date": event.date,
        "time": event.time,
        "location": event.location,
        "location_type": event.location_type,
        "max_participants": event.max_participants,
        "current_participants": 0,
        "category": event.category,
        "banner_url": event.banner_url,
        "organizer_id": current_user["id"],
        "organizer_name": current_user["name"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.events.insert_one(event_doc)

    # Send email to all users-------------------
    users = await db.users.find({}, {"_id": 0}).to_list(1000)

    for u in users:
     send_email(
            u["email"],
            "🎉 New Event Created!",
            f"""
    New Event: {event.title}

    📅 Date: {event.date}
    ⏰ Time: {event.time}
    📍 Location: {event.location}

    Check it out now!
    """
       )
     
     #--------------------------------------------
    
    status = get_event_status(event.date, event.time)
    
    return EventResponse(**event_doc, status=status)

@api_router.get("/events", response_model=List[EventResponse])
async def get_events(
    search: Optional[str] = None,
    category: Optional[str] = None,
    location_type: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    sort_by: Optional[str] = "date",  # "date", "title", "participants"
    sort_order: Optional[str] = "asc"  # "asc" or "desc"
):
    query = {}
    
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}}
        ]
    
    if category:
        query["category"] = category
    
    if location_type:
        query["location_type"] = location_type
    
    if date_from:
        query["date"] = {"$gte": date_from}
    
    if date_to:
        if "date" in query:
            query["date"]["$lte"] = date_to
        else:
            query["date"] = {"$lte": date_to}
    
    # Sorting
    sort_field = "date" if sort_by == "date" else ("title" if sort_by == "title" else "current_participants")
    sort_direction = 1 if sort_order == "asc" else -1
    
    events = await db.events.find(query, {"_id": 0}).sort(sort_field, sort_direction).to_list(100)
    
    result = []
    for event in events:
        status = get_event_status(event["date"], event["time"])
        result.append(EventResponse(**event, status=status))
    
    return result

@api_router.get("/events/{event_id}", response_model=EventResponse)
async def get_event(event_id: str):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    status = get_event_status(event["date"], event["time"])
    return EventResponse(**event, status=status)

@api_router.put("/events/{event_id}", response_model=EventResponse)
async def update_event(event_id: str, event_update: EventUpdate, current_user: dict = Depends(get_current_user)):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event["organizer_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this event")
    
    update_data = {k: v for k, v in event_update.model_dump().items() if v is not None}
    
    if update_data:
        await db.events.update_one({"id": event_id}, {"$set": update_data})
    
    updated_event = await db.events.find_one({"id": event_id}, {"_id": 0})
    
    # Notify registered users about update
    registrations = await db.registrations.find({"event_id": event_id}, {"_id": 0}).to_list(1000)
    for reg in registrations:
        await create_notification(
            reg["user_id"],
            "Event Updated",
            f"The event '{updated_event['title']}' has been updated. Please check the new details.",
            "update"
        )
    
    status = get_event_status(updated_event["date"], updated_event["time"])
    return EventResponse(**updated_event, status=status)

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, current_user: dict = Depends(get_current_user)):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event["organizer_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this event")
    
    # Notify registered users
    registrations = await db.registrations.find({"event_id": event_id}, {"_id": 0}).to_list(1000)
    for reg in registrations:
        await create_notification(
            reg["user_id"],
            "Event Cancelled",
            f"The event '{event['title']}' has been cancelled by the organizer.",
            "update"
        )
    
    # Delete registrations
    await db.registrations.delete_many({"event_id": event_id})
    
    # Delete event
    await db.events.delete_one({"id": event_id})
    
    return {"message": "Event deleted successfully"}

@api_router.get("/my-events", response_model=List[EventResponse])
async def get_my_events(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "organizer":
        raise HTTPException(status_code=403, detail="Only organizers can access this endpoint")
    
    events = await db.events.find({"organizer_id": current_user["id"]}, {"_id": 0}).to_list(100)
    
    result = []
    for event in events:
        status = get_event_status(event["date"], event["time"])
        result.append(EventResponse(**event, status=status))
    
    return result

# ==================== REGISTRATION ENDPOINTS ====================

@api_router.post("/events/{event_id}/register", response_model=RegistrationResponse)
async def register_for_event(event_id: str, current_user: dict = Depends(get_current_user)):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if already registered
    existing = await db.registrations.find_one({
        "event_id": event_id,
        "user_id": current_user["id"]
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already registered for this event")
    
    # Check seat availability
    if event["current_participants"] >= event["max_participants"]:
        raise HTTPException(status_code=400, detail="Event is full")
    
    # Create registration
    registration_id = str(uuid.uuid4())
    qr_data = json.dumps({
        "registration_id": registration_id,
        "event_id": event_id,
        "user_id": current_user["id"],
        "event_title": event["title"]
    })
    qr_code = generate_qr_code(qr_data)
    
    registration_doc = {
        "id": registration_id,
        "event_id": event_id,
        "event_title": event["title"],
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "user_email": current_user["email"],
        "qr_code": qr_code,
        "registered_at": datetime.now(timezone.utc).isoformat()
    }
    await db.registrations.insert_one(registration_doc)

    #----- email

    send_email(
        current_user["email"],
        "✅ Registration Confirmed!",
        f"""
    You have successfully registered for:

    🎉 {event['title']}

    📅 {event['date']}
    ⏰ {event['time']}

    See you there!
    """
    )

    #end-----------
    
    # Update participant count
    await db.events.update_one(
        {"id": event_id},
        {"$inc": {"current_participants": 1}}
    )
    
    # Create notification
    await create_notification(
        current_user["id"],
        "Registration Successful",
        f"You have successfully registered for '{event['title']}'. Your QR ticket is ready!",
        "registration"
    )
    
    return RegistrationResponse(**registration_doc)

@api_router.delete("/events/{event_id}/unregister")
async def unregister_from_event(event_id: str, current_user: dict = Depends(get_current_user)):
    registration = await db.registrations.find_one({
        "event_id": event_id,
        "user_id": current_user["id"]
    }, {"_id": 0})
    
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    
    # Delete registration
    await db.registrations.delete_one({
        "event_id": event_id,
        "user_id": current_user["id"]
    })
    
    # Update participant count
    await db.events.update_one(
        {"id": event_id},
        {"$inc": {"current_participants": -1}}
    )
    
    # Create notification
    await create_notification(
        current_user["id"],
        "Unregistered from Event",
        f"You have been unregistered from '{event['title']}'.",
        "update"
    )
    
    return {"message": "Successfully unregistered from event"}

@api_router.get("/my-registrations", response_model=List[RegistrationResponse])
async def get_my_registrations(current_user: dict = Depends(get_current_user)):
    registrations = await db.registrations.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).to_list(100)
    
    return [RegistrationResponse(**reg) for reg in registrations]

@api_router.get("/events/{event_id}/registrations", response_model=List[RegistrationResponse])
async def get_event_registrations(event_id: str, current_user: dict = Depends(get_current_user)):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event["organizer_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view registrations")
    
    registrations = await db.registrations.find({"event_id": event_id}, {"_id": 0}).to_list(1000)
    
    return [RegistrationResponse(**reg) for reg in registrations]

# ==================== REVIEW ENDPOINTS ====================

@api_router.post("/reviews", response_model=ReviewResponse)
async def create_review(review: ReviewCreate, current_user: dict = Depends(get_current_user)):
    event = await db.events.find_one({"id": review.event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if user attended the event
    registration = await db.registrations.find_one({
        "event_id": review.event_id,
        "user_id": current_user["id"]
    })
    if not registration:
        raise HTTPException(status_code=400, detail="You must register for the event to leave a review")
    
    # Check if event is completed
    status = get_event_status(event["date"], event["time"])
    if status != "completed":
        raise HTTPException(status_code=400, detail="You can only review completed events")
    
    # Check if already reviewed
    existing = await db.reviews.find_one({
        "event_id": review.event_id,
        "user_id": current_user["id"]
    })
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this event")
    
    # Validate rating
    if review.rating < 1 or review.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    review_id = str(uuid.uuid4())
    review_doc = {
        "id": review_id,
        "event_id": review.event_id,
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "rating": review.rating,
        "comment": review.comment,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.reviews.insert_one(review_doc)
    
    return ReviewResponse(**review_doc)

@api_router.get("/events/{event_id}/reviews", response_model=List[ReviewResponse])
async def get_event_reviews(event_id: str):
    reviews = await db.reviews.find({"event_id": event_id}, {"_id": 0}).to_list(100)
    return [ReviewResponse(**rev) for rev in reviews]

# ==================== NOTIFICATION ENDPOINTS ====================

@api_router.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications(current_user: dict = Depends(get_current_user)):
    notifications = await db.notifications.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return [NotificationResponse(**notif) for notif in notifications]

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user["id"]},
        {"$set": {"read": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification marked as read"}

@api_router.put("/notifications/read-all")
async def mark_all_notifications_read(current_user: dict = Depends(get_current_user)):
    await db.notifications.update_many(
        {"user_id": current_user["id"]},
        {"$set": {"read": True}}
    )
    return {"message": "All notifications marked as read"}

# ==================== ANALYTICS ENDPOINTS ====================

@api_router.get("/analytics/overview")
async def get_analytics_overview(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "organizer":
        raise HTTPException(status_code=403, detail="Only organizers can access analytics")
    
    # Get organizer's events
    events = await db.events.find({"organizer_id": current_user["id"]}, {"_id": 0}).to_list(100)
    
    total_events = len(events)
    total_registrations = sum(e["current_participants"] for e in events)
    total_capacity = sum(e["max_participants"] for e in events)
    
    # Get reviews for organizer's events
    event_ids = [e["id"] for e in events]
    reviews = await db.reviews.find({"event_id": {"$in": event_ids}}, {"_id": 0}).to_list(1000)
    avg_rating = sum(r["rating"] for r in reviews) / len(reviews) if reviews else 0
    
    # Event status breakdown
    status_counts = {"upcoming": 0, "ongoing": 0, "completed": 0}
    for event in events:
        status = get_event_status(event["date"], event["time"])
        status_counts[status] += 1
    
    # Registrations per event
    registrations_by_event = [
        {"name": e["title"][:20], "registrations": e["current_participants"], "capacity": e["max_participants"]}
        for e in events[:10]  # Top 10
    ]
    
    return {
        "total_events": total_events,
        "total_registrations": total_registrations,
        "total_capacity": total_capacity,
        "average_rating": round(avg_rating, 1),
        "total_reviews": len(reviews),
        "status_breakdown": status_counts,
        "registrations_by_event": registrations_by_event
    }

# ==================== FILE UPLOAD ====================

@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    
    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = UPLOAD_DIR / filename
    
    # Save file
    async with aiofiles.open(filepath, "wb") as f:
        content = await file.read()
        await f.write(content)
    
    return {"url": f"/api/uploads/{filename}"}

# Mount uploads directory
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# ==================== CATEGORIES ====================

@api_router.get("/categories")
async def get_categories():
    return {
        "categories": [
            "Technology",
            "Business",
            "Music",
            "Sports",
            "Art",
            "Education",
            "Health",
            "Food",
            "Networking",
            "Workshop",
            "Conference",
            "Other"
        ]
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    # CORSMiddleware,
    # allow_credentials=True,
    # allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    # allow_methods=["*"],
    # allow_headers=["*"],

    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 👈 IMPORTANT
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
