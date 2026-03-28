from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

app = FastAPI(title="MediQueue API", version="1.0.0")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# ============== IN-MEMORY DATA STORE ==============

HOSPITALS = [
    {"id": "h1", "name": "City General Hospital", "address": "123 Main St, Downtown", "city": "Mumbai"},
    {"id": "h2", "name": "Apollo Medical Center", "address": "456 Health Ave, Midtown", "city": "Delhi"},
    {"id": "h3", "name": "Fortis Healthcare", "address": "789 Care Blvd, Uptown", "city": "Bangalore"},
    {"id": "h4", "name": "Max Super Specialty", "address": "321 Wellness Dr, Eastside", "city": "Chennai"},
]

SPECIALTIES = [
    "General Medicine", "Cardiology", "Dermatology", "Orthopedics",
    "Pediatrics", "Neurology", "Ophthalmology", "ENT",
    "Gynecology", "Psychiatry", "Dental", "Gastroenterology"
]

DOCTORS: list[dict] = [
    {
        "id": "d1", "name": "Dr. Priya Sharma", "specialty": "Cardiology",
        "hospital_id": "h1", "hospital_name": "City General Hospital",
        "experience": 15, "fee": 800, "avatar": "PS",
        "available_days": ["Monday", "Wednesday", "Friday"],
        "slots": ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30"],
        "bio": "Senior cardiologist with expertise in interventional cardiology and heart failure management.",
        "education": "MD Cardiology - AIIMS Delhi",
        "rating": 4.8, "total_ratings": 245
    },
    {
        "id": "d2", "name": "Dr. Rajesh Kumar", "specialty": "General Medicine",
        "hospital_id": "h1", "hospital_name": "City General Hospital",
        "experience": 10, "fee": 500, "avatar": "RK",
        "available_days": ["Monday", "Tuesday", "Thursday", "Saturday"],
        "slots": ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"],
        "bio": "Experienced general physician specializing in chronic disease management.",
        "education": "MBBS, MD - Grant Medical College",
        "rating": 4.5, "total_ratings": 180
    },
    {
        "id": "d3", "name": "Dr. Anita Desai", "specialty": "Dermatology",
        "hospital_id": "h2", "hospital_name": "Apollo Medical Center",
        "experience": 12, "fee": 700, "avatar": "AD",
        "available_days": ["Tuesday", "Thursday", "Saturday"],
        "slots": ["10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00"],
        "bio": "Renowned dermatologist specializing in cosmetic dermatology and skin cancer treatment.",
        "education": "MD Dermatology - KEM Hospital",
        "rating": 4.9, "total_ratings": 320
    },
    {
        "id": "d4", "name": "Dr. Vikram Singh", "specialty": "Orthopedics",
        "hospital_id": "h2", "hospital_name": "Apollo Medical Center",
        "experience": 20, "fee": 1000, "avatar": "VS",
        "available_days": ["Monday", "Wednesday", "Friday"],
        "slots": ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30"],
        "bio": "Expert orthopedic surgeon with specialization in joint replacement and sports medicine.",
        "education": "MS Orthopedics - CMC Vellore",
        "rating": 4.7, "total_ratings": 290
    },
    {
        "id": "d5", "name": "Dr. Meera Patel", "specialty": "Pediatrics",
        "hospital_id": "h3", "hospital_name": "Fortis Healthcare",
        "experience": 8, "fee": 600, "avatar": "MP",
        "available_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "slots": ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00"],
        "bio": "Compassionate pediatrician with expertise in neonatal care and childhood immunization.",
        "education": "MD Pediatrics - JIPMER Pondicherry",
        "rating": 4.6, "total_ratings": 150
    },
    {
        "id": "d6", "name": "Dr. Arjun Nair", "specialty": "Neurology",
        "hospital_id": "h3", "hospital_name": "Fortis Healthcare",
        "experience": 18, "fee": 1200, "avatar": "AN",
        "available_days": ["Tuesday", "Thursday"],
        "slots": ["09:00", "10:00", "11:00", "14:00", "15:00"],
        "bio": "Leading neurologist specializing in epilepsy management and neurodegenerative disorders.",
        "education": "DM Neurology - NIMHANS Bangalore",
        "rating": 4.9, "total_ratings": 210
    },
    {
        "id": "d7", "name": "Dr. Sunita Reddy", "specialty": "Gynecology",
        "hospital_id": "h4", "hospital_name": "Max Super Specialty",
        "experience": 14, "fee": 900, "avatar": "SR",
        "available_days": ["Monday", "Wednesday", "Friday", "Saturday"],
        "slots": ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00"],
        "bio": "Expert gynecologist with specialization in high-risk pregnancies and minimally invasive surgery.",
        "education": "MS OBG - Safdarjung Hospital Delhi",
        "rating": 4.8, "total_ratings": 275
    },
    {
        "id": "d8", "name": "Dr. Karan Mehta", "specialty": "ENT",
        "hospital_id": "h4", "hospital_name": "Max Super Specialty",
        "experience": 9, "fee": 650, "avatar": "KM",
        "available_days": ["Monday", "Tuesday", "Thursday", "Friday"],
        "slots": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
        "bio": "Skilled ENT specialist with expertise in cochlear implants and sinus surgery.",
        "education": "MS ENT - Maulana Azad Medical College",
        "rating": 4.4, "total_ratings": 130
    },
    {
        "id": "d9", "name": "Dr. Pooja Gupta", "specialty": "Ophthalmology",
        "hospital_id": "h1", "hospital_name": "City General Hospital",
        "experience": 11, "fee": 750, "avatar": "PG",
        "available_days": ["Tuesday", "Wednesday", "Friday"],
        "slots": ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30"],
        "bio": "Ophthalmologist specializing in LASIK surgery and retinal disorders.",
        "education": "MS Ophthalmology - RP Centre AIIMS",
        "rating": 4.7, "total_ratings": 195
    },
    {
        "id": "d10", "name": "Dr. Amit Joshi", "specialty": "Gastroenterology",
        "hospital_id": "h3", "hospital_name": "Fortis Healthcare",
        "experience": 16, "fee": 1100, "avatar": "AJ",
        "available_days": ["Monday", "Wednesday", "Thursday"],
        "slots": ["09:00", "10:00", "11:00", "14:00", "15:00"],
        "bio": "Gastroenterologist with expertise in advanced endoscopy and liver disease management.",
        "education": "DM Gastroenterology - PGI Chandigarh",
        "rating": 4.6, "total_ratings": 170
    },
]

