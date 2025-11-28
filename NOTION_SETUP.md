# Notion Integration Setup Guide

This guide will help you connect your Lichen Forms to your Notion database.

## Prerequisites

- A Notion account
- A Notion database for storing form submissions (ID: `c2fd12ff138b4ffab4770decf5cb2420`)
- Session pages created manually under each founder
- A Netlify account for hosting

---

## Step 1: Create Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Click **"+ New integration"**
3. Fill in the details:
   - **Name**: "Lichen Forms" (or any name you prefer)
   - **Associated workspace**: Select the workspace containing your database
   - **Capabilities**: Make sure "Read content", "Update content", and "Insert content" are enabled
4. Click **"Submit"**
5. **Copy the "Internal Integration Token"** - you'll need this for Step 3

---

## Step 2: Connect Integration to Your Database

1. Open your Notion database in Notion
2. Click the **"..."** menu in the top right corner
3. Go to **"Connections"** → **"Connect to"**
4. Select your "Lichen Forms" integration from the list

---

## Step 3: Add Required Properties to Your Founder Database

Your Founders database needs these properties for the **intake form**:

### Required Properties:

1. **Name** - Title ✓ (already exists)
2. **Email** - Email ✓ (already exists)
3. **Startup Name** - Text ✓ (already exists)
4. **Role** - Text ✓ (already exists)
5. **Intake Timestamp** - Date ✓ (already exists)
6. **Intake Source** - Select ✓ (already exists, should have "Website" option)
7. **Sessions** - Relation ✓ (already exists, points to session pages)
8. **Q1** - Text (or Long text) - **Field theory question 1**
9. **Q2** - Text (or Long text) - **Field theory question 2**
10. **Q3** - Text (or Long text) - **Field theory question 3**
11. **Q4** - Text (or Long text) - **Field theory question 4**
12. **Q5** - Text (or Long text) - **Field theory question 5**
13. **Q6** - Text (or Long text) - **Field theory question 6**

**To add Q1-Q6 properties:**
- Click the **"+"** button at the right end of your database header
- Select **"Text"** as the property type (or "Long text" if you expect lengthy responses)
- Name it exactly **"Q1"**, **"Q2"**, etc.
- Repeat for all 6 properties

---

## Step 4: Session Page Structure

Sessions are **pages** (not database entries) that live as child pages under each founder.

### Each session page should have this structure:

**Properties:**
- Date
- Duration
- Protocol
- Recording Link
- Transcript Link

**Content sections:**
- Human Summary
- Machine Summary
- Debrief
- **Follow-Up** (heading 2)
  - **24-hour update** (heading 3) - Leave blank
  - **7-day update** (heading 3) - Leave blank
- Files

**Important**: The form handler will automatically create the Follow-Up section if it doesn't exist, but it's better to include it in your template.

---

## Step 5: Configure Netlify Environment Variables

1. Log in to your Netlify dashboard
2. Go to your site's settings
3. Navigate to **"Site configuration"** → **"Environment variables"**
4. Add the following variables:

   - **Key**: `NOTION_API_KEY`
     **Value**: Your integration token from Step 1

   - **Key**: `NOTION_DATABASE_ID`
     **Value**: `c2fd12ff138b4ffab4770decf5cb2420`

5. Click **"Save"**

---

## Step 6: Deploy to Netlify

### Option A: Deploy via Git

1. Push your code to GitHub (or GitLab/Bitbucket)
2. Connect your repository to Netlify
3. Netlify will automatically detect the configuration and deploy

### Option B: Manual Deploy

1. Run `npm install` in your project directory
2. Deploy using Netlify CLI:
   ```bash
   netlify deploy --prod
   ```

---

## Step 7: Test Your Forms

1. Visit your deployed site
2. Fill out the intake form with test data
3. Check your Notion database - a new entry should appear with Q1-Q6 filled in
4. Manually create a session page under the new founder (add it to the Sessions relation)
5. Test the 24h follow-up form using the same email
6. Check the session page - responses should appear under "Follow-Up" → "24-hour update"
7. Test the 7d follow-up form
8. Check that responses appear under "Follow-Up" → "7-day update"

---

## How It Works

### Intake Form Flow:
1. User fills out the intake questionnaire
2. Form submits to `/.netlify/functions/submit-intake`
3. Function checks if founder with this email already exists
4. If exists: updates the existing founder record
5. If new: creates a new founder page in the database
6. All Q1-Q6 responses are stored as properties
7. User is redirected to thank you page

### Follow-Up Form Flow:
1. User fills out 24h or 7d follow-up form (must use same email from intake)
2. Form submits to `/.netlify/functions/submit-followup`
3. Function finds the founder by email
4. Function gets the most recent session from the Sessions relation
5. Function retrieves the session page's content blocks
6. Function finds (or creates) the "Follow-Up" section
7. Function finds (or creates) the "24-hour update" or "7-day update" heading
8. Function appends formatted responses as paragraph blocks under that heading
9. User is redirected to thank you page

**Important**: Follow-up responses are appended to the **page content** (not stored as properties). Each submission adds a timestamped entry, so multiple submissions are preserved.

---

## Troubleshooting

### "No founder found with this email"
- The user needs to complete the intake form first
- Make sure the email matches exactly (check for typos, spaces)

### "No sessions found for this founder"
- The Sessions relation is empty for this founder
- You need to manually create a session page and link it to the founder via the Sessions relation property

### Forms not submitting
- Check that environment variables are set correctly in Netlify
- Check the Netlify Functions logs for error details
- Ensure the Notion integration is connected to the database

### "Failed to submit form"
- Check that all required Notion properties exist (especially Q1-Q6)
- Verify the integration has proper permissions
- Check Netlify Functions logs for specific error messages

### Duplicate check not working
- Ensure the Email property type is set to "Email" (not Text)
- The duplicate check is case-sensitive for email addresses

### Follow-up responses not appearing
- Verify that session pages are properly linked in the Sessions relation
- Check that the session page structure includes heading blocks (not just text)
- The function will auto-create headings if missing, but may append at unexpected locations

---

## Security Notes

- Never commit your `.env` file or Notion API key to version control
- The `.gitignore` file is configured to exclude sensitive files
- Environment variables are only accessible server-side (in Netlify Functions)
- Form submissions are encrypted in transit (HTTPS)

---

## Architecture Summary

```
Founders Database
│
├── Founder: "Jane Doe"
│   ├── Email: jane@example.com
│   ├── Q1-Q6: [intake responses]
│   ├── Sessions: [relation]
│   │
│   └── Child Pages:
│       └── Session_01_protocol
│           └── Follow-Up
│               ├── 24-hour update → [appended blocks from form]
│               └── 7-day update → [appended blocks from form]
```

---

## Questions?

If you encounter issues, check:
1. Netlify Functions logs in your Netlify dashboard
2. Browser console for JavaScript errors
3. Notion integration permissions

Contact: nigel@lichenprotocol.com
