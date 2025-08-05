const TransactionDTO = require('../models/DetailedAccount')

const TIMEOUT = 120000 // 2 minutes in milliseconds

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
      deleteTransaction: require('../feature/Transaction/deleteTransaction'),
      updateTransaction: require('../feature/Transaction/updateTransaction'),
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
    const { accountId, value, type, from, to, anexo, description} = req.body
    const transactionDTO = new TransactionDTO({ accountId, value, from, to, anexo, type, date: new Date(), description })

    const transaction = await saveTransaction({ transaction: transactionDTO, repository: transactionRepository })
    
    res.status(201).json({
      message: 'Transação criada com sucesso',
      result: transaction
    })
  }

  async getStatment(req, res) {
    const { getTransaction, transactionRepository } = this.di
    const { accountId } = req.params
    const { description } = req.query 

    const filter = { accountId }

    if (description) {
      filter.description = { $regex: description, $options: 'i' } // 'i' para case-insensitive
    }

    const transactions = await getTransaction({ filter, repository: transactionRepository })

    res.status(200).json({
      message: 'Extrato obtido com sucesso',
      result: {
        transactions
      }
    })
  }


  async deleteTransactionById(req, res) {
    try {
      const { transactionId, accountId } = req.params
      const { transactionRepository, deleteTransaction } = this.di

      if (!transactionId || !accountId) {
        return res.status(400).json({ 
          message: 'ID da transação ou conta não fornecido',
          requestId: Date.now().toString(36)
        })
      }

      const deleteOperation = deleteTransaction({
        transactionId,
        accountId,
        repository: transactionRepository
      })

      const deletedTransaction = await Promise.race([
        deleteOperation,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Delete operation timed out')), TIMEOUT))
      ])

      if (!deletedTransaction) {
        return res.status(404).json({ 
          message: `Transação com ID ${transactionId} não encontrada para a conta ${accountId}`,
          requestId: Date.now().toString(36)
        })
      }

      res.status(200).json({
        message: 'Transação deletada com sucesso',
        result: deletedTransaction,
        requestId: Date.now().toString(36)
      })
    } catch (error) {
      console.error('[AccountController][deleteTransactionById] Error:', {
        transactionId: req.params.transactionId,
        accountId: req.params.accountId,
        message: error.message,
        timestamp: new Date().toISOString()
      })

      res.status(500).json({
        message: 'Erro ao deletar transação',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        requestId: Date.now().toString(36)
      })
    }
  }

  async updateTransactionById(req, res) {
    try {
      const { transactionId, accountId } = req.params;
      const updateData = req.body;
      const { transactionRepository, updateTransaction } = this.di;

      if (!transactionId || !accountId) {
        return res.status(400).json({ 
          message: 'ID da transação ou conta não fornecido' 
        });
      }

      const updatedTransaction = await updateTransaction({
        transactionId,
        accountId,
        updateData,
        repository: transactionRepository
      });

      if (!updatedTransaction) {
        return res.status(404).json({ 
          message: `Transação com ID ${transactionId} não encontrada para a conta ${accountId}`
        });
      }

      res.status(200).json({
        message: 'Transação atualizada com sucesso',
        result: updatedTransaction
      });
    } catch (error) {
      console.error('Update transaction error:', error);
      res.status(500).json({
        message: 'Erro ao atualizar transação',
        error: error.message
      });
    }
  }
}

module.exports = AccountController