**LinkedIn Automation Scripts** ✨

A collection of browser automation scripts for streamlining tasks on LinkedIn, including post deletion, data cleanup, and more.

**Available Scripts** ⚡

• **Delete All LinkedIn Posts**  
Automates deleting every post from your LinkedIn activity feed.  
- What it does: Scrolls your activity, opens each post’s options, clicks “Delete post,” and confirms.  
- How to use:  
  1) Navigate to: https://www.linkedin.com/in/{username}/recent-activity/all/  
  2) Open Developer Console (F12 or Ctrl/Cmd+Shift+I)  
  3) Paste and run the contents of delete-all-linkedin-posts.js  
  4) The script handles confirmations automatically

• **Unlike All Liked Posts And Comments**  
Removes your likes from posts and comments across your activity feed and auto-clicks “Show more results” to fetch more items.  
- What it does:  
  - Scrolls to the bottom, clicks “Show more results” when available  
  - Clicks liked post buttons and liked comment buttons to unlike them  
  - Repeats until nothing is left to process  
- How to use:  
  1) Navigate to: https://www.linkedin.com/in/{username}/recent-activity/all/  
  2) Open Developer Console (F12 or Ctrl/Cmd+Shift+I)  
  3) Paste and run the contents of unlike-all-likes.js  
  4) The script auto-stops when no more items are found

**How To Run Any Script** 🧪  
1) Go to the LinkedIn page noted in the script’s instructions  
2) Open your browser’s Developer Console  
3) Paste the script code and press Enter  
4) Keep the tab focused and avoid interacting while it runs

**Notes And Safety** 🔒  
- These scripts are for personal use only.  
- LinkedIn’s UI can change; selectors may need updates.  
- Be gentle: rapid automation can trigger rate limits or flags.  
- Use at your own risk.

**Troubleshooting** 🛠️  
- The page isn’t loading more items:  
  - Ensure you’re on the correct URL (Recent Activity).  
  - The “Show more results” button text or classes may have changed—update the button detection in the script.  
- Nothing is being deleted/unliked:  
  - Confirm you’re viewing content you actually own (for deletion) or content you’ve liked (for unliking).  
  - Scroll a bit manually once to help LinkedIn hydrate the feed.

**Happy automating!** 🚀
