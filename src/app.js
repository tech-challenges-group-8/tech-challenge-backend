const Express = require("express");
const publicRoutes = require("./publicRoutes");
const routes = require("./routes");
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./swagger");
const UserController = require("./controller/User");
const cors = require("cors");

const app = new Express();

app.use(Express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.use(publicRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use((req, res, next) => {
  if (req.url.includes("/docs")) {
    return next();
  }

  // Ignora a verificação se a rota já foi tratada pelas rotas públicas
  // (Esta é uma suposição, ajuste se necessário)
  if (res.headersSent) {
    return;
  }

  const [_, token] = req.headers["authorization"]?.split(" ") || [];
  const user = UserController.getToken(token);

  if (!user) {
    return res.status(401).json({ message: "Token inválido" });
  }

  req.user = user;
  next();
});

app.use(routes);

module.exports = app;