PATIENTS: dict[str, dict] = {
    "patient1": {
        "id": "patient1", "name": "Rahul Verma", "email": "rahul@example.com",
        "password": "password123", "phone": "+91-9876543210", "age": 32,
        "blood_group": "O+", "gender": "Male",
        "allergies": ["Penicillin"], "chronic_conditions": ["Hypertension"]
    },
    "patient2": {
        "id": "patient2", "name": "Sneha Agarwal", "email": "sneha@example.com",
        "password": "password123", "phone": "+91-9876543211", "age": 28,
        "blood_group": "A+", "gender": "Female",
        "allergies": [], "chronic_conditions": []
    },
}

ADMIN_USERS: dict[str, dict] = {
    "admin1": {
        "id": "admin1", "name": "Admin User", "email": "admin@mediqueue.com",
        "password": "admin123", "role": "admin"
    }
}

DOCTOR_USERS: dict[str, dict] = {
    "d1": {"email": "priya@hospital.com", "password": "doctor123"},
    "d2": {"email": "rajesh@hospital.com", "password": "doctor123"},
    "d3": {"email": "anita@hospital.com", "password": "doctor123"},
    "d4": {"email": "vikram@hospital.com", "password": "doctor123"},
    "d5": {"email": "meera@hospital.com", "password": "doctor123"},
    "d6": {"email": "arjun@hospital.com", "password": "doctor123"},
    "d7": {"email": "sunita@hospital.com", "password": "doctor123"},
    "d8": {"email": "karan@hospital.com", "password": "doctor123"},
    "d9": {"email": "pooja@hospital.com", "password": "doctor123"},
    "d10": {"email": "amit@hospital.com", "password": "doctor123"},
}

appointments: list[dict] = []
queue_entries: list[dict] = []
reviews: list[dict] = []
medical_records: list[dict] = []


