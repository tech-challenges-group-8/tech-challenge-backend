const getUserById = async ({
  id, repository
}) => {
  const result = await repository.getById(id)
  return result
}

module.exports = getUserById