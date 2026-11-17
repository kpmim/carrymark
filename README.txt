STUDENT MARKS CHECKER — SETUP

DATA SOURCE
This project is configured for the supplied Google Sheets workbook and these exact tabs:
- M 2063 - 3A  (note the trailing space in the actual tab name)
- M 2614 - 4A
- M 2614 - 4C

MARK CALCULATION
DCD3A: Quiz (column E) + Project 1 (column G) + Project 2 (column I), display /50.
DCD4A and DCD4C: Written Test (E) + Project 1 (G) + Project 2 (I), display /70.
Project 3 is excluded completely; column K is never read.
The displayed 3D assessment marks use the weighted marks already present in E, G and I.

INSTALL GOOGLE APPS SCRIPT
1. Open the original Google spreadsheet.
2. Choose Extensions > Apps Script.
3. Replace the editor contents with Code.gs from this project.
4. Save.
5. Choose Deploy > New deployment > Web app.
6. Execute as: Me.
7. Who has access: Anyone (read the privacy note below before enabling).
8. Deploy and copy the Web app URL ending in /exec.

CONNECT THE WEBSITE
1. Open script.js.
2. Replace PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE with the deployed /exec URL.
3. Save and upload index.html, style.css and script.js to the GitHub Pages repository.
4. Code.gs is installed in Apps Script; it does not need to be uploaded to GitHub.

PRIVACY WARNING
The web app endpoint returns a student's marks when queried with their student ID.
If deployed with public access, someone who knows or guesses student IDs may retrieve records.
Do not publish real student marks in this GitHub repository. Consider adding a student PIN/login or another access-control layer before sharing the site publicly.

SMART ID SEARCH
Hyphens, spaces and punctuation are ignored when matching student IDs.
