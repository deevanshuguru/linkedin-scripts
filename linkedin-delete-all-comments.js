async function sleep(seconds) {
  return new Promise(res => setTimeout(res, seconds * 1));
}

function isVisible(el) {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
}

function normText(el) {
  return ((el && el.textContent) || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

// Click "Show more results" only if present; otherwise rely on scroll auto-load
function findShowMoreResultsButton() {
  const btns = document.querySelectorAll('button.scaffold-finite-scroll__load-button, button.artdeco-button');
  for (const btn of btns) {
    const txt = normText(btn);
    if (txt.includes('show more results') && !btn.disabled && isVisible(btn)) return btn;
  }
  return null;
}

// Identify your own comments via the "• You" marker
function getMyCommentContainers() {
  const containers = document.querySelectorAll('.comments-comment-meta__container');
  const mine = [];
  for (const c of containers) {
    const data = c.querySelector('.comments-comment-meta__description .comments-comment-meta__data');
    if (data && data.textContent.includes('• You')) mine.push(c);
  }
  return mine;
}

// Wait until a predicate returns a value or timeout
async function waitFor(fn, { timeoutMs = 6000, intervalMs = 120 } = {}) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    const v = fn();
    if (v) return v;
    await sleep(intervalMs / 1000);
  }
  return null;
}

// Open the options dropdown for a comment
async function openOptions(container) {
  const dropdownWrapper = container.querySelector('.comments-comment-meta__options .artdeco-dropdown');
  const trigger = dropdownWrapper ? dropdownWrapper.querySelector('button.artdeco-dropdown__trigger') : null;
  if (!trigger) return null;

  trigger.click();

  // The content lives under .artdeco-dropdown__content > .artdeco-dropdown__content-inner
  const content = await waitFor(() => {
    const c = dropdownWrapper.querySelector('.artdeco-dropdown__content');
    if (!c || !isVisible(c)) return null;
    const inner = c.querySelector('.artdeco-dropdown__content-inner');
    return inner && inner.children.length > 0 ? inner : null;
  }, { timeoutMs: 4000 });

  return content;
}

// Click the "Delete" option in the dropdown (matches the menu HTML you shared)
function clickDeleteInMenu(content) {
  const items = content.querySelectorAll('.artdeco-dropdown__content-inner .artdeco-dropdown__item.option-button');
  for (const item of items) {
    const label = item.querySelector('.comment-options-dropdown__option-text .t-bold');
    if (label && normText(label) === 'delete') {
      item.click();
      return true;
    }
  }
  // Fallback: text search
  const all = content.querySelectorAll('button, [role="button"], .artdeco-dropdown__item, .option-button, span, div');
  for (const el of all) {
    if (normText(el).includes('delete')) {
      const actionable = el.closest('button, [role="button"], .artdeco-dropdown__item, .option-button') || el;
      if (isVisible(actionable)) { actionable.click(); return true; }
    }
  }
  return false;
}

// Confirm the delete in the modal (targets comments-delete-comment-modal)
async function confirmDeleteModal(targetArticle) {
  const modal = await waitFor(() => {
    const m = document.querySelector('.comments-delete-comment-modal');
    return m && isVisible(m) ? m : null;
  }, { timeoutMs: 6000 });

  const activeModal = modal || await waitFor(() => {
    const m = document.querySelector('.artdeco-modal');
    const header = m ? m.querySelector('h2, h3') : null;
    return (m && isVisible(m) && header && normText(header).includes('delete your comment')) ? m : null;
  }, { timeoutMs: 3000 });

  if (!activeModal) return false;

  // Click the confirm "Delete" button
  const buttons = activeModal.querySelectorAll('.artdeco-modal__actionbar button, button');
  let confirmBtn = null;
  for (const b of buttons) {
    if (normText(b).includes('delete')) { confirmBtn = b; break; }
  }
  if (!confirmBtn) return false;

  confirmBtn.click();

  // Wait for modal to close or the comment to disappear
  const closed = await waitFor(() => {
    const stillModal = document.querySelector('.comments-delete-comment-modal, .artdeco-modal');
    const modalGone = !stillModal || !isVisible(stillModal);
    const articleGone = targetArticle ? !document.body.contains(targetArticle) : false;
    return modalGone || articleGone;
  }, { timeoutMs: 8000 });

  return !!closed;
}

// Delete one comment by its container
async function deleteComment(container) {
  try {
    const article = container.closest('article.comments-comment-entity') || container;
    container.scrollIntoView({ block: 'center', inline: 'nearest' });

    const menu = await openOptions(container);
    if (!menu) return false;

    const clickedDelete = clickDeleteInMenu(menu);
    if (!clickedDelete) return false;

    const confirmed = await confirmDeleteModal(article);
    return confirmed;
  } catch (_) {
    return false;
  }
}

// Auto-load step: rely on scroll; click "Show more results" only if visible
async function autoloadStep() {
  const prevHeight = document.body.scrollHeight;
  window.scrollTo(0, prevHeight);
  await sleep(1.2); // give auto-load time
  const showMore = findShowMoreResultsButton();
  if (showMore) {
    showMore.click();
    await sleep(1.5);
  }
  return document.body.scrollHeight > prevHeight;
}

// Main loop
(async function runDeleteMyComments() {
  console.log('*** Starting LinkedIn comment deletion ***');
  const processed = new WeakSet();
  let totalDeleted = 0;
  let idleRounds = 0;
  const MAX_IDLE_ROUNDS = 6;

  while (true) {
    const mine = getMyCommentContainers().filter(c => !processed.has(c));

    if (mine.length === 0) {
      const grew = await autoloadStep();
      const after = getMyCommentContainers().filter(c => !processed.has(c));
      if (!grew && after.length === 0) {
        idleRounds += 1;
        if (idleRounds >= MAX_IDLE_ROUNDS) {
          console.log(`No more comments found after ${MAX_IDLE_ROUNDS} attempts. Stopping.`);
          break;
        }
      } else {
        idleRounds = 0;
      }
      continue;
    }

    for (const c of mine) {
      const ok = await deleteComment(c);
      processed.add(c);
      if (ok) {
        totalDeleted += 1;
        console.log(`Deleted comment. Total deleted: ${totalDeleted}`);
      } else {
        console.log('Skip/failed to delete one comment.');
      }
      await sleep(1.0);
    }

    await sleep(1.2);
  }

  console.log(`*** Done. Deleted ${totalDeleted} comments. ***`);
})();
