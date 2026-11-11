# Interactive Walima Invitation — Lahore

A mobile-first, English-language Pakistani Walima invitation website. All artwork is newly drawn, and its interaction sequence was built from the user's uploaded video reference.

## Open and interact

1. Tap the A&H embossed wax seal to open the envelope, golden light and card.
2. Scroll down the tall invitation.
3. Scratch the three gold date cards with a finger/mouse, or use **Reveal the date**.
4. See the family invitation, Walima-only evening program, live countdown, venue map and dress code.
5. Tap the floating gold button to pause/play original soft synthesized instrumental music.
6. Use **Open directions**, **Add to calendar**, **Share this invitation**, or **Open the envelope again**.

## Sample content — replace before sharing

- Groom: Hamza
- Bride: Ayesha
- Walima date: Sunday, 17 January 2027
- Time: 6:30 pm onward (PKT)
- Example venue: Pearl-Continental Hotel, Shahrah-e-Quaid-e-Azam, Lahore, Pakistan. This is a **placeholder**, not an event booking.
- Language: English

To edit, open [index.html](index.html) and modify the `DEFAULTS` JavaScript object near the bottom. No build tooling is required.

To preview personalised details without editing, append URL parameters to the hosted link:

`?groom=Ali&bride=Sara&date=2027-02-14&venue=Your%20Venue&address=Your%20Address%2C%20Lahore&time=19%3A00`

## Publish the shareable link

1. Visit **Settings → Pages** in this repository.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Choose **main** and **/(root)**, then **Save**.
4. GitHub will publish at **https://mussadiqali958-ux.github.io/my/** once the deployment is active. This URL needs to be tested after enabling Pages.

No JavaScript framework, build command or API key is needed. The Google Fonts and Google Maps embed need internet access in guests' browsers; the rest is local HTML/CSS/JS.

This project reproduces the *interactive behaviour and visual theme* of the supplied example without copying its artwork or proprietary assets.