let table;
let selectedId;
let mountainRow = null;

// palette coerente con la pagina principale
let bgColor = [246, 241, 230];
let textDark = [55, 45, 40];
let textMuted = [110, 95, 85];

function preload() {
  table = loadTable('assets/alpi.csv', 'csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // leggo il parametro dall'URL
  let params = getURLParams();
  selectedId = params.id;

  // cerco la riga corrispondente nel CSV
  mountainRow = table.findRow(selectedId, 'id');
}

function draw() {
  background(bgColor);

  // bottone "Torna a profilo alpino" in alto a sinistra
  disegnaBottoneIndietro();

  // estraggo tutti i parametri della riga
  let name = mountainRow.getString('name');
  let country = mountainRow.getString('country');
  let section = mountainRow.getString('section');
  let alt = mountainRow.getNum('altitude');
  let prom = mountainRow.getNum('prominence');
  let glacier = mountainRow.getString('glacier');
  let firstAscent = mountainRow.getNum('first_ascent');
  let difficulty = mountainRow.getString('difficulty');
  let rock = mountainRow.getString('rock');
  let lat = mountainRow.getNum('lat');
  let lon = mountainRow.getNum('lon');

  // intestazione (titolo e sottotitolo)
  disegnaIntestazione(name, country, section, lat, lon);

  // glifo centrale
  let centerX = width * 0.42;
  let centerY = height * 0.56;
  disegnaGlifoMontagna(centerX, centerY, alt, prom, rock, glacier, difficulty, firstAscent);

  // legenda a destra
  let legX = width * 0.68;
  let legY = height * 0.28;
  disegnaLegendaDettaglio(legX, legY, alt, prom, rock, glacier, difficulty, firstAscent);
}

// glifo centrale
function disegnaGlifoMontagna(cx, cy, alt, prom, rock, glacier, difficulty, firstAscent) {
  push();

  // dimensioni massime fisse essere adatto a tutte le montagne
  let maxH = min(height * 0.52, 380);
  let maxW = 240;
  let baseY = cy + maxH * 0.45;

  // riferimento scala massima (5000 m)
  noFill();
  stroke(210, 200, 190);
  strokeWeight(1);
  line(cx - maxW * 0.7, baseY, cx + maxW * 0.7, baseY); // base 0m
  line(cx - maxW * 0.7, baseY - maxH, cx + maxW * 0.7, baseY - maxH); // tetto 5000m

  noStroke();
  fill(150, 138, 128);
  textSize(10);
  textAlign(RIGHT);
  text("5000 m (scala max)", cx - maxW * 0.72, baseY - maxH + 4);
  text("0 m", cx - maxW * 0.72, baseY + 4);

  // cerchio cronologico (prima ascensione: 1730 -> 1900)
  let angleAscent = map(firstAscent, 1730, 1905, 0, TWO_PI);
  noFill();
  stroke(220, 210, 200);
  strokeWeight(6);
  circle(cx, baseY - maxH * 0.5, maxH * 1.15);

  stroke(125, 110, 100);
  strokeWeight(6);
  arc(cx, baseY - maxH * 0.5, maxH * 1.15, maxH * 1.15, -HALF_PI, -HALF_PI + angleAscent);

  // triangolo esterno (altitudine+roccia)
  let hAlt = map(alt, 0, 5000, 20, maxH);
  let wBase = map(difficultyToNumber(difficulty), 1, 7, 80, maxW); // Larghezza = Difficoltà

  let cRock = getRockColor(rock);
  fill(cRock[0], cRock[1], cRock[2], 220);
  noStroke();
  triangle(cx, baseY - hAlt, cx - wBase / 2, baseY, cx + wBase / 2, baseY);

  // triangolo interno (prominenza)
  let hProm = map(prom, 0, 5000, 10, maxH);
  let wProm = wBase * (prom / alt); // proporzionale
  fill(45, 38, 34, 75); // velatura scura per distinguere il nucleo di prominenza
  triangle(cx, baseY - hProm, cx - wProm / 2, baseY, cx + wProm / 2, baseY);

  // indicatore ghiacciaio perenne
  if (glacier === 'Yes') {
    fill(255);
    stroke(55, 45, 40);
    strokeWeight(1.5);
    circle(cx, baseY - hAlt - 12, 12);
  }

  // altitudine sulla vetta
  noStroke();
  fill(textDark);
  textAlign(CENTER);
  textSize(12);
  text(alt + " m", cx, baseY - hAlt - 25);

  pop();
}

// intestazione
function disegnaIntestazione(name, country, section, lat, lon) {
  push();
  textAlign(LEFT);
  noStroke();

  fill(textDark);
  textSize(26);
  text(name.toUpperCase(), 80, 95);

  fill(textMuted);
  textSize(13);
  text(section + "  •  " + country + "  •  Coordinate: " + lat + "° N, " + lon + "° E", 80, 120);
  pop();
}

// legenda
function disegnaLegendaDettaglio(lx, ly, alt, prom, rock, glacier, difficulty, firstAscent) {
  push();
  textAlign(LEFT);
  noStroke();

  fill(textDark);
  textSize(14);
  text("COME LEGGERE IL GLIFO", lx, ly);

  stroke(210, 200, 190);
  line(lx, ly + 8, lx + 280, ly + 8);
  noStroke();

  let step = 48;
  let currY = ly + 35;

  // altezza & roccia
  let cRock = getRockColor(rock);
  fill(cRock[0], cRock[1], cRock[2]);
  triangle(lx + 8, currY - 10, lx, currY + 6, lx + 16, currY + 6);
  fill(textDark);
  textSize(11.5);
  text("Altezza e Colore = Quota e Roccia", lx + 28, currY - 3);
  fill(textMuted);
  textSize(10.5);
  text(alt + " m s.l.m.  •  " + rock, lx + 28, currY + 12);

  // prominenza
  currY += step;
  fill(45, 38, 34, 110);
  triangle(lx + 8, currY - 6, lx + 2, currY + 6, lx + 14, currY + 6);
  fill(textDark);
  textSize(11.5);
  text("Triangolo interno = Prominenza topografica", lx + 28, currY - 3);
  fill(textMuted);
  textSize(10.5);
  text(prom + " m di dislivello isolato", lx + 28, currY + 12);

  // larghezza = difficoltà
  currY += step;
  stroke(textDark);
  strokeWeight(1.5);
  line(lx, currY, lx + 16, currY);
  noStroke();
  fill(textDark);
  textSize(11.5);
  text("Larghezza base = Grado di difficoltà", lx + 28, currY - 3);
  fill(textMuted);
  textSize(10.5);
  text("Scala alpinistica: " + difficulty + " (" + spiegaDifficolta(difficulty) + ")", lx + 28, currY + 12);

  // ghiacciaio
  currY += step;
  fill(255);
  stroke(55, 45, 40);
  strokeWeight(1.5);
  circle(lx + 8, currY, 10);
  noStroke();
  fill(textDark);
  textSize(11.5);
  text("Cerchio in vetta = Ghiacciaio perenne", lx + 28, currY - 3);
  fill(textMuted);
  textSize(10.5);
  text(glacier === 'Yes' ? "Presente su questa vetta" : "Assente su questa vetta (nessun simbolo)", lx + 28, currY + 12);

  // prima ascensione
  currY += step;
  noFill();
  stroke(125, 110, 100);
  strokeWeight(2.5);
  arc(lx + 8, currY, 14, 14, -HALF_PI, PI);
  noStroke();
  fill(textDark);
  textSize(11.5);
  text("Anello esterno = Anno prima ascensione", lx + 28, currY - 3);
  fill(textMuted);
  textSize(10.5);
  text("Conquistata nel " + firstAscent + " (scala 1730–1905)", lx + 28, currY + 12);

  pop();
}

// bottone per tornare indietro
function disegnaBottoneIndietro() {
  push();
  let bx = 80;
  let by = 32;
  let bw = 155;
  let bh = 26;

let dentroX = mouseX >= bx && mouseX <= bx + bw;
let dentroY = mouseY >= by && mouseY <= by + bh;

let isOver = dentroX && dentroY;

  if (isOver) {
    fill(55, 45, 40);
    cursor(HAND);
  } else {
    noFill();
    cursor(ARROW);
  }

  stroke(55, 45, 40);
  strokeWeight(1);
  rect(bx, by, bw, bh, 4);

  noStroke();
  fill(isOver ? 246 : 55, isOver ? 241 : 45, isOver ? 230 : 40);
  textSize(11);
  textAlign(CENTER, CENTER);
  text("← Torna al profilo alpino", bx + bw / 2, by + bh / 2);
  pop();
}

function mousePressed() {
  // Click sul bottone "Torna indietro"
  if (mouseX >= 80 && mouseX <= 235 && mouseY >= 32 && mouseY <= 58) {
    window.location.href = "index.html";
  }
}

// colore
function getRockColor(rock) {
  if (rock === 'Granito') return [63, 127, 123];
  if (rock === 'Gneiss') return [135, 140, 220];
  if (rock === 'Dolomia') return [201, 106, 74];
  if (rock === 'Calcare') return [202, 162, 77];
  return [94, 111, 122];
}

//difficoltà
function difficultyToNumber(diff) {
  const mapDiff = { 'E': 1, 'EE': 2, 'F': 3, 'PD': 4, 'AD': 5, 'D': 6, 'ED': 7 };
  return mapDiff[diff] || 3;
}

function spiegaDifficolta(diff) {
  const desc = {
    'E': 'Escursionistico',
    'EE': 'Escursionisti Esperti',
    'F': 'Facile',
    'PD': 'Poco Difficile',
    'AD': 'Abbastanza Difficile',
    'D': 'Difficile',
    'ED': 'Estremamente Difficile'
  };
  return desc[diff] || diff;
}