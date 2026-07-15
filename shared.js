document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');

    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
        var isOpen = links.classList.toggle('open');
        toggle.classList.toggle('open', isOpen);
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close the menu after tapping a link, so navigating (including same-page anchors) doesn't leave it open
    links.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            links.classList.remove('open');
            toggle.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
});

// Site-wide Enroll Now toggle, controlled from the CMS (Enrollment Levels → "Enrollment Open?")
// Buttons are hidden by default (see shared.css .enroll-cta rule) — this only reveals
// them if the CMS explicitly says enrollment is open. Safe by default, no flash.
document.addEventListener('DOMContentLoaded', function () {
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
});
