const app = require("./app.js");
const connectDB = require("./infra/mongoose/mongooseConect.js");

// Inicia o servidor apenas para desenvolvimento local
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Servidor local rodando na porta ${PORT}`);
  });
});
