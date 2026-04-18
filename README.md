# HolisDen
HolisDen website — RTT® &amp; Hypnotherapy practice, New Plymouth NZ

# HolisDen — Healing and Renewal

Website and client management system for **HolisDen**, an RTT® 
(Rapid Transformational Therapy) and Hypnotherapy practice based 
in New Plymouth, New Zealand.

**Practitioner:** Marina Coetzee  
**Website:** [www.holisden.com](https://www.holisden.com)

---

## 🌿 About HolisDen

HolisDen is a safe and compassionate space where Marina guides 
clients to empowerment, transformation and healing through:

- **RTT® (Rapid Transformational Therapy)** — created by Marisa Peer
- **Clinical Hypnotherapy**

Serving clients in-person (New Plymouth, NZ) and online worldwide.

---

## 📁 Repository Structure

| File | Description |
|------|-------------|
| `index.html` | Main website (single-page) |
| `README.md` | This file |

> **Note:** `Code.gs` is maintained privately in Google Apps Script 
> and is not stored in this repository for security reasons.|
> **Note:** `ClientPortal.html` is maintained privately in Google Apps Script 
> and is not stored in this repository for security reasons.

---

## 🖥️ Tech Stack

### Phase 1 — Current (POC)
| Layer | Technology |
|-------|-----------|
| Hosting | GitHub Pages |
| Domain | holisden.com |
| Frontend | HTML, CSS, JavaScript |
| Backend | Google Apps Script |
| Database | Google Sheets |
| Email | Gmail via GAS |

### Phase 2 — Planned Migration
| Layer | Technology |
|-------|-----------|
| Hosting | Oracle Cloud Infrastructure (OCI) |
| Frontend | Oracle APEX |
| Database | Oracle Database |
| Backend | PL/SQL, REST APIs |

---

## 📄 Pages & Features

### index.html — Main Website
- Hero section with brand identity
- About Marina (background, qualifications)
- What is RTT®? (method explanation)
- Services & issues cloud (30+ conditions)
- 4-step process journey
- Client testimonials
- Contact form with validation
- Google Apps Script form backend integration

### ClientPortal.html — Client Portal
Three-step portal sent to clients after initial booking call:

1. **Step 1 — Contact & Enquiry**
   - Personal details, topic, format preference
   - Sends notification email to practitioner
   - Sends auto-reply confirmation to client

2. **Step 2 — Client Intake Form**
   - Full personal and health details
   - 60+ condition checkbox grid
   - Emergency contact information
   - Medical history

3. **Step 3 — Informed Consent**
   - Full RTT® consent document
   - Digital signature canvas pad
   - Session recording agreement
   - Sends signed copy to client via email

### Code.gs — Google Apps Script Backend
- Handles all three form submissions via `doPost()`
- Logs data to Google Sheets (3 tabs: Enquiries, Client Intake, Consents)
- Sends branded HTML notification emails to practitioner
- Sends confirmation and auto-reply emails to clients

---

## 🚀 Deployment

### GitHub Pages Setup
1. Rename `holisden_website.html` → `index.html`
2. Upload files to this repository
3. Settings → Pages → Deploy from branch → `main` → `/ (root)`
4. Site live at: `https://camvisagieza.github.io/HolisDen`

### Custom Domain (holisden.com)
Add these DNS records at your domain registrar:

| Type | Name | Value |
|------|------|-------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | camvisagieza.github.io |

Then: Settings → Pages → Custom domain → `holisden.com` → Enforce HTTPS

---

## ⚙️ Google Apps Script Setup

1. Create a Google Spreadsheet — copy the ID into `Code.gs`
2. Open Extensions → Apps Script in the spreadsheet
3. Create two files: `Code.gs` and `ClientPortal.html`
4. Deploy as Web App (Execute as Me, Anyone can access)
5. Paste the Web App URL into `ClientPortal.html` and `index.html`
6. Run `testSetup()` once to authorise Gmail + Sheets access

---

## 🗺️ Migration Plan (Phase 2 — Oracle APEX/OCI)

**Trigger:** When practice outgrows Google Sheets  
**Data migration:** CSV export from Sheets → Oracle tables via SQL*Loader  
**Cutover:** Single DNS record change — clients notice nothing

Tables planned:
- `CLIENTS` — client master record
- `SESSIONS` — session history and notes
- `INTAKE_FORMS` — intake data linked to clients
- `CONSENTS` — consent records with digital signature reference
- `ENQUIRIES` — initial contact and enquiry log

---

## 🤖 Claude Integration

This repository is connected to Claude.ai for AI-assisted development.

Tag `@claude` in any issue or pull request comment for:
- Content updates and copy changes
- Bug fixes and UI improvements
- New feature implementation
- Code review and suggestions

---

## 📋 Roadmap

- [x] Main website (single-page)
- [x] Contact form with GAS backend
- [x] Client intake form
- [x] Digital consent form with signature pad
- [x] Email notifications (practitioner + client)
- [x] Google Sheets logging
- [ ] Custom domain (holisden.com) connected
- [ ] Calendly booking integration
- [ ] Blog / resources section
- [ ] Google Analytics
- [ ] Oracle APEX migration (Phase 2)
- [ ] Authenticated client portal (Phase 2)
- [ ] Integrated payments (Phase 2)

---

## 🔒 Privacy & Security

- No client data is stored in this repository
- All form submissions handled via Google Apps Script
- Client data stored in a private Google Spreadsheet
- Consent forms comply with the New Zealand Privacy Act 2020
- HTTPS enforced via GitHub Pages

---
