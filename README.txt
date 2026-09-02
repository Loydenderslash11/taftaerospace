Taft Aerospace Open House

Open index.html directly for a static preview.

To make new stations appear for every visitor, run the shared server from this
folder:

node server.js

Then have visitors open the same hosted URL. Stations added through the form are
saved in data/stations.json and appear for new visitors on that server.
Every station card has a Remove button. On the hosted shared server, removing a
station deletes it or hides it from the shared list for every visitor. In private
mode, removals only affect the current browser.

GitHub Pages serves static files only, so it will not run server.js. For shared
submissions, host this folder as a Node web service instead. On hosts that reset
the filesystem during deploys, set DATA_DIR to a persistent disk/folder so
stations.json survives restarts.

Render Web Service setup

1. Put the contents of this taft-aerospace folder at the root of your GitHub
   repo.
2. In Render, create a New Web Service and connect that repo.
3. Use these settings:
   Build command: npm install
   Start command: npm start
   Environment: Node
4. Add an environment variable:
   DATA_DIR=/var/data
5. Add a persistent disk:
   Mount path: /var/data
   Size: 1 GB

The included render.yaml can fill in those settings automatically if you deploy
with Render Blueprints. A persistent disk is the key part for the add-station
form: it lets new stations stay saved after Render restarts or redeploys the
site. Without a disk, the site still works, but visitor-added stations can reset
after a restart.

Render currently requires a paid web service for persistent disks. If you use
Render's free service without a disk, visitors can still add stations while the
server is running, but those added stations may disappear after a restart,
sleep/wake cycle, or redeploy. The seven built-in class stations remain part of
the website either way. If you stay on Render Free, either remove the DATA_DIR
environment variable or leave it set to /var/data after uploading the latest
server.js; the server will fall back to a temporary writable folder instead of
crashing.

For a custom domain, add the domain inside your Render service settings and use
the DNS records Render gives you. If you want shared station submissions, point
the custom domain to Render, not GitHub Pages.
