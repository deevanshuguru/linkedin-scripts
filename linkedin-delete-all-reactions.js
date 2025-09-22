// Halts execution for a certain number of seconds (ms-based)
function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

// Visible check helper
function isVisible(el) {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
}

// Finds the "Show more results" button (robust to dynamic IDs)
function findShowMoreResultsButton() {
  const candidates = document.querySelectorAll('button.scaffold-finite-scroll__load-button, button.artdeco-button');
  for (const btn of candidates) {
    const txt = (btn.textContent || '').trim().toLowerCase();
    if (txt.includes('show more results') && !btn.disabled && isVisible(btn)) {
      return btn;
    }
  }
  return null;
}

// Gets like buttons on posts you've thumbed up.
function getLikesOnPosts() {
  return document.querySelectorAll('.react-button__trigger.artdeco-button[aria-pressed="true"]');
}

// Gets like buttons on comments you've thumbed up.
function getLikesOnComments() {
  return document.querySelectorAll('.comments-comment-social-bar__like-action-button[aria-pressed="true"]');
}

// Forces click on "load more comments" buttons.
function loadMoreComments() {
  const btns = document.querySelectorAll('.button.comments-comments-list__show-previous-button');
  for (let i = 0; i < btns.length; i++) btns[i].click();
}

// Forces click on "load previous replies" buttons.
function loadPreviousReplies() {
  const btns = document.querySelectorAll('button.show-prev-replies');
  for (let i = 0; i < btns.length; i++) btns[i].click();
}

// Scrolls and tries to load more activity (including clicking "Show more results")
function loadMoreActivity() {
  window.scrollTo(0, document.body.scrollHeight);
  loadMoreComments();
  loadPreviousReplies();
  const showMore = findShowMoreResultsButton();
  if (showMore) {
    showMore.click();
    return true; // clicked the button
  }
  return false; // no button found
}

// Clicks all visible liked buttons on posts and comments to "unlike"
function deleteActivity() {
  const likesOnPosts = getLikesOnPosts();
  for (let i = 0; i < likesOnPosts.length; i++) {
    try { likesOnPosts[i].click(); } catch (e) {}
  }
  const likesOnComments = getLikesOnComments();
  for (let i = 0; i < likesOnComments.length; i++) {
    try { likesOnComments[i].click(); } catch (e) {}
  }
}

// Main loop with simple auto-stop when nothing new appears
let keepGoing = true;
async function init() {
  console.log('*** Starting activity cleanup ***');
  let emptyRounds = 0;
  const MAX_EMPTY_ROUNDS = 5;

  while (keepGoing) {
    console.log('>>> Loading more activity');
    const clickedShowMore = loadMoreActivity();
    await sleep(clickedShowMore ? 2 : 1);

    console.log('>>> Deleting loaded activity');
    deleteActivity();
    await sleep(2);

    const remainingLikes = getLikesOnPosts().length + getLikesOnComments().length;
    if (remainingLikes === 0 && !clickedShowMore) {
      emptyRounds += 1;
    } else {
      emptyRounds = 0;
    }

    if (emptyRounds >= MAX_EMPTY_ROUNDS) {
      console.log('No more activity to process. Stopping.');
      break;
    }
  }
}

init();
