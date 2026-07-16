// Loads the shared nav and footer partials into every page, then wires up
// everything that depends on them (hamburger menu, active nav link, enroll
// toggle, footer contact info). Edit partials/nav.html or partials/footer.html
// once and every page picks it up — no more hand-editing six files.

document.addEventListener('DOMContentLoaded', function () {
    var navPlaceholder = document.getElementById('nav-placeholder');
    var footerPlaceholder = document.getElementById('footer-placeholder');

    var navLoaded = navPlaceholder
        ? fetch('partials/nav.html?v=' + Date.now())
            .then(res => res.text())
            .then(html => { navPlaceholder.innerHTML = html; })
            .catch(err => console.error('Nav partial failed to load:', err))
        : Promise.resolve();

    var footerLoaded = footerPlaceholder
        ? fetch('partials/footer.html?v=' + Date.now())
            .then(res => res.text())
            .then(html => { footerPlaceholder.innerHTML = html; })
            .catch(err => console.error('Footer partial failed to load:', err))
        : Promise.resolve();

    navLoaded.then(setupNav);
    footerLoaded.then(setupFooterContact);
    Promise.all([navLoaded, footerLoaded]).then(setupEnrollToggle);
});

// Hamburger toggle + active-link highlighting, run once the nav partial is in the DOM
function setupNav() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
        var isOpen = links.classList.toggle('open');
        toggle.classList.toggle('open', isOpen);
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    links.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            links.classList.remove('open');
            toggle.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Mark the current page's nav item as active, based on <body data-page="...">
    var currentPage = document.body.getAttribute('data-page');
    if (!currentPage) return;
    links.querySelectorAll('[data-nav]').forEach(function (li) {
        var pages = li.getAttribute('data-nav').split(' ');
        if (pages.indexOf(currentPage) !== -1) {
            li.classList.add('active');
        }
    });
}

// Populate footer contact info from the CMS-controlled settings file
function setupFooterContact() {
    var addressEl = document.getElementById('footer-address');
    if (!addressEl) return; // footer partial didn't load, nothing to populate

    fetch('data/settings.json?v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            document.getElementById('footer-address').textContent = data.address;

            var emailEl = document.getElementById('footer-email');
            emailEl.textContent = data.email;
            emailEl.href = 'mailto:' + data.email;

            document.getElementById('footer-phone').textContent = data.phone;

            var fbEl = document.getElementById('footer-facebook');
            fbEl.textContent = data.facebook_display;
            fbEl.href = data.facebook_url;
        })
        .catch(err => console.error('Settings data failed to load:', err));
}

// Site-wide Enroll Now toggle, controlled from the CMS (Enrollment Levels → "Enrollment Open?")
// Buttons are hidden by default (see shared.css .enroll-cta rule) — this only reveals
// them if the CMS explicitly says enrollment is open. Safe by default, no flash.
function setupEnrollToggle() {
    var ctas = document.querySelectorAll('.enroll-cta');
    if (!ctas.length) return;

    fetch('data/enroll.json?v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            if (data.enabled) {
                ctas.forEach(el => el.classList.remove('enroll-cta'));
            }
        })
        .catch(err => console.error('Enroll toggle check failed:', err));
}
