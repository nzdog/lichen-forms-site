# Session-Specific Follow-Up Links Guide

This guide explains how to create and use session-specific follow-up links for your Lichen Protocol sessions.

## Why Session-Specific Links?

When a founder has multiple sessions, you want their follow-up responses to go to the correct session. Session-specific links ensure that:
- 24-hour follow-ups go to the right session
- 7-day follow-ups go to the right session
- Multiple sessions can have separate follow-up data

## How It Works

Each follow-up link includes the Notion session page ID as a URL parameter:
```
https://yoursite.com/followup-24h.html?session=SESSION_PAGE_ID
https://yoursite.com/followup-7d.html?session=SESSION_PAGE_ID
```

When the founder submits the form, it automatically targets that specific session.

---

## Step-by-Step: Creating Session Links

### 1. Create a Session Page in Notion

1. Open the founder's page in your Founders database
2. Create a new child page (e.g., "Session_01_protocol")
3. Add your session template content

### 2. Get the Session Page ID

**Method A: From the URL**
1. Open the session page in Notion
2. Look at the URL in your browser:
   ```
   https://www.notion.so/Session_01_protocol-abc123def456?v=...
   ```
3. The session ID is the part after the page name and before the `?`:
   ```
   abc123def456
   ```
   (It's a 32-character string of letters and numbers)

**Method B: Copy Link**
1. Right-click the session page
2. Click "Copy link"
3. The link will look like:
   ```
   https://www.notion.so/abc123def456?v=...
   ```
4. Extract the 32-character ID from the URL

**Method C: Share Menu**
1. Click "Share" on the session page
2. Click "Copy link"
3. Extract the ID from the copied link

### 3. Construct the Follow-Up URLs

Replace `SESSION_PAGE_ID` with the ID you copied:

**24-Hour Follow-Up:**
```
https://yoursite.netlify.app/followup-24h.html?session=SESSION_PAGE_ID
```

**7-Day Follow-Up:**
```
https://yoursite.netlify.app/followup-7d.html?session=SESSION_PAGE_ID
```

### 4. Send Links to the Founder

Send these custom URLs to the founder via:
- Email
- Slack/Discord message
- Calendar invite
- SMS

---

## Example Workflow

1. **Founder completes intake form** → Creates founder record in Notion
2. **You schedule a session** → Create session page "Session_01_protocol"
3. **Copy session page ID** → `f8d7e6c5b4a39281`
4. **Create follow-up links:**
   - 24h: `https://lichen.site/followup-24h.html?session=f8d7e6c5b4a39281`
   - 7d: `https://lichen.site/followup-7d.html?session=f8d7e6c5b4a39281`
5. **Conduct the session** → Record notes in session page
6. **Send 24h link** → Founder receives it ~20 hours after session
7. **Founder submits 24h form** → Responses append to Session_01
8. **Send 7d link** → Founder receives it ~6.5 days after session
9. **Founder submits 7d form** → Responses append to Session_01

If the founder has another session:
- Create "Session_02_protocol"
- Generate new links with Session_02's ID
- Responses go to the correct session

---

## Fallback Behavior

If you send a follow-up link **without** a session ID:
```
https://yoursite.com/followup-24h.html
```

The system will:
1. Find the founder by email
2. Use the **most recent session** (last child page)
3. Append responses there

This is useful for:
- Founders with only one session
- Quick testing
- Backwards compatibility

---

## Notion Session Page ID Format

Session IDs are **32 characters** long and contain:
- Lowercase letters (a-z)
- Numbers (0-9)
- No dashes, spaces, or special characters

**Valid examples:**
- `f8d7e6c5b4a392817f6e5d4c3b2a1908`
- `abc123def456789012345678901234ab`

**Invalid examples:**
- `f8d7-e6c5-b4a3` (too short, has dashes)
- `Session_01_protocol` (page name, not ID)

---

## Testing Session Links

### Test with a specific session:
1. Create a test founder via the intake form
2. Create a session page under that founder
3. Get the session ID
4. Construct the URL: `https://yoursite.com/followup-24h.html?session=YOUR_SESSION_ID`
5. Fill out the form using the test founder's email
6. Check the session page - responses should appear there

### Test fallback (no session ID):
1. Use the URL without session parameter: `https://yoursite.com/followup-24h.html`
2. Submit with the founder's email
3. Responses go to the most recent session

---

## Troubleshooting

### "No sessions found for this founder"
- The founder hasn't completed the intake form
- You haven't created any session pages under the founder
- **Solution:** Create a session page as a child page under the founder in Notion

### Responses going to wrong session
- The session ID in the URL is incorrect
- The session ID points to a different founder's session
- **Solution:** Double-check you copied the correct session ID

### "Failed to submit follow-up"
- Invalid session ID format
- Session page doesn't exist or was deleted
- **Solution:** Verify the session page exists in Notion and the ID is correct

---

## Pro Tips

1. **Save links in Notion:** Add a "24h Link" and "7d Link" property to your session pages to store the URLs

2. **Automate with templates:** Create a Notion template button that auto-generates the links

3. **Track sent status:** Add properties like "24h Sent" (checkbox) and "7d Sent" (checkbox) to track which links you've sent

4. **Calendar reminders:** Add the follow-up links to calendar events scheduled 24h and 7d after sessions

5. **Email templates:** Create email templates with placeholder `{{24H_LINK}}` and `{{7D_LINK}}` that you fill in

---

## Questions?

Contact: nigel@lichenprotocol.com
