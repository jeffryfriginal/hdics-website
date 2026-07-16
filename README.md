Holy Deliverance Integrated Christian School (HDICS) Website
This is the official repository for the HDICS website, serving our students, parents, and the community in Angono, Rizal. We built this site using a static architecture to ensure it remains lightweight, fast, secure, and requires almost zero server maintenance.

Technical Stack
Frontend: Built with standard HTML5 and CSS3 for structure and styling.

Hosting: Managed by GitHub Pages for reliable, live deployment.

Content Management: Powered by Decap CMS, which provides a clean visual interface for staff to manage content without touching the code.

Dynamic Logic: Uses JavaScript to fetch content from JSON files, keeping the site fresh without manual HTML updates.

Data Collection: Utilizes embedded Google Forms for secure enrollment and inquiries, eliminating the need for a custom backend database.

Repository Structure
Root Directory: Contains all primary .html files.

/data/: Stores JSON files populated and managed by Decap CMS.

/assets/: Houses all static images and media files.

shared.css: Centralizes global styles to maintain design consistency.

shared.js: Contains the logic for site-wide functionality and dynamic data fetching.

Deployment Process
Automated Pipeline: The deployment process is fully automated. Any code pushed to the main branch immediately triggers a build and deploys the updates to the live server.

License
MIT License
