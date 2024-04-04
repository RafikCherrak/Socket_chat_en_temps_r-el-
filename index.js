const rateLimit = require('express-rate-limit');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT=6020;

const server = require('http').createServer(app);
const io = require('socket.io')(server);


// Créer une instance de rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limite chaque IP à 100 requêtes par fenêtre de temps
  standardHeaders: true, // Retourne les informations de limite de débit dans les headers `RateLimit-*`
  legacyHeaders: false, // Désactive les headers `X-RateLimit-*`
});

const blockFlaggedIps = (req, res, next) => {
  const clientIp = req.ip; // Ou utilisez une bibliothèque pour obtenir l'IP du client de manière plus fiable

  if (flaggedIps.includes(clientIp)) {
    // Si l'IP est flaguée, bloquez la requête
    return res.status(403).send('Votre accès a été bloqué en raison d\'activités suspectes.');
  }

  next(); // Continuez vers le prochain middleware si l'IP n'est pas flaguée
};


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Utiliser le middleware dans l'application
app.use(blockFlaggedIps);

app.use(apiLimiter);


let flaggedIps = []; // Stockez les IP flaggées pour examen


app.get('/',(req,res)=> {
    res.sendFile(`${__dirname}/public/index.html`);
})
io.on('connection',() =>{
    console.log('un utilisateur s\'est connecté')
})

app.get('/', (req, res) => {
  res.send('Page d\'accueil, accessible aux IP non flaguées.');
});



app.post('/api/submit-form', (req, res) => {
  const { emailConfirmation } = req.body;
  console.log(req.body)
  const clientIp = req.ip; // Ou utilisez une bibliothèque comme 'request-ip' pour obtenir l'IP du client

  if (emailConfirmation) {
    // Si le champ honeypot est rempli, flagger l'IP
    console.log(`IP flagged: ${clientIp}`);
    flaggedIps.push(clientIp);
    res.status(400).send('Bot detected');
  } else {
    // Traiter les données du formulaire ici pour les soumissions valides
    res.send('Form submitted successfully');
  }
});


app.get('/api/test', (req, res) => {
    res.send('API');
});


app.listen(PORT, () => {
    console.log('Server is running on port 3002');    
});