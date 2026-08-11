# 📖 Vintage Paper Guidebook (Tourigent)

> An interactive, skeuomorphic travel itinerary web application that transforms trip planning into an alpine expedition guidebook experience. Powered by **FastAPI**, **LangGraph**, **Gemini 2.5/3 Flash (with Search Grounding)**, **Qdrant Vector DB**, and **Next.js 16**.

---

## ✨ Features

- 📜 **Skeuomorphic Ledger & Paper Aesthetic**: Parchment textures, wax seals, rubber stamps, brass rivets, turn-of-the-century typography, and physical page-turning (`react-pageflip`).
- 🤖 **LangGraph Multi-Node AI Pipeline**:
  1. **Planner**: Deconstructs user travel preferences into search intents and checks Qdrant vector memory cache.
  2. **Grounding Search**: Fetches real-time venue info, geo-coordinates, operating hours, and live prices via Gemini Search Grounding.
  3. **Guidebook Synthesis**: Formats structured vintage itineraries with marginalia, historical context, and packing lists.
- ⚡ **Real-Time Progress (SSE)**: Streams step-by-step pipeline execution updates over Server-Sent Events.
- 🗺️ **Interactive Maps & Elevation Ascent**: Visual trail maps, location markers, and alpine elevation ascent profiles for itineraries.
- 🔄 **Interactive Venue Swapper**: Swap any activity stop in real-time using vector similarity search & Gemini grounding.
- 🔗 **Shareable Itineraries & OG Cards**: Unique permalinks (`/guidebook/[id]`) with dynamic OpenGraph meta image previews generated at runtime.
- ♿ **Shadcn UI & Accessibility**: Accessible primitives styled with high-end skeuomorphic design rules.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Python 3.11+ / FastAPI (Async)
- **AI Orchestration**: LangGraph (`StateGraph`)
- **LLM Engine**: Google Gemini API (`google-genai` SDK with Search Grounding)
- **Vector Database**: Qdrant (`qdrant-client` async)
- **Server**: Uvicorn

### Frontend
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Vanilla CSS Skeuomorphic Tokens
- **Components**: Shadcn UI (`@/components/ui/`)
- **Animations**: Framer Motion & `react-pageflip`
- **Mapping**: Leaflet / React Leaflet

---

## 📁 Repository Structure

```
tourigent/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/  # FastAPI API endpoints (generate, swap-stop, get by ID)
│   │   ├── core/              # App configuration & settings
│   │   ├── db/                # Qdrant vector client & collection management
│   │   ├── graph/             # LangGraph state graph pipeline & nodes
│   │   ├── schemas/           # Pydantic v2 validation models
│   │   ├── services/          # Venue swapper & web fetcher services
│   │   └── main.py            # FastAPI entrypoint & middleware
│   ├── .env.example           # Backend environment variable template
│   ├── requirements.txt       # Python dependencies
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js App Router (home, /guidebook/[id], OG cards)
│   │   ├── components/        # Shadcn primitives & custom vintage UI components
│   │   └── lib/               # API clients, hooks, & helpers
│   ├── .env.example           # Frontend environment variable template
│   ├── package.json           # Node.js dependencies
│   └── .gitignore
│
├── vercel.json                # Monorepo deployment configuration
├── AGENTS.md                  # Development guidelines & rules
└── README.md                  # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11 or higher
- Node.js 18+ & npm
- Gemini API Key (Google AI Studio)
- Qdrant Instance (Local Docker or Qdrant Cloud - Optional, defaults to local/in-memory fallback)

---

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python -m venv .venv
   # Windows PowerShell:
   .venv\Scripts\Activate.ps1
   # macOS/Linux:
   source .venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   QDRANT_URL=http://localhost:6333
   QDRANT_API_KEY=optional_qdrant_api_key
   CORS_ORIGINS=["http://localhost:3000"]
   ```

5. **Start the FastAPI server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   API Docs available at: `http://localhost:8000/docs`

---

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

4. **Start the Next.js development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 📡 API Reference

### Health Check
- `GET /health`
  Returns server health status and Qdrant vector database state.

### Generate Guidebook
- `POST /api/v1/guidebook/generate`
  - **Query Param**: `stream=true` for Server-Sent Events (SSE) progress streaming.
  - **Body**:
    ```json
    {
      "destination": "Kyoto, Japan",
      "duration_days": 3,
      "style": "Alpine Ledger",
      "interests": ["Tea Ceremonies", "Ancient Shrines", "Local Crafts"],
      "budget": "Moderate"
    }
    ```

### Retrieve Guidebook by ID
- `GET /api/v1/guidebook/{guidebook_id}`
  - Returns stored guidebook JSON by its unique identifier for permalinks & shareable cards.

### Swap Activity Stop
- `POST /api/v1/guidebook/swap-stop`
  - Replaces a venue stop with an alternative venue while preserving itinerary flow.

---

## ☁️ Deployment (Vercel Monorepo)

The repository includes a root `vercel.json` configured for dual-service deployment:

```bash
# Deploy to Vercel via CLI
npx vercel
```

Vercel route configuration handles API rewrites automatically:
- `/api/v1/*` -> FastAPI Backend (`backend/app/main.py`)
- `/*` -> Next.js Frontend (`frontend/`)

---

## 📄 License

MIT License. Designed for modern travelers.