def seed_data() -> None:
    global medical_records, reviews, appointments, queue_entries

    medical_records = [
        {
            "id": "mr1", "patient_id": "patient1", "doctor_id": "d1",
            "doctor_name": "Dr. Priya Sharma", "specialty": "Cardiology",
            "hospital_id": "h1", "hospital_name": "City General Hospital",
            "date": "2025-12-15", "diagnosis": "Mild Hypertension",
            "prescription": "Amlodipine 5mg once daily, Low sodium diet",
            "notes": "Blood pressure 150/95. Advised lifestyle modifications. Follow-up in 3 months.",
            "vitals": {"bp": "150/95", "pulse": "82", "weight": "78kg", "temp": "98.6F"}
        },
        {
            "id": "mr2", "patient_id": "patient1", "doctor_id": "d2",
            "doctor_name": "Dr. Rajesh Kumar", "specialty": "General Medicine",
            "hospital_id": "h1", "hospital_name": "City General Hospital",
            "date": "2026-01-10", "diagnosis": "Seasonal Flu",
            "prescription": "Paracetamol 500mg, Cetirizine 10mg, Rest for 3 days",
            "notes": "Presenting with fever, body ache, runny nose. No complications.",
            "vitals": {"bp": "130/85", "pulse": "88", "weight": "77kg", "temp": "101.2F"}
        },
        {
            "id": "mr3", "patient_id": "patient1", "doctor_id": "d4",
            "doctor_name": "Dr. Vikram Singh", "specialty": "Orthopedics",
            "hospital_id": "h2", "hospital_name": "Apollo Medical Center",
            "date": "2026-02-20", "diagnosis": "Lumbar Spondylosis",
            "prescription": "Diclofenac gel, Physiotherapy 3x/week, Back exercises",
            "notes": "Lower back pain for 2 weeks. X-ray shows mild degenerative changes.",
            "vitals": {"bp": "128/82", "pulse": "76", "weight": "78kg", "temp": "98.4F"}
        },
        {
            "id": "mr4", "patient_id": "patient1", "doctor_id": "d6",
            "doctor_name": "Dr. Arjun Nair", "specialty": "Neurology",
            "hospital_id": "h3", "hospital_name": "Fortis Healthcare",
            "date": "2026-03-05", "diagnosis": "Tension Headache",
            "prescription": "Sumatriptan 50mg PRN, Amitriptyline 10mg at night",
            "notes": "Recurring headaches for past month. Neurological exam normal. CT scan clear.",
            "vitals": {"bp": "132/86", "pulse": "80", "weight": "77.5kg", "temp": "98.6F"}
        },
        {
            "id": "mr5", "patient_id": "patient2", "doctor_id": "d3",
            "doctor_name": "Dr. Anita Desai", "specialty": "Dermatology",
            "hospital_id": "h2", "hospital_name": "Apollo Medical Center",
            "date": "2026-01-25", "diagnosis": "Atopic Dermatitis",
            "prescription": "Hydrocortisone cream 1%, Moisturizer, Antihistamine at night",
            "notes": "Eczema flare on arms and neck. Advised to avoid triggers.",
            "vitals": {"bp": "110/70", "pulse": "72", "weight": "55kg", "temp": "98.4F"}
        },
        {
            "id": "mr6", "patient_id": "patient2", "doctor_id": "d5",
            "doctor_name": "Dr. Meera Patel", "specialty": "Pediatrics",
            "hospital_id": "h3", "hospital_name": "Fortis Healthcare",
            "date": "2026-02-14", "diagnosis": "Routine Checkup",
            "prescription": "Vitamin D supplement, Iron supplement",
            "notes": "Annual health checkup. All vitals normal. Mild vitamin D deficiency noted.",
            "vitals": {"bp": "108/68", "pulse": "70", "weight": "54kg", "temp": "98.2F"}
        },
    ]

    reviews = [
        {"id": "r1", "doctor_id": "d1", "patient_id": "patient1", "patient_name": "Rahul V.",
         "rating": 5, "comment": "Excellent cardiologist. Very thorough examination and clear explanations.", "date": "2025-12-20"},
        {"id": "r2", "doctor_id": "d1", "patient_id": "patient2", "patient_name": "Sneha A.",
         "rating": 5, "comment": "Dr. Sharma is incredibly knowledgeable and compassionate.", "date": "2026-01-05"},
        {"id": "r3", "doctor_id": "d3", "patient_id": "patient2", "patient_name": "Sneha A.",
         "rating": 5, "comment": "Best dermatologist! My skin condition improved significantly.", "date": "2026-02-10"},
        {"id": "r4", "doctor_id": "d4", "patient_id": "patient1", "patient_name": "Rahul V.",
         "rating": 4, "comment": "Good orthopedic surgeon. Wait time was a bit long.", "date": "2026-03-01"},
        {"id": "r5", "doctor_id": "d2", "patient_id": "patient1", "patient_name": "Rahul V.",
         "rating": 4, "comment": "Very helpful for my flu symptoms. Quick diagnosis.", "date": "2026-01-15"},
        {"id": "r6", "doctor_id": "d5", "patient_id": "patient2", "patient_name": "Sneha A.",
         "rating": 5, "comment": "Dr. Patel is wonderful with patients. Very gentle and caring.", "date": "2026-02-20"},
        {"id": "r7", "doctor_id": "d6", "patient_id": "patient1", "patient_name": "Rahul V.",
         "rating": 5, "comment": "Exceptional neurologist. Resolved my headache issues completely.", "date": "2026-03-10"},
    ]

    today = datetime.now().strftime("%Y-%m-%d")
    appointments.extend([
        {
            "id": "apt1", "patient_id": "patient1", "patient_name": "Rahul Verma",
            "doctor_id": "d1", "doctor_name": "Dr. Priya Sharma",
            "hospital_name": "City General Hospital",
            "date": today, "time": "10:00", "status": "confirmed",
            "specialty": "Cardiology", "reason": "Follow-up for hypertension"
        },
        {
            "id": "apt2", "patient_id": "patient2", "patient_name": "Sneha Agarwal",
            "doctor_id": "d1", "doctor_name": "Dr. Priya Sharma",
            "hospital_name": "City General Hospital",
            "date": today, "time": "10:30", "status": "confirmed",
            "specialty": "Cardiology", "reason": "Heart checkup"
        },
        {
            "id": "apt3", "patient_id": "patient1", "patient_name": "Rahul Verma",
            "doctor_id": "d3", "doctor_name": "Dr. Anita Desai",
            "hospital_name": "Apollo Medical Center",
            "date": today, "time": "14:00", "status": "confirmed",
            "specialty": "Dermatology", "reason": "Skin rash consultation"
        },
    ])

    queue_entries.extend([
        {
            "id": "q1", "appointment_id": "apt1", "patient_id": "patient1",
            "patient_name": "Rahul Verma", "doctor_id": "d1",
            "doctor_name": "Dr. Priya Sharma", "hospital_name": "City General Hospital",
            "position": 1, "status": "in_progress", "estimated_time": "Now",
            "check_in_time": datetime.now().strftime("%H:%M")
        },
        {
            "id": "q2", "appointment_id": "apt2", "patient_id": "patient2",
            "patient_name": "Sneha Agarwal", "doctor_id": "d1",
            "doctor_name": "Dr. Priya Sharma", "hospital_name": "City General Hospital",
            "position": 2, "status": "waiting", "estimated_time": "~15 min",
            "check_in_time": datetime.now().strftime("%H:%M")
        },
    ])


