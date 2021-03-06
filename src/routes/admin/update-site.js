'use strict'

import Boom from 'boom'
import { Page } from '../../models'
import { SiteUpdateDto } from '../../dtos'

const RESERVED = /\.?mobyourlife\.com\.br$/i

export const SiteUpdate = {
  method: 'PATCH',
  path: `/sites/{id}`,
  config: {
    description: 'Altera as preferências de um site.',
    tags: ['api'],
    handler: (req, res) => {
      const id = req.params.id
      const {title, domain, analytics_id} = req.payload

      if (RESERVED.exec(domain)) {
        res({statusCode: 400, message: 'Domínio não permitido! Por favor use o subdomínio ".meumob.site" ou seu domínio próprio.'})
        return
      }

      if (req.payload.domain) {
        checkDuplicateDomain(id, domain)
        .then(dup => {
          if (dup) {
            res({statusCode: 400, message: 'Este domínio já está em uso por outro site! Por favor utilize um domínio diferente.'}).code(400)
          } else {
            updateSiteInfo(id, title, domain, analytics_id)
            .then(() => Page.findOne({_id: id}))
            .then(site => res(site).code(200))
          }
        })
      } else {
        updateSiteInfo(id, title, domain, analytics_id)
        .then(() => Page.findOne({_id: id}))
        .then(site => res(site).code(200))
      }
    },
    validate: {
      payload: SiteUpdateDto.Payload(),
      params: SiteUpdateDto.Parameters()
    },
    auth: {
      strategy: 'jwt'
    }
  }
}

function checkDuplicateDomain (id, domain) {
  return Page.findOne({_id: {$ne: id}, 'admin.domain': domain})
}

function updateSiteInfo (id, title, domain, analytics_id) {
  return Page.findOneAndUpdate({_id: id}, {$set: {
    'custom.title': title,
    'admin.domain': domain,
    'admin.analytics_id': analytics_id,
    'log.domain_changed': new Date(),
    'log.build_updated': false,
    'log.build_queued': new Date()
  }})
}
