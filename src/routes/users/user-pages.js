'use strict'

import { ListPages } from './shared/list-pages'

export const UserPagesList = {
  method: 'GET',
  path: '/{id}/pages',
  config: {
    description: 'Lista todas as páginas de um usuário.',
    tags: ['api'],
    handler: (req, res) => {
      ListPages(req.params.id)
        .then(pages => {
          res(pages).code(200)
        })
        .catch(err => {
          res(err).code(err.status)
        })
    },
    auth: {
      strategy: 'jwt',
      scope: ['admin']
    }
  }
}