seed_data()


# ============== MODELS ==============

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: str
    age: int
    gender: str
    blood_group: str

class AppointmentRequest(BaseModel):
    patient_id: str
    doctor_id: str
    date: str
    time: str
    reason: str

class ReviewRequest(BaseModel):
    patient_id: str
    doctor_id: str
    rating: int
    comment: str

class DoctorCreateRequest(BaseModel):
    name: str
    specialty: str
    hospital_id: str
    experience: int
    fee: int
    bio: str
    education: str
    available_days: list[str]
    slots: list[str]
    email: str

class QueueUpdateRequest(BaseModel):
    status: str


# ============== AUTH ENDPOINTS ==============

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/api/auth/login")
async def login(req: LoginRequest):
    if req.role == "patient":
        for pid, patient in PATIENTS.items():
            if patient["email"] == req.email and patient["password"] == req.password:
                return {"success": True, "user": {**{k: v for k, v in patient.items() if k != "password"}, "role": "patient"}}
        raise HTTPException(status_code=401, detail="Invalid credentials")
    elif req.role == "doctor":
        for did, doc_login in DOCTOR_USERS.items():
            if doc_login["email"] == req.email and doc_login["password"] == req.password:
                doctor = next(d for d in DOCTORS if d["id"] == did)
                return {"success": True, "user": {**doctor, "role": "doctor", "email": doc_login["email"]}}
        raise HTTPException(status_code=401, detail="Invalid credentials")
    elif req.role == "admin":
        for aid, admin in ADMIN_USERS.items():
            if admin["email"] == req.email and admin["password"] == req.password:
                return {"success": True, "user": {**{k: v for k, v in admin.items() if k != "password"}, "role": "admin"}}
        raise HTTPException(status_code=401, detail="Invalid credentials")
    raise HTTPException(status_code=400, detail="Invalid role")

