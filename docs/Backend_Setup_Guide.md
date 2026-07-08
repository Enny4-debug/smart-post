# SmartPost Backend Setup Guide
**For: Developers, Project Managers, and System Administrators**

This document explains how to install, configure, run, and interact with the SmartPost Backend system. We have designed this guide so that even someone who doesn't code can follow these steps to get the server running.

---

## 1. What is the Backend?
Think of the Backend as the "engine room" of SmartPost. While the students and staff see the website (the Frontend), the Backend is the invisible brain doing all the heavy lifting:
- It connects to the database to save and retrieve information.
- It checks the rules (e.g., "Does this student owe too much money?").
- It handles the secure login system.
- It securely saves the uploaded evidence files.

The Backend is built using **FastAPI** (a high-performance Python framework) and uses **PostgreSQL** to store the database records.

---

## 2. Prerequisites
Before you start, ensure your computer has the following installed:
1. **Python 3.10 or newer** (The language the backend is written in)
2. **PostgreSQL** (The database system)
3. **Beekeeper Studio** (Optional, but highly recommended for looking at the database visually)

---

## 3. Installation Steps

### Step 3.1: Navigate to the Backend Folder
Open your terminal (Command Prompt/PowerShell on Windows, or Terminal on Linux) and go to the backend directory:

**For Linux/Mac:**
```bash
cd /home/mrdino/Desktop/DTC/clients/Eneck/smart-post/backend
```

**For Windows 11:**
```cmd
cd C:\path\to\your\project\smart-post\backend
```
### Step 3.2: Set up the Database (PostgreSQL)
We need to create the database and ensure the user credentials are correct.

**For Linux:**
1. Open a new terminal window.
2. Set the password for the default `postgres` user to `password` (this allows our backend to connect securely):
   ```bash
   sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'password';"
   ```
3. Create the empty database named `smartpost`:
   ```bash
   sudo -u postgres createdb smartpost
   ```

**For Windows 11:**
1. During your PostgreSQL installation on Windows, you were asked to set a password for the `postgres` user. **Make sure it is set to `password`** (or update the `.env` file in Step 3.3 to match whatever password you chose).
2. Open **pgAdmin 4** (installed with PostgreSQL) or **Beekeeper Studio**.
3. Connect using user `postgres` and your password.
4. Right-click on **Databases** -> **Create** -> **Database...** and name it `smartpost`. Save it.

### Step 3.3: Configure the Environment Variables
The Backend needs a `.env` file to know secret passwords, database locations, and email settings.

1. We have already provided a template file named `.env.example`. Make a copy of it and name it `.env`:

   **For Linux:**
   ```bash
   cp .env.example .env
   ```

   **For Windows 11:**
   ```cmd
   copy .env.example .env
   ```
*(You can open the `.env` file in a text editor later if you ever need to change the database password or email configurations).*

### Step 3.4: Install Python Dependencies
The Backend relies on several external packages (like FastAPI and SQLAlchemy). We install these into an isolated "virtual environment" so they don't interfere with your computer's main system.

1. Create the virtual environment:
   ```bash
   python -m venv venv
   ```

2. Activate the virtual environment:

   **For Linux/Mac:**
   ```bash
   source venv/bin/activate
   ```

   **For Windows 11 (Command Prompt):**
   ```cmd
   venv\Scripts\activate.bat
   ```

   **For Windows 11 (PowerShell):**
   ```powershell
   venv\Scripts\Activate.ps1
   ```

   **Important Windows note:** If `python` or `pip` is not recognized, run the commands with the Python launcher:
   ```cmd
   py -3 -m venv venv
   venv\Scripts\activate.bat
   py -3 -m pip install -r requirements.txt
   ```

3. Install the required packages (make sure the virtual environment is activated and you are in the backend directory):

   **For Linux/Mac & Windows 11:**
   ```bash
   pip install -r requirements.txt
   ```

   **Windows note:** If you see `Could not open requirements file: [Errno 2] No such file or directory: 'requirements.txt'`, first run:
   ```cmd
   cd %USERPROFILE%\Desktop\smart-post\backend
   ```
   then activate `venv` again and retry `pip install -r requirements.txt`.

