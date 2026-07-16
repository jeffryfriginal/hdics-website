# Holy Deliverance Integrated Christian School (HDICS) Website

This is the official repository for the HDICS website. It serves our students, parents, and the community in Angono, Rizal.

We deliberately built this site without a heavy, traditional content management system. The static architecture keeps the site lightweight, fast, and secure. It requires almost zero server maintenance.

The technical stack is built for simplicity. We use standard HTML5 and CSS3 for structure and styling, while GitHub Pages handles the live hosting. To keep content fresh without requiring developers to rewrite HTML, we use JavaScript to fetch dynamic data from JSON files. Decap CMS acts as the bridge for this process. It gives our staff a clean visual interface to manage site content, which then updates those underlying JSON files automatically. For data collection like enrollment and inquiries, we embed Google Forms to handle information securely without maintaining our own backend database.

The repository structure is strict so future maintainers know exactly where to look. The root directory contains the core HTML pages. The `data` folder holds the JSON files managed by Decap CMS. All static images and media live in the `assets` folder. Global styles and logic are kept in `shared.css` and `shared.js` to ensure consistency across the entire site.

Deployment is completely automated. Any code pushed to the `main` branch immediately builds and deploys to the live server.

## License
MIT License
