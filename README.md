# Document Viewer Project

An interactive multi-page document viewer built with Vanilla HTML5, CSS3, and JavaScript.

## Folder Structure
```
D:\Softwares\Program Files (x86)\Arif\
??? assets\
?   ??? images\
?       ??? page1.jpg      (Australian Government Visa Application Document)
?       ??? page2.jpg      (Employment Contract - Page 1)
?       ??? page3.jpg      (Employment Contract - Page 2)
??? css\
?   ??? styles.css        (Executive dark theme, glassmorphism, responsive styles)
??? js\
?   ??? app.js            (Page state management, arrow visibility, keyboard & gestures)
??? index.html            (Interactive SPA viewer with seamless transition)
??? page1.html            (Direct Page 1 with Next arrow only)
??? page2.html            (Direct Page 2 with Prev and Next arrows)
??? page3.html            (Direct Page 3 with Prev arrow only)
??? server.js             (Lightweight Node.js HTTP server)
??? package.json          (Start script)
??? README.md             (Documentation)
```

## Navigation Specifications
- **Page 1**: Displays the Australian Visa Application document. Only the **Next (?)** arrow is visible.
- **Page 2**: Displays Employment Contract (Page 1). Both **Previous (?)** and **Next (?)** arrows are visible.
- **Page 3**: Displays Employment Contract (Page 2). Only the **Previous (?)** arrow is visible.

## Running on Localhost
The server is running at:
- **Main Interactive App**: [http://localhost:3000/](http://localhost:3000/)
- **Direct Page 1**: [http://localhost:3000/page1.html](http://localhost:3000/page1.html)
- **Direct Page 2**: [http://localhost:3000/page2.html](http://localhost:3000/page2.html)
- **Direct Page 3**: [http://localhost:3000/page3.html](http://localhost:3000/page3.html)

To start the server anytime in PowerShell:
```powershell
cd "D:\Softwares\Program Files (x86)\Arif"
node server.js
```
Or with npm:
```powershell
npm start
```

## Extra Features Included
- **Keyboard Navigation**: Press `Left Arrow` (`?`) or `Right Arrow` (`?`) / `Space`.
- **Touch Swipe**: On mobile/touchscreens, swipe left or right.
- **Zoom & Reset**: Zoom in/out buttons in the bottom dock, or click on the image.
- **Fullscreen Mode**: Press `F` or click the fullscreen button.
- **Offline / Direct File Support**: You can also open `index.html` or `page1.html` directly in any web browser without needing a server.
