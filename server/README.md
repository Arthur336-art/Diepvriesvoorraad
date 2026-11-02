# Meldingenserver

Met deze server krijg je een melding op je gsm als er iets op moet, ook als de app dicht is.
Hij draait gratis bij Cloudflare. De server bewaart alleen datums, geen productnamen.

## Online zetten (één keer, 10 minuten)

1. Maak een gratis account op https://dash.cloudflare.com/sign-up en bevestig je e-mail.
2. Kies links "Workers & Pages" (soms onder "Compute"). Tik op "Create" en kies "Start with Hello World".
3. Geef de worker de naam `voorraad-push` en tik op "Deploy".
4. Tik op "Edit code". Wis alle code die er staat.
5. Open `server/worker.js` op GitHub, tik op het kopieer-icoon ("Copy raw file") en plak de code in Cloudflare. Tik op "Deploy".
6. Ga terug. Kies links "Storage & Databases" en dan "KV" (Workers KV). Tik op "Create" en noem het `voorraad`.
7. Open je worker `voorraad-push` opnieuw. Ga naar "Bindings" en tik op "Add binding". Kies "KV namespace".
   Variabele: `SUBS`. Namespace: `voorraad`. Tik op "Add binding" of "Deploy".
8. Ga in je worker naar "Settings" en dan "Trigger events" (of "Triggers"). Tik op "Add" en kies "Cron trigger".
   Vul `0 7 * * *` in. Dat is elke ochtend om 8 u (winter) of 9 u (zomer). Opslaan.
9. Bovenaan je worker staat het adres, iets als `https://voorraad-push.jouwnaam.workers.dev`. Open het in je browser.
   Zie je `"ok":true`, dan werkt de server.

## In de app

1. Open de app via het icoon op je beginscherm.
2. Menu ⋮, "Meldingen als de app dicht is". Plak het adres van stap 9 en tik op "Aanzetten".
3. Sta meldingen toe.
4. Tik op "Test-melding". Binnen een minuut krijg je een melding.

## Wanneer krijg je een melding?

Om 8 u of 9 u in de ochtend op:
- de dag dat een product oranje wordt (diepvries 30 dagen, frigo 1 dag op voorhand),
- de dag dat het op moet,
- 1 en 2 weken later als het er nog in ligt.

Maximaal één melding per dag. De melding zegt welke producten op moeten.

## Backup

De app maakt automatisch een backup op deze server, een paar seconden na elke wijziging.
Alles wordt op je gsm versleuteld met je backupcode. De server kan je backup niet lezen.
Je backupcode staat in de app bij Menu ⋮, Backup. Bewaar hem goed.
