let table;
let hoveredMountain = null;

// carico il dataset
async function preload() {
  table = loadTable('assets/alpi.csv', 'csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(246, 241, 230); // colore sfondo

  // limiti verticali delle linee della tabella
  let yBase = height - 50; // in basso
  let yTop  = 110; // in alto

  // distanza tra un livello e l'altro
  let spazio = (yBase - yTop) / 5;

  // ciclo da 0 a 5 per disegnare le 6 linee e i testi
  for (let i = 0; i <= 5; i++) {
    let y = yBase - i * spazio;  // sale di quota ogni giro
    let quota = i * 1000;        // 0 - 1000 - 2000 - 3000 - 4000 - 5000

    // linea orizzontale
    stroke(220, 210, 200);
    strokeWeight(1);
    line(80, y, width - 80, y);

    // testo della quota a sinistra
    noStroke();
    fill(125, 110, 100);
    textSize(10);
    textAlign(RIGHT);
    text(quota + " m", 70, y + 4);
  }

  // reset hover vuoto
  hoveredMountain = null;

  // leggo il numero di righe
  let totalRows = table.getRowCount();

  // ciclo su tutte le montagne
  for (let i = 0; i < totalRows; i++) {
    // lettura delle colonne dal file CSV
    let id = table.getString(i, 'id');
    let name = table.getString(i, 'name');
    let country = table.getString(i, 'country');
    let section = table.getString(i, 'section');
    let alt = table.getNum(i, 'altitude');
    let prom = table.getNum(i, 'prominence');
    let rock = table.getString(i, 'rock');
    let glacier = table.getString(i, 'glacier');

    // posizione X distribuite in orizzontale
    let x = map(i, 0, totalRows - 1, 90, width - 90);

    // posizione Y distribuite in verticale
    let y = map(alt, 0, 5000, yBase, yTop);

    // altezza del triangolo proporzionata all'altezza dello schermo
    let triH = map(prom, 95, 4700, 15, height * 0.12);
    let triW = 10; // larghezza fissa per non sovrapporsi

    // riga che collega la vetta alla quota 0 m
    stroke(185, 170, 160);
    line(x, yBase, x, y);

    // disegno del triangolo
    disegnaMontagna(x, y, triW, triH, rock, glacier);

    // controllo rollover sulla cima
    // se il mouse è a meno di 10 pixel dalla cima, hoveredMountain si riempie (non è null)
    if (dist(mouseX, mouseY, x, y) < 10) {
      hoveredMountain = {
        id: id,
        x: x,
        y: y,
        name: name,
        alt: alt,
        prom: prom,
        section: section,
        country: country,
        rock: rock,
        glacier: glacier
      };
    }
  }

  // titolo e legenda
  disegnaTitoloeLegenda();

  // appare il box interattivo se non è null
  if (hoveredMountain !== null) {
    cursor(HAND); // <-- AGGIUNTO
    disegnaBox(hoveredMountain);
  } else {
    cursor(ARROW); // <-- AGGIUNTO
  }
}

// apre la seconda scheda
function mousePressed() {
  if (hoveredMountain !== null) {
    let newURL = "detail.html?id=" + hoveredMountain.id;
    window.location.href = newURL;
  }
}

// funzione per disegnare il triangolo della montagna
function disegnaMontagna(x, y, w, h, rock, glacier) {
  push();

  // colore in base alla tipologia di roccia
  noStroke();
  if (rock === 'Granito') {
    fill(63, 127, 123); // Granito - verde
  } else if (rock === 'Gneiss') {
    fill(135, 140, 220); // Gneiss - lilla
  } else if (rock === 'Dolomia') {
    fill(201, 106, 74); // Dolomia - arancione
  } else if (rock === 'Calcare') {
    fill(202, 162, 77); // Calcare - giallo
  } else {
    fill(94, 111, 122); // Altro - grigio
  }

  // triangolo della montagna con vertici
  // cima: (x, y) 
  // vertice sx: a sinistra di metà larghezza x - w / 2 e verso il basso di y + h
  // vertice dx: a destra di metà larghezza x + w / 2 e verso il basso di y + h
  triangle(x, y, x - w / 2, y + h, x + w / 2, y + h);

  // punto ghiacciaio perenne in cima
  if (glacier === 'Yes') {
    stroke(125, 110, 100);
    fill(255);
    circle(x, y - 4, 3.5);
  }

  pop();
}

// funzione per titolo e legenda
function disegnaTitoloeLegenda() {
  push();

  // titolo
  textAlign(LEFT);
  noStroke();
  fill(55, 45, 40);
  textSize(19);
  text("PROFILO OROGRAFICO DELLE ALPI", 80, 42);

  // sottotitolo
  fill(110, 95, 85);
  textSize(11.5);
  text("Visualizzazione comparativa di 75 cime lungo l'arco alpino. La quota s.l.m. definisce la posizione verticale (y), la prominenza modella l'altezza di ciascun triangolo.", 80, 64);

  // dati personali
  fill(160, 148, 138);
  textSize(9.5);
  text("Federica Boni  •  Laboratorio di Computer Grafica per l'Information Design  •  2026", 80, 82);

  // legenda
  let legX = width - 440;
  let legY = 55;

  noStroke();
  fill(130, 115, 105);
  textSize(11.5);
  textAlign(LEFT);
  text("Tipologia di roccia:", legX - 75, legY + 8);

  noStroke();
  // Granito
  fill(63, 127, 123);
  rect(legX - 75, legY + 18, 9, 9);
  fill(90, 80, 72);
  textSize(10);
  text("Granito", legX - 62, legY + 26);

  // Gneiss
  fill(135, 140, 220);
  rect(legX, legY + 18, 9, 9);
  fill(90, 80, 72);
  text("Gneiss", legX + 13, legY + 26);

  // Dolomia
  fill(201, 106, 74);
  rect(legX + 75, legY + 18, 9, 9);
  fill(90, 80, 72);
  text("Dolomia", legX + 88, legY + 26);

  // Calcare
  fill(202, 162, 77);
  rect(legX + 150, legY + 18, 9, 9);
  fill(90, 80, 72);
  text("Calcare", legX + 163, legY + 26);

  // Altro
  fill(94, 111, 122);
  rect(legX + 225, legY + 18, 9, 9);
  fill(90, 80, 72);
  text("Altro", legX + 238, legY + 26);

  // Ghiacciaio
  fill(255);
  stroke(110, 95, 85);
  strokeWeight(1);
  circle(legX + 290, legY + 22, 4.5);
  noStroke();
  fill(90, 80, 72);
  text("Ghiacciaio perenne", legX + 300, legY + 25);

  pop();
}

// funzione per il box rollover
function disegnaBox(m) {
  push();

  // cerchietto che appare in cima
  noFill();
  stroke(125, 110, 100);
  strokeWeight(1);
  circle(m.x, m.y - 4, 12);

  // posizione del box
  let boxX = m.x + 12;
  let boxY = m.y - 45;

  // sposta il riquadro a sinistra se vicino al bordo destro
  if (boxX > width - 215) {
    boxX = m.x - 205;
  }

  //colore del box che cambia in base al tipo di roccia
  noStroke();
  if (m.rock === 'Granito') {
    fill(63, 127, 123); // verde
  } else if (m.rock === 'Gneiss') {
    fill(135, 140, 220); // lilla
  } else if (m.rock === 'Dolomia') {
    fill(201, 106, 74); // arancione
  } else if (m.rock === 'Calcare') {
    fill(202, 162, 77); // giallo
  } else {
    fill(94, 111, 122); // grigio
  }

  // contorno del box con angoli arrotondati
  stroke(50, 40, 30);
  strokeWeight(1);
  rect(boxX, boxY, 195, 76, 4);

  // titolo della montagna
  noStroke();
  fill(255);
  textAlign(LEFT);
  textSize(11);
  text(m.name, boxX + 8, boxY + 16);

  // dati informativi
  fill(246, 241, 230);
  textSize(9);
  text("Quota: " + m.alt + " m", boxX + 8, boxY + 30);
  text("Prominenza: " + m.prom + " m", boxX + 8, boxY + 42);
  text("Gruppo: " + m.section, boxX + 8, boxY + 54);
  text("Roccia: " + m.rock, boxX + 8, boxY + 66);

  pop();
}