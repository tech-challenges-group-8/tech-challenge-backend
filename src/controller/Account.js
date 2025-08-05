const TransactionDTO = require('../models/DetailedAccount')


class AccountController {
  constructor(di = {}) {
    this.di = Object.assign({
      userRepository: require('../infra/mongoose/repository/userRepository'),
      accountRepository: require('../infra/mongoose/repository/accountRepository'),
      cardRepository: require('../infra/mongoose/repository/cardRepository'),
      transactionRepository: require('../infra/mongoose/repository/detailedAccountRepository'),

      saveCard: require('../feature/Card/saveCard'),
      salvarUsuario: require('../feature/User/salvarUsuario'),
      saveAccount: require('../feature/Account/saveAccount'),
      getUser: require('../feature/User/getUser'),
      getUserById: require('../feature/User/getUserById'),
      getAccount: require('../feature/Account/getAccount'),
      saveTransaction: require('../feature/Transaction/saveTransaction'),
      getTransaction: require('../feature/Transaction/getTransaction'),
      getCard: require('../feature/Card/getCard'),
    }, di)
  }

  async find(req, res) {
    const { accountRepository, userRepository, getAccount, getCard, getTransaction, getUserById, transactionRepository, cardRepository } = this.di

    try {
      const userId = req.user?.id;

      const user = await getUserById({ id: userId, repository: userRepository });
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      const { username } = user;

      const account = await getAccount({ repository: accountRepository, filter: { userId } });
      const transactions = await getTransaction({ filter: { accountId: account[0].id }, repository: transactionRepository });
      const cards = await getCard({ filter: { accountId: account[0].id }, repository: cardRepository });

      res.status(200).json({
        message: 'Conta encontrada carregada com sucesso',
        result: {
          account,
          transactions,
          cards,
          name: username
        }
      });
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({
        message: 'Erro no servidor'
      });
    }


  }

  async createTransaction(req, res) {
    const { saveTransaction, transactionRepository } = this.di
    const { accountId, value, type, from, to, anexo } = req.body
    const transactionDTO = new TransactionDTO({ accountId, value, from, to, anexo, type, date: new Date() })

    const transaction = await saveTransaction({ transaction: transactionDTO, repository: transactionRepository })
    
    res.status(201).json({
      message: 'Transação criada com sucesso',
      result: transaction
    })
  }

  async getStatment(req, res) {
    const { getTransaction, transactionRepository } = this.di

    const { accountId } = req.params

    const transactions = await getTransaction({ filter: { accountId } ,  repository: transactionRepository})
    res.status(201).json({
      message: 'Transação criada com sucesso',
      result: {
        transactions
      }
    })
  }
}

module.exports = AccountController