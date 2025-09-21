async function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function waitForSelector(selector, timeoutSec = 10, parent = document) {
    const end = Date.now() + timeoutSec * 1000;
    while (Date.now() < end) {
        const el = parent.querySelector(selector);
        if (el) return el;
        await sleep(0.3);
    }
    throw "Timeout for: " + selector;
}

// Returns array of all visible "more actions" buttons
function getEditButtons() {
    return Array.from(document.querySelectorAll('.feed-shared-control-menu__trigger')).filter(
        btn => btn.offsetParent !== null  // visible only
    );
}

// Finds the "Delete post" button in the menu
function findDeleteButtonInMenu() {
    // Robust: find LI.option-delete, then the button inside
    const li = document.querySelector('.feed-shared-control-menu__content li.option-delete');
    if (li) {
        return li.querySelector('div[role="button"]');
    }
    return null;
}

// Finds and clicks the confirm delete button in modal
function findConfirmButton() {
    // Button text: Delete (sometimes Confirm, just in case)
    return Array.from(document.querySelectorAll('button.artdeco-button--primary.artdeco-button--2'))
        .find(btn => /delete|confirm/i.test(btn.textContent.trim()));
}

async function deleteAllPosts() {
    let deleted = 0, round = 1;
    while (true) {
        const btns = getEditButtons();
        if (!btns.length) {
            console.log("No more visible posts, quitting.");
            break;
        }
        for (let btn of btns) {
            try {
                btn.scrollIntoView({block: "center"});
                await sleep(0.5);
                btn.click();

                // Wait for menu to appear
                await waitForSelector('.feed-shared-control-menu__content', 5);

                // Find delete button precisely as in your HTML
                let delBtn = null, delTimeout = 0, found = false;
                while (!delBtn && delTimeout++ < 20) { // up to 6 seconds
                    delBtn = findDeleteButtonInMenu();
                    await sleep(0.3);
                }
                if (!delBtn) {
                    document.body.click(); // close menu
                    await sleep(0.3);
                    continue;
                }

                delBtn.click();
                // Wait for the confirmation modal and button
                let modalTimeout = 0, confirm = null;
                while (!confirm && modalTimeout++ < 20) {
                    confirm = findConfirmButton();
                    await sleep(0.3);
                }
                if (!confirm) throw "Confirmation (Delete) button not found!";
                confirm.click();

                deleted++;
                console.log(`[${deleted}] Post deleted.`);
                await sleep(2); // let LinkedIn remove post
            } catch (err) {
                console.warn("Error with post, continuing...", err);
            }
        }
        window.scrollTo(0, document.body.scrollHeight);
        await sleep(2.5);
        round++;
    }
    console.log(`[FINISHED] Deleted ${deleted} posts!`);
}

deleteAllPosts();
