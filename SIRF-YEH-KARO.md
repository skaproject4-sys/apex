# Sheet Update — Sirf YEH EK Kaam Tumhe Khud Karna Hai

**Baaki sab main script se karwa deta hoon.**  
Tumhare Google account me **main login nahi kar sakta**, isliye ye ek step tumhe browser se karna padega.

---

## Tumhe Sirf YEH Karna Hai (5–10 minute)

### 1. Google Cloud Console pe jao
- Open: **https://console.cloud.google.com/**
- Apne Google account se login karo.

### 2. Project banao / select karo
- Top pe **Select a project** → **New Project** (ya koi purana select karo).
- Project name do (e.g. **APEX Website**) → **Create**.

### 3. APIs enable karo
- Left menu → **APIs & Services** → **Library**.
- Search: **Google Sheets API** → open karo → **Enable**.
- Wapas Library → search: **Google Drive API** → open → **Enable**.

### 4. Service Account + JSON key
- Left menu → **APIs & Services** → **Credentials**.
- **+ Create Credentials** → **Service account**.
- Name: `apex-sheet` (ya kuch bhi) → **Create and Continue** → **Done**.
- Ab list me us service account pe **click** karo.
- **Keys** tab → **Add Key** → **Create new key** → **JSON** → **Create**.
- File download hogi.

### 5. File ko project me rakho
- Downloaded file ko **APEX GREATER NOIDA** folder me le aao.
- Us file ka naam change karke **`credentials.json`** kar do.

---

## Ab Main Script Chalata Hoon (Ye Command Tum Chalana)

Project folder me terminal kholo aur ye type karo:

```bash
npm run setup-sheets
```

**Ye script automatically:**
- Nayi Google Sheet banayegi
- "Contacts" sheet + headers add karegi
- Sheet ko service account ko share karegi
- **.env** me **SPREADSHEET_ID** likh degi

Uske baad:

```bash
npm start
```

Server start karo — ab form / brochure submit karo, **Sheet me update ho jayega**.

---

## Short Summary

| Kaam | Kaun karega |
|------|-------------|
| Google Cloud → Service Account → JSON key download | **Tum** (sirf yahi manual step) |
| credentials.json ko project me rakhna + rename | **Tum** |
| `npm run setup-sheets` chalana | **Tum** (1 command) |
| Sheet banana, share, .env update | **Script** (automatic) |

**Main tumhare Google account me login nahi kar sakta**, isliye **credentials.json** wala step tumhe khud karna padega. Baaki sab setup script kar degi.
