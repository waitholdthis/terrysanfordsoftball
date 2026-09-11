/* Terry Sanford Softball Service Worker — offline-first */

const CACHE = 'ts-softball-v3';
const ASSETS = [
  './index.html',
  './ts-softball.html',
  './app.html',
  './app.css',
  './app.js',
  './styles.css',
  './script.js',
  './ts-softball.css',
  './ts-softball.js',
  './scorebook-export.js',
  './scorebook-export-v60.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/favicon-48.png',
  './icons/ts-logo.png',
];
const APP_SHELL_PATHS = new Set(ASSETS.map(asset => new URL(asset, self.location.href).pathname));

const MEDIA_ASSETS = [
  './BetweenInnings/Big Girl Talk.mp3',
  './BetweenInnings/Church Clap.mp3',
  './BetweenInnings/Glory Days.mp3',
  './BetweenInnings/Light Em Up.mp3',
  './BetweenInnings/North Carolina.mp3',
  './BetweenInnings/Row My Boat.mp3',
  './BetweenInnings/Swing.mp3',
  './BetweenInnings/Tokyo Drift.mp3',
  './BetweenInnings/We Ready.mp3',
  './sounds/Angerdingus.mp3',
  './sounds/Hi.mp3',
  './sounds/homerun-call.mp3',
  './sounds/Hot Dog.mp3',
  './sounds/Wow.mp3',
  './sounds/Rally.mp3',
  './sounds/SoNervy.mp3',
  './sounds/scubbaaa.mp3',
  './sounds/Dun Dun.mp3',
  './sounds/Emotional.mp3',
  './sounds/Error.mp3',
  './sounds/Fail.mp3',
  './sounds/Strikeout.mp3',
  './sounds/awkward-cricket.mp3',
  './sounds/aye-thats-pretty-good.mp3',
  './sounds/bruh-sound-effect.mp3',
  './sounds/catch.mp3',
  './sounds/charge.mp3',
  './sounds/foul-ball.mp3',
  './sounds/homerun.mp3',
  './sounds/Woo.mp3?v=58',
  './sounds/lizard-button.mp3',
  './sounds/no_crying.mp3',
  './sounds/roar.mp3',
  './sounds/stolenbase.mp3',
  './sounds/yeah-boiii-i-i-i.mp3',
  './sounds/Coin.mp3',
  './sounds/DogsOut.mp3',
  './sounds/GotEm.mp3',
  './sounds/Hockey.mp3',
  './sounds/Jeopardy.mp3',
  './sounds/Mommy.mp3',
  './sounds/Organ.mp3',
  './sounds/K Riff.mp3',
  './sounds/OneMoreStrike.mp3',
  './sounds/Strike1.mp3',
  './sounds/Strike2.mp3',
  './sounds/Strike3.mp3',
  './sounds/StrikeOutAirhorn.mp3',
  './sounds/StrikeOutWhistle.mp3',
  './sounds/Wipe.mp3',
  './sounds/horn.mp3',
  './sounds/hornV1.mp3',
  './sounds/Dadada.mp3',
  './sounds/Duel of Fate.mp3',
  './sounds/Focus Dude.mp3',
  './sounds/Hamilton.mp3',
  './sounds/Imperial March.mp3',
  './sounds/Mine Mine.mp3',
  './sounds/My Shot.mp3',
  './sounds/Non-Stop.mp3',
  './sounds/No No No.mp3',
  './walkupsongs/I Look Good.mp3',
  './walkupsongs/Stay Fly.mp3?v=58',
  './walkupsongs/2Pac Americas.mp3',
  './walkupsongs/2Pac California.mp3',
  './walkupsongs/A-O-K.mp3',
  './walkupsongs/Baby.mp3',
  './walkupsongs/Barbie.mp3',
  './walkupsongs/Batter Up.mp3?v=58',
  './walkupsongs/Thunderstruck.mp3',
  './walkupsongs/Beautiful Things.mp3',
  './walkupsongs/Big Dawgs.mp3',
  './walkupsongs/Bring Em Out.mp3',
  './walkupsongs/Bully.mp3',
  './walkupsongs/Coming In Hot.mp3',
  './walkupsongs/CrazyTrain.mp3',
  './walkupsongs/DMX Ruff Ryders.mp3',
  './walkupsongs/Doo Wop.mp3',
  './walkupsongs/Drop1.mp3',
  './walkupsongs/Drop2.mp3',
  './walkupsongs/Einsteen.mp3',
  './walkupsongs/Fireball.mp3',
  './walkupsongs/Fool.mp3',
  './walkupsongs/Who\'s That Girl.mp3',
  './walkupsongs/Never Get Used To This.mp3',
  './walkupsongs/Beach.mp3',
  './walkupsongs/Gnarly.mp3',
  './walkupsongs/Hachet.mp3',
  './walkupsongs/Pinkie Up.mp3',
  './walkupsongs/Last Of My Kind.mp3',
  './walkupsongs/Lip Gloss.mp3',
  './walkupsongs/Low Rider.mp3?v=58',
  './walkupsongs/Macarena.mp3',
  './walkupsongs/Sandman.mp3',
  './walkupsongs/Party In The USA.mp3',
  './walkupsongs/Pretty Girl Walk.mp3',
  './walkupsongs/Shake It Off.mp3',
  './walkupsongs/Show.mp3',
  './walkupsongs/Snowman.mp3?v=58',
  './walkupsongs/What\'s My Name.mp3',
  './walkupsongs/Wobble.mp3',
  './walkupsongs/Best Friend.mp3',
  './walkupsongs/Silent Watch Me Whip.mp3',
  './walkupsongs/Soda_Pop.mp3',
  './walkupsongs/Soulja Boy Superman.mp3',
  './walkupsongs/Space.mp3',
  './walkupsongs/Superpowers.mp3',
  './walkupsongs/Swag.mp3',
  './walkupsongs/Taylor Swift - The Fate of Ophelia.mp3',
  './walkupsongs/Tell Me Nothing.mp3',
  './walkupsongs/The Largest.mp3',
  './walkupsongs/Turn Down.mp3?v=58',
  './walkupsongs/Up.mp3',
  './walkupsongs/Whisper.mp3',
  './walkupsongs/Walk_Up_Centerfield.mp3',
  './walkupsongs/Heaven.mp3',
  './walkupsongs/Is Win.mp3',
  './walkupsongs/Narco.mp3',
  './walkupsongs/Yeah.mp3',
  './walkupsongs/Work Out.mp3?v=58',
  './walkupsongs/Lace Em Up.mp3?v=58',
  './walkupsongs/All Gas No Quit.mp3',
  './walkupsongs/Love Me.mp3',
  './walkupsongs/My Life Be Like.mp3',
  './walkupsongs/Return Mack.mp3',
  './walkupsongs/Thunderstruck Blaire.mp3',
  './walkupsongs/Walking On Sunshine.mp3',
  './walkupsongs/Get Silly.mp3',
  './walkupsongs/Teenage Dirtbag.mp3',
  './walkupsongs/Dai Dai.mp3',
  './walkupsongs/My Little Pony.mp3',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS).then(() =>
        Promise.all(MEDIA_ASSETS.map(asset => c.add(asset).catch(() => null)))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  const activated = caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim());
  e.waitUntil(activated);
  // Reload open pages only after activation finishes. A navigation awaited inside
  // waitUntil needs this worker's fetch handler, which cannot run until activation
  // completes, so the page and the worker would deadlock.
  activated
    .then(() => self.clients.matchAll({ type: 'window' }))
    .then(clients => Promise.all(clients.map(client => client.navigate(client.url))))
    .catch(() => {});
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const isMedia = url.pathname.includes('/audio/')
    || url.pathname.includes('/sounds/')
    || url.pathname.includes('/walkupsongs/')
    || url.pathname.includes('/BetweenInnings/');

  if (isMedia) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached))
    );
    return;
  }

  const isAppShell = e.request.mode === 'navigate' || APP_SHELL_PATHS.has(url.pathname);
  if (isAppShell) {
    e.respondWith(
      fetch(new Request(e.request, { cache: 'no-cache' })).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match(e.request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      const net = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
