const { Router } = require('express')
const AccountController = require('./controller/Account')
const accountController = new AccountController({})
const router = Router()

/**
 * @swagger
 * /account:
 *   get:
 *     summary: Busca contas
 *     tags: [Contas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de contas encontradas
 */
router.get('/account', accountController.find.bind(accountController))

/**
 * @swagger
 * /account/transaction:
 *   post:
 *     summary: Cria uma nova transação
 *     tags: [Transações]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountId:
 *                 type: string
 *               value:
 *                 type: number
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transação criada com sucesso
 */
router.post('/account/transaction', accountController.createTransaction.bind(accountController))

/**
 * @swagger
 * /account/{accountId}/statement:
 *   get:
 *     summary: Obtém extrato da conta
 *     tags: [Extratos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         description: ID da conta
 *         schema:
 *           type: string
 *       - in: query
 *         name: description
 *         required: false
 *         schema:
 *           type: string
 *           description: Filtro por descrição (parcial, ignorando maiúsculas/minúsculas)
 *       - in: query
 *         name: dataInicial
 *         required: false
 *         description: Data inicial do período
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dataFinal
 *         required: false
 *         description: Data final do período
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: valorMinimo
 *         required: false
 *         description: Valor mínimo da transação
 *         schema:
 *           type: number
 *       - in: query
 *         name: valorMaximo
 *         required: false
 *         description: Valor máximo da transação
 *         schema:
 *           type: number
 *       - in: query
 *         name: tipo
 *         required: false
 *         description: Tipo da transação
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Extrato encontrado
 *       401:
 *         description: Token invalido
 */
router.get('/account/:accountId/statement', accountController.getStatment.bind(accountController))

/**
 * @swagger
 * /account/{accountId}/transaction/{transactionId}:
 *   delete:
 *     summary: deleta uma transação da conta
 *     tags: [Transações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         description: ID da conta
 *         schema:
 *           type: string
 *       - in: path
 *         name: transactionId
 *         required: true
 *         description: ID da transaction
 *         schema:
 *           type: string
 *     responses:
 *       401:
 *         description: Token invalido
 */
router.delete('/account/:accountId/transaction/:transactionId', accountController.deleteTransactionById.bind(accountController));

/**
 * @swagger
 * /account/{accountId}/transaction/{transactionId}:
 *   put:
 *     summary: atualiza uma transação da conta
 *     tags: [Transações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         description: ID da conta
 *         schema:
 *           type: string
 *       - in: path
 *         name: transactionId
 *         required: true
 *         description: ID da transaction
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: number
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       401:
 *         description: Token invalido
 */
router.put('/account/:accountId/transaction/:transactionId', accountController.updateTransactionById.bind(accountController));

module.exports = router
