# Diepvriesvoorraad

Je scant wat erin gaat en eruit komt. De app zegt wat er al te lang in ligt, in de diepvries of in de frigo.

## Gebruik

- Tik op Erin en scan de barcode. Lukt live scannen niet, tik dan op "Foto maken van de barcode". De app zoekt de productnaam op via Open Food Facts en onthoudt het product voor de volgende keer.
- Kies diepvries of frigo en de soort. Elke soort heeft een richtlijn voor houdbaarheid (zie Menu).
- Staat er een THT-datum op de verpakking, vul die in. In de frigo telt die datum. In de diepvries telt de langste van THT en richtlijn.
- Tik op Eruit en scan opnieuw. Bij meerdere stuks gaat er één af. Heb je hetzelfde product meerdere keren, dan kies je welke.
- Geen barcode? Voeg toe zonder barcode of kies uit de lijst.
- Tik op een product om het aan te passen.

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
