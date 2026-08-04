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
    footerLoaded.then(setupFooterYear);
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

// Set the footer copyright year to the current year, so it never needs manual
// updating (and never goes stale) — was previously hardcoded and had drifted.
function setupFooterYear() {
    var yearEl = document.getElementById('footer-year');
    if (!yearEl) return; // footer partial didn't load, nothing to populate
    yearEl.textContent = new Date().getFullYear();
}

// Populate footer contact info from the CMS-controlled settings file
function setupFooterContact() {
    var addressEl = document.getElementById('footer-address');
    if (!addressEl) return; // footer partial didn't load, nothing to populate

    fetch('data/settings.json?v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            var dom = window.HDICS.dom;
            document.getElementById('footer-address').textContent = data.address;

            var emailEl = document.getElementById('footer-email');
            emailEl.textContent = data.email;
            var safeEmail = dom.safeEmail(data.email, 'footer email');
            if (safeEmail) {
                emailEl.href = 'mailto:' + safeEmail;
            } else {
                emailEl.href = '#';
            }

            document.getElementById('footer-phone').textContent = data.phone;

            var fbEl = document.getElementById('footer-facebook');
            fbEl.textContent = data.facebook_display;
            var safeFacebookUrl = dom.safeExternalUrl(data.facebook_url, 'footer Facebook URL');
            fbEl.href = safeFacebookUrl || '#';
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

// Small DOM/URL helpers for safely rendering CMS-controlled JSON without HTML strings.
window.HDICS = window.HDICS || {};
window.HDICS.dom = (function () {
    function el(tag, options) {
        options = options || {};
        var node = document.createElement(tag);
        if (options.className) node.className = options.className;
        if (options.attrs) {
            Object.keys(options.attrs).forEach(function (name) {
                var value = options.attrs[name];
                if (value !== undefined && value !== null) node.setAttribute(name, value);
            });
        }
        if (options.text !== undefined && options.text !== null) node.textContent = options.text;
        return node;
    }

    function appendChildren(parent, children) {
        children.forEach(function (child) {
            if (child) parent.appendChild(child);
        });
        return parent;
    }

    function renderList(container, items, renderItem) {
        container.textContent = '';
        var fragment = document.createDocumentFragment();
        (Array.isArray(items) ? items : []).forEach(function (item, index) {
            var rendered = renderItem(item, index);
            if (rendered) fragment.appendChild(rendered);
        });
        container.appendChild(fragment);
    }

    function warn(message, value) {
        console.warn('[HDICS]', message, value);
    }

    function safeExternalUrl(value, label) {
        if (typeof value !== 'string' || !value.trim()) {
            warn('Missing external URL for ' + label, value);
            return null;
        }
        try {
            var parsed = new URL(value, window.location.href);
            if (parsed.protocol === 'https:') return parsed.href;
        } catch (err) {}
        warn('Rejected unsafe external URL for ' + label, value);
        return null;
    }

    function safeEmail(value, label) {
        if (typeof value !== 'string') {
            warn('Missing email for ' + label, value);
            return null;
        }
        var email = value.trim();
        if (/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) return email;
        warn('Rejected invalid email for ' + label, value);
        return null;
    }

    function safeLocalAsset(value, label) {
        if (typeof value !== 'string' || !value.trim()) {
            if (value) warn('Rejected invalid asset path for ' + label, value);
            return null;
        }
        var path = value.trim();
        if (/^(javascript|vbscript):/i.test(path) || /^data:text\/html/i.test(path)) {
            warn('Rejected unsafe asset path for ' + label, value);
            return null;
        }
        try {
            var parsed = new URL(path, window.location.href);
            if (parsed.origin !== window.location.origin) {
                warn('Rejected unexpected absolute asset URL for ' + label, value);
                return null;
            }
            return path;
        } catch (err) {
            warn('Rejected invalid asset path for ' + label, value);
            return null;
        }
    }

    function safeYouTubeId(value, label) {
        if (typeof value === 'string' && /^[A-Za-z0-9_-]+$/.test(value)) return value;
        if (value) warn('Rejected invalid YouTube ID for ' + label, value);
        return null;
    }

    return {
        el: el,
        appendChildren: appendChildren,
        renderList: renderList,
        safeExternalUrl: safeExternalUrl,
        safeEmail: safeEmail,
        safeLocalAsset: safeLocalAsset,
        safeYouTubeId: safeYouTubeId
    };
})();