### Step 3.5: Build the Database Tables
Right now, the database is empty. We need to tell our system to create all the tables (Users, Students, Requests, etc.).

Run the database migrations:

**For Linux/Mac & Windows 11:**
```bash
alembic upgrade head
```

*(If you open Beekeeper Studio now and connect to `smartpost`, you will see all 11 tables exist!)*

---

## 4. How to Run the Server

Once everything is installed, starting the server is very simple.

From inside the `backend` folder, run this command:

**For Linux/Mac & Windows 11:**
```bash
uvicorn app.main:app --reload
```

**What this means:**
- `uvicorn`: The program that runs our FastAPI server.
- `app.main:app`: Tells it where the main application file is located.
- `--reload`: Automatically restarts the server if a developer changes the code (great for development!).

When you see a message saying `Application startup complete` and `Uvicorn running on http://127.0.0.1:8000`, the server is officially running!

---

## 5. How to Interact with the Backend

You don't need a frontend website to test if the backend works! FastAPI automatically generates a beautiful, interactive documentation page.

1. Ensure the server is running (Step 4).
2. Open your web browser and go to: **http://127.0.0.1:8000/api/docs**

### Using the API Dashboard:
This page (called Swagger UI) lists every single action the backend can perform (like logging in, submitting a request, or downloading a report).

- **Green boxes (POST)**: Used for creating new data (e.g., submitting a form).
- **Blue boxes (GET)**: Used for retrieving data (e.g., listing all users).
- **Orange boxes (PATCH/PUT)**: Used for updating existing data.
- **Red boxes (DELETE)**: Used for removing data.

You can click any box, click the **"Try it out"** button, fill in the required fields, and hit **Execute** to see exactly how the server responds in real-time.

---

## 6. Common Issues & Troubleshooting

**Error: "Connection Refused" when starting the server or running migrations**
- **Cause:** The PostgreSQL database is not running, or the `.env` file has the wrong password.
- **Fix:** Make sure PostgreSQL is running (`sudo systemctl status postgresql`) and check that your `.env` file has `DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/smartpost`.

**Error: "Peer authentication failed" when creating the database**
- **Cause:** Linux is trying to log you into the database using your computer's username instead of the database username.
- **Fix:** Follow Step 3.2 carefully, ensuring you use the `sudo -u postgres` prefix so the command runs as the correct user.

**Error: "Failed building wheel for pydantic-core" or "asyncpg" during pip install (Windows)**
- **Cause:** You are likely using a brand new Python version (like 3.13) or a 32-bit version of Python where pre-compiled packages aren't available yet.
- **Fix:** Uninstall your current Python and install **Python 3.12 (64-bit)** from python.org. After installing, delete your `venv` folder and start again from Step 3.4.

**Error: `pip install` cannot find packages or `apscheduler` import fails on Windows**
- **Cause:** The Windows virtual environment is not activated, or `pip` is running outside the intended Python environment.
- **Fix:** Activate the `venv` folder and install using the Python launcher:
  ```cmd
  venv\Scripts\activate.bat
  py -3 -m pip install -r requirements.txt
  py -3 -m pip install apscheduler
  ```

**Error: "Failed building wheel for pydantic-core" during install due to Rust toolchain issues**
- **Cause:** Some packages like `pydantic-core` require the Rust toolchain to build wheels if a prebuilt wheel is unavailable.
- **Fix:** Install the Visual Studio Build Tools and Rust toolchain:
  1. Install Visual Studio Build Tools 2022 with the **"Desktop development with C++"** workload.
  2. Install Rust using the official installer from https://rust-lang.org/tools/install.
  3. Delete `venv`, recreate it, then run:
     ```cmd
     venv\Scripts\activate.bat
     py -3 -m pip install -r requirements.txt
     ```

**Error: "'alembic' is not recognized as an internal or external command"**
- **Cause:** Your `pip install -r requirements.txt` command failed in the previous step, so Alembic was never actually installed.
- **Fix:** Fix the `pip install` errors first (see the wheel building error above). Once the installation succeeds, the `alembic` command will work.
