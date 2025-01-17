const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/styles', express.static(path.join(__dirname, 'public/styles')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.set('view engine', 'ejs');

// Load form data
const formData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/form-data.json'), 'utf8'));

// Prix de base par m² selon le matériau
const MATERIAL_PRICES = {
  laine_verre: { min: 15, avg: 20, max: 25 },
  laine_roche: { min: 20, avg: 25, max: 30 },
  polystyrene: { min: 25, avg: 30, max: 35 },
  autre: { min: 20, avg: 25, max: 30 }
};

// Facteurs selon le type d'habitation
const HOUSING_FACTORS = {
  maison: 1,
  appartement: 1.1, // +10% pour l'accès plus complexe
  autre: 1.15
};

// Surface en m² selon la sélection
const SURFACES = {
  moins_50: { min: 20, avg: 35, max: 50 },
  '50_100': { min: 50, avg: 75, max: 100 },
  plus_100: { min: 100, avg: 150, max: 200 }
};

function calculateEstimate(formData) {
  // Récupération des valeurs de base
  const surface = SURFACES[formData.surface];
  const materialPrice = MATERIAL_PRICES[formData.materiau];
  const housingFactor = HOUSING_FACTORS[formData.habitation];

  // Calcul des estimations
  const calculatePrice = (surfaceValue, materialValue) => {
    let price = surfaceValue * materialValue * housingFactor;
    
    // Ajustement selon l'état de l'isolation existante
    if (formData.isolation_existante === 'insuffisante') {
      price *= 1.1; // +10% pour le retrait partiel
    } else if (formData.isolation_existante === 'aucune') {
      price *= 0.95; // -5% car pas de travaux de retrait
    }

    // Réduction si intéressé par les aides
    if (formData.aides === 'oui') {
      price *= 0.7; // -30% d'aides moyennes
    }

    return Math.round(price);
  };

  return {
    min: calculatePrice(surface.min, materialPrice.min),
    avg: calculatePrice(surface.avg, materialPrice.avg),
    max: calculatePrice(surface.max, materialPrice.max)
  };
}

// Routes
app.get('/', (req, res) => {
  res.render('index', { formData });
});

app.post('/submit', (req, res) => {
  const estimate = calculateEstimate(req.body);
  res.render('results', { estimate, formData: req.body });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});