@app.post("/api/auth/register")
async def register(req: RegisterRequest):
    for p in PATIENTS.values():
        if p["email"] == req.email:
            raise HTTPException(status_code=400, detail="Email already registered")
    new_id = f"patient{len(PATIENTS) + 1}"
    new_patient = {
        "id": new_id, "name": req.name, "email": req.email,
        "password": req.password, "phone": req.phone, "age": req.age,
        "blood_group": req.blood_group, "gender": req.gender,
        "allergies": [], "chronic_conditions": []
    }
    PATIENTS[new_id] = new_patient
    return {"success": True, "user": {**{k: v for k, v in new_patient.items() if k != "password"}, "role": "patient"}}


# ============== DOCTOR ENDPOINTS ==============

@app.get("/api/doctors")
async def get_doctors(
    specialty: Optional[str] = None,
    hospital_id: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
):
    result = DOCTORS.copy()
    if specialty:
        result = [d for d in result if d["specialty"] == specialty]
    if hospital_id:
        result = [d for d in result if d["hospital_id"] == hospital_id]
    if search:
        search_lower = search.lower()
        result = [d for d in result if search_lower in d["name"].lower() or search_lower in d["specialty"].lower()]
    if sort_by == "rating":
        result.sort(key=lambda d: d["rating"], reverse=True)
    elif sort_by == "experience":
        result.sort(key=lambda d: d["experience"], reverse=True)
    elif sort_by == "fee_low":
        result.sort(key=lambda d: d["fee"])
    elif sort_by == "fee_high":
        result.sort(key=lambda d: d["fee"], reverse=True)
    return {"doctors": result}

@app.get("/api/doctors/{doctor_id}")
async def get_doctor(doctor_id: str):
    doctor = next((d for d in DOCTORS if d["id"] == doctor_id), None)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    doctor_reviews = [r for r in reviews if r["doctor_id"] == doctor_id]
    return {"doctor": doctor, "reviews": doctor_reviews}

@app.get("/api/doctors/{doctor_id}/slots")
async def get_available_slots(doctor_id: str, date: str):
    doctor = next((d for d in DOCTORS if d["id"] == doctor_id), None)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    booked = [a["time"] for a in appointments if a["doctor_id"] == doctor_id and a["date"] == date and a["status"] != "cancelled"]
    available = [s for s in doctor["slots"] if s not in booked]
    return {"slots": available, "all_slots": doctor["slots"], "booked_slots": booked}

@app.get("/api/specialties")
async def get_specialties():
    return {"specialties": SPECIALTIES}

@app.get("/api/hospitals")
async def get_hospitals():
    return {"hospitals": HOSPITALS}


# ============== APPOINTMENT ENDPOINTS ==============

