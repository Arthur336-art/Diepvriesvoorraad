# Diepvriesvoorraad

Je scant wat erin gaat en eruit komt. De app zegt wat er al te lang in ligt, in de diepvries of in de frigo.

## Gebruik

- Tik op Erin en scan de barcode. Lukt live scannen niet, tik dan op "Foto maken van de barcode". De app zoekt de productnaam op via Open Food Facts en onthoudt het product voor de volgende keer.
- Kies diepvries of frigo en de soort. Elke soort heeft een richtlijn voor houdbaarheid (zie Menu).
- Staat er een THT-datum op de verpakking, vul die in. In de frigo telt die datum. In de diepvries telt de langste van THT en richtlijn.
- Tik op Eruit en scan opnieuw. Bij meerdere stuks gaat er één af. Heb je hetzelfde product meerdere keren, dan kies je welke.
- Veel boodschappen? Tik in het scanscherm op "Snel scannen" en scan alles na elkaar. Op het einde sla je alles in één keer op.
- Geen barcode? Voeg toe zonder barcode of kies uit de lijst.
- Tik op een product om het aan te passen. Je kunt er ook een foto bij nemen.
- 🍳 bovenaan toont gerechten met wat eerst op moet, en nieuwe gerechten om te proberen. Zit er geen vlees in je voorraad, dan toont de app alleen vegetarische gerechten.
- 🛒 bovenaan is je boodschappenlijst. Haal je het laatste stuk van iets eruit, dan vraagt de app of het op de lijst moet.

## Meldingen

- Vink bij het opslaan "Herinnering in mijn agenda zetten" aan. Je agenda waarschuwt je op de dag dat het product op moet. In de diepvries ook 7 dagen op voorhand, in de frigo 1 dag.
- Menu, "Alles in mijn agenda zetten" zet herinneringen voor je hele voorraad in één keer.
- Menu, "Melding bij openen" geeft een melding als je de app opent en er iets op moet, en een rood getal op het app-icoon.
- Meldingen als de app dicht is: zet de gratis meldingenserver online, zie `server/README.md`.

Kleuren:

- Rood: ligt er te lang in.
- Oranje: binnenkort op (diepvries binnen 30 dagen, frigo binnen 1 dag).
- Groen: ok.

## Installeren op je gsm

De app is een webapp. Zet ze online met GitHub Pages (Settings, Pages, branch kiezen, map `/`). Open de link op je gsm en kies "Toevoegen aan beginscherm". De camera werkt alleen via https.

Je gegevens blijven op je toestel (localStorage). Maak via Menu een backup als je van toestel wisselt.

## Lokaal testen

```
python3 -m http.server 8000
```

Open daarna http://localhost:8000.
