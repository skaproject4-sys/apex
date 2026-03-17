# Google Sheet Update Ke Liye Setup (Step-by-Step)

Sheet me Contact / Brochure / Visit form ka data save hone ke liye ye steps follow karo.

---

## Step 1: Google Cloud Se credentials.json Lana

1. **Google Cloud Console** kholo: https://console.cloud.google.com/
2. Naya project banao ya existing select karo.
3. **APIs enable karo:**
   - **Google Sheets API** — enable karo
   - **Google Drive API** (agar sheet create karna ho) — enable karo
4. **Service Account banao:**
   - Left menu → **APIs & Services** → **Credentials**
   - **Create Credentials** → **Service account**
   - Name do (e.g. "apex-sheet") → Create
5. **JSON key download karo:**
   - Us service account pe click karo → **Keys** tab
   - **Add Key** → **Create new key** → **JSON** → Download
6. Downloaded file ko project folder me rakho aur naam **`credentials.json`** rakho (rename karke).  
   Path: `APEX GREATER NOIDA/credentials.json`

---

## Step 2: Google Sheet Banao (agar abhi nahi hai)

- https://sheets.google.com pe jao
- **Blank** se nayi spreadsheet banao
- Pehla tab ka naam **"Sheet1"** ya **"Contacts"** rakh sakte ho (dono chalega)

---

## Step 3: Sheet ID Copy Karo

1. Apni Google Sheet kholo
2. Browser address bar me URL dekho, kuch aisa hoga:
   ```
   https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
   ```
3. **Bech wali long ID** copy karo (slash ke beech wala part):  
   `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`  
   Ye tumhara **SPREADSHEET_ID** hai.

---

## Step 4: Sheet Ko Service Account Ko Share Karo

1. **credentials.json** kholo, andar **`client_email`** dhundho.  
   Example: `apex-sheet-123@my-project.iam.gserviceaccount.com`
2. Apni **Google Sheet** kholo
3. Top right **Share** button dabao
4. **Add people** me wahi **client_email** paste karo (jo credentials.json me hai)
5. Permission **Editor** select karo
6. **Send** / **Share** kar do

Bina share kiye data save nahi hoga.

---

## Step 5: .env File Banao / Update Karo

1. Project folder me **`.env`** file chahiye (agar nahi hai to nayi banao).
2. Usme ye line add/update karo (apna actual Sheet ID daalna):

```
SPREADSHEET_ID=paste_your_sheet_id_here
```

Example:
```
SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

3. Save karo.

---

## Step 6: Server Restart Karo

- Server band karo (Ctrl+C)
- Dubara start karo: `node server.js` ya `npm start`
- Console me dikhna chahiye: **SPREADSHEET_ID in .env: SET**

---

## Step 7: Test Karo

1. Browser me jao: `http://localhost:3000/api/sheets-check`
2. Agar sab sahi hai to response me **"ok": true** aur **"Sheet is accessible"** aayega.
3. Website se **Contact form** ya **Download Brochure** submit karo — uske baad Sheet me nayi row add honi chahiye.

---

## Agar Phir Bhi Update Nahi Ho Raha

- **Console check karo** (jahan `node server.js` chala rahe ho): wahan **Google Sheets error** ka message aata hai to wahi reason hai.
- **sheets-check** dubara kholo: `http://localhost:3000/api/sheets-check` — agar **ok: false** hai to **error** / **hint** me likha hoga kya missing hai.
- Confirm karo:
  - `.env` me `SPREADSHEET_ID` sahi paste kiya hai (extra space nahi)
  - Sheet **Share** ki hai us **client_email** ke sath jo credentials.json me hai
  - Server **restart** kiya hai .env change ke baad

---

## Short Checklist

| Step | Kya karna hai |
|------|----------------|
| 1 | `credentials.json` project folder me hona chahiye (Google Cloud se download) |
| 2 | Nayi Google Sheet banao (ya purani use karo) |
| 3 | Sheet URL se **SPREADSHEET_ID** copy karo |
| 4 | Sheet ko **Share** karo — credentials.json wale **client_email** ko **Editor** do |
| 5 | `.env` me `SPREADSHEET_ID=your_id` add karo |
| 6 | Server **restart** karo |
| 7 | `http://localhost:3000/api/sheets-check` se check karo, phir form submit karke Sheet dekho |

Ye sab karne ke baad Sheet update hona chahiye.