@app.post("/api/appointments")
async def create_appointment(req: AppointmentRequest):
    doctor = next((d for d in DOCTORS if d["id"] == req.doctor_id), None)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    patient = PATIENTS.get(req.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    existing = [a for a in appointments if a["doctor_id"] == req.doctor_id and a["date"] == req.date and a["time"] == req.time and a["status"] != "cancelled"]
    if existing:
        raise HTTPException(status_code=400, detail="Slot already booked")
    apt_id = f"apt{uuid.uuid4().hex[:8]}"
    appointment = {
        "id": apt_id, "patient_id": req.patient_id, "patient_name": patient["name"],
        "doctor_id": req.doctor_id, "doctor_name": doctor["name"],
        "hospital_name": doctor["hospital_name"],
        "date": req.date, "time": req.time, "status": "confirmed",
        "specialty": doctor["specialty"], "reason": req.reason
    }
    appointments.append(appointment)
    return {"success": True, "appointment": appointment}

@app.get("/api/appointments")
async def get_appointments(patient_id: Optional[str] = None, doctor_id: Optional[str] = None):
    result = appointments
    if patient_id:
        result = [a for a in result if a["patient_id"] == patient_id]
    if doctor_id:
        result = [a for a in result if a["doctor_id"] == doctor_id]
    return {"appointments": sorted(result, key=lambda a: (a["date"], a["time"]), reverse=True)}

@app.patch("/api/appointments/{appointment_id}")
async def update_appointment(appointment_id: str, status: str = Query(...)):
    apt = next((a for a in appointments if a["id"] == appointment_id), None)
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    apt["status"] = status
    return {"success": True, "appointment": apt}


# ============== QUEUE ENDPOINTS ==============

@app.get("/api/queue")
async def get_queue(doctor_id: Optional[str] = None, patient_id: Optional[str] = None):
    result = queue_entries
    if doctor_id:
        result = [q for q in result if q["doctor_id"] == doctor_id]
    if patient_id:
        result = [q for q in result if q["patient_id"] == patient_id]
    return {"queue": sorted(result, key=lambda q: q["position"])}

@app.post("/api/queue/checkin/{appointment_id}")
async def check_in(appointment_id: str):
    apt = next((a for a in appointments if a["id"] == appointment_id), None)
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    existing = next((q for q in queue_entries if q["appointment_id"] == appointment_id), None)
    if existing:
        return {"success": True, "queue_entry": existing, "message": "Already checked in"}
    doctor_queue = [q for q in queue_entries if q["doctor_id"] == apt["doctor_id"] and q["status"] != "completed"]
    position = len(doctor_queue) + 1
    est_time = f"~{(position - 1) * 15} min" if position > 1 else "Now"
    q_entry = {
        "id": f"q{uuid.uuid4().hex[:8]}",
        "appointment_id": appointment_id,
        "patient_id": apt["patient_id"],
        "patient_name": apt["patient_name"],
        "doctor_id": apt["doctor_id"],
        "doctor_name": apt["doctor_name"],
        "hospital_name": apt["hospital_name"],
        "position": position,
        "status": "in_progress" if position == 1 else "waiting",
        "estimated_time": est_time,
        "check_in_time": datetime.now().strftime("%H:%M")
    }
    queue_entries.append(q_entry)
    return {"success": True, "queue_entry": q_entry}

@app.patch("/api/queue/{queue_id}")
async def update_queue(queue_id: str, req: QueueUpdateRequest):
    q_entry = next((q for q in queue_entries if q["id"] == queue_id), None)
    if not q_entry:
        raise HTTPException(status_code=404, detail="Queue entry not found")
    q_entry["status"] = req.status
    if req.status == "completed":
        doctor_queue = [q for q in queue_entries if q["doctor_id"] == q_entry["doctor_id"] and q["status"] == "waiting"]
        doctor_queue.sort(key=lambda q: q["position"])
        for i, q in enumerate(doctor_queue):
            q["position"] = i + 1
            q["estimated_time"] = "Now" if i == 0 else f"~{i * 15} min"
            if i == 0:
                q["status"] = "in_progress"
    return {"success": True, "queue_entry": q_entry}


# ============== REVIEW ENDPOINTS ==============

@app.post("/api/reviews")
async def create_review(req: ReviewRequest):
    doctor = next((d for d in DOCTORS if d["id"] == req.doctor_id), None)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    patient = PATIENTS.get(req.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    name_parts = patient["name"].split()
    display_name = f"{name_parts[0]} {name_parts[1][0]}." if len(name_parts) > 1 else patient["name"]
    review = {
        "id": f"r{uuid.uuid4().hex[:8]}",
        "doctor_id": req.doctor_id,
        "patient_id": req.patient_id,
        "patient_name": display_name,
        "rating": req.rating,
        "comment": req.comment,
        "date": datetime.now().strftime("%Y-%m-%d")
    }
    reviews.append(review)
    all_reviews = [r for r in reviews if r["doctor_id"] == req.doctor_id]
    doctor["rating"] = round(sum(r["rating"] for r in all_reviews) / len(all_reviews), 1)
    doctor["total_ratings"] = len(all_reviews)
    return {"success": True, "review": review}

@app.get("/api/reviews/{doctor_id}")
async def get_reviews(doctor_id: str):
    doctor_reviews = [r for r in reviews if r["doctor_id"] == doctor_id]
    return {"reviews": sorted(doctor_reviews, key=lambda r: r["date"], reverse=True)}


# ============== MEDICAL RECORDS ENDPOINTS ==============

@app.get("/api/medical-records/{patient_id}")
async def get_medical_records(patient_id: str, hospital_id: Optional[str] = None):
    result = [mr for mr in medical_records if mr["patient_id"] == patient_id]
    if hospital_id:
        result = [mr for mr in result if mr["hospital_id"] == hospital_id]
    hospitals_visited = list(set(mr["hospital_name"] for mr in result))
    return {
        "records": sorted(result, key=lambda r: r["date"], reverse=True),
        "hospitals_visited": hospitals_visited,
        "total_records": len(result)
    }

@app.get("/api/medical-records/doctor/{doctor_id}/patient/{patient_id}")
async def get_patient_records_for_doctor(doctor_id: str, patient_id: str):
    records = [mr for mr in medical_records if mr["patient_id"] == patient_id]
    patient = PATIENTS.get(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient_info = {k: v for k, v in patient.items() if k != "password"}
    return {
        "patient": patient_info,
        "records": sorted(records, key=lambda r: r["date"], reverse=True),
        "total_visits": len(records),
        "hospitals_visited": list(set(mr["hospital_name"] for mr in records))
    }


# ============== ADMIN ENDPOINTS ==============

@app.get("/api/admin/stats")
async def get_admin_stats():
    today = datetime.now().strftime("%Y-%m-%d")
    todays_appointments = [a for a in appointments if a["date"] == today]
    active_queue = [q for q in queue_entries if q["status"] in ["waiting", "in_progress"]]
    return {
        "total_doctors": len(DOCTORS),
        "total_patients": len(PATIENTS),
        "total_appointments": len(appointments),
        "todays_appointments": len(todays_appointments),
        "active_queue": len(active_queue),
        "total_hospitals": len(HOSPITALS),
        "specialties_count": len(SPECIALTIES),
        "total_reviews": len(reviews),
    }

@app.post("/api/admin/doctors")
async def create_doctor(req: DoctorCreateRequest):
    hospital = next((h for h in HOSPITALS if h["id"] == req.hospital_id), None)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    new_id = f"d{len(DOCTORS) + 1}"
    initials = "".join(w[0].upper() for w in req.name.split() if w)[:2]
    new_doctor = {
        "id": new_id, "name": req.name, "specialty": req.specialty,
        "hospital_id": req.hospital_id, "hospital_name": hospital["name"],
        "experience": req.experience, "fee": req.fee, "avatar": initials,
        "available_days": req.available_days, "slots": req.slots,
        "bio": req.bio, "education": req.education,
        "rating": 0.0, "total_ratings": 0
    }
    DOCTORS.append(new_doctor)
    DOCTOR_USERS[new_id] = {"email": req.email, "password": "doctor123"}
    return {"success": True, "doctor": new_doctor}

@app.delete("/api/admin/doctors/{doctor_id}")
async def delete_doctor(doctor_id: str):
    global DOCTORS
    doctor = next((d for d in DOCTORS if d["id"] == doctor_id), None)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    DOCTORS = [d for d in DOCTORS if d["id"] != doctor_id]
    return {"success": True, "message": "Doctor removed"}

@app.get("/api/admin/appointments")
async def get_all_appointments():
    return {"appointments": sorted(appointments, key=lambda a: (a["date"], a["time"]), reverse=True)}

@app.get("/api/patients")
async def get_patients():
    result = []
    for pid, p in PATIENTS.items():
        patient_data = {k: v for k, v in p.items() if k != "password"}
        patient_data["total_appointments"] = len([a for a in appointments if a["patient_id"] == pid])
        result.append(patient_data)
    return {"patients": result}
