import { DateTime } from 'luxon'
import { belongsTo, column, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import User from '#models/user'
import Profile from '#models/profile'
import AppBaseModel from '#models/app_base_model'
import NotificationTypes from '#enums/notification_types'
import NotImplementedException from '#exceptions/not_implemented_exception'
import Emitter from '@adonisjs/core/services/emitter'

export default class Notification extends AppBaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare global: boolean

  @column()
  declare userId: number

  @column()
  declare initiatorUserId: number | null

  @column()
  declare notificationTypeId: number

  @column()
  declare table: string | null

  @column()
  declare tableId: number | null

  @column()
  declare title: string

  @column()
  declare body: string

  @column()
  declare href: string | null

  @column.dateTime()
  declare readAt: DateTime | null

  @column.dateTime()
  declare actionedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @computed()
  public get settingsField() {
    switch (this.notificationTypeId) {
      case NotificationTypes.COMMENT:
        return 'emailOnComment'
      case NotificationTypes.COMMENT_REPLY:
        return 'emailOnCommentReply'
      default:
        throw new NotImplementedException(`Settings field for type ${this.notificationTypeId} has not been defined`)
    }
  }

  @computed()
  public get settingsDescriptor() {
    switch (this.notificationTypeId) {
      case NotificationTypes.COMMENT:
        return 'comments on your content'
      case NotificationTypes.COMMENT_REPLY:
        return 'replies to one of your comments'
      default:
        throw new NotImplementedException(`Settings field for type ${this.notificationTypeId} has not been defined`)
    }
  }

  public isEmailEnabled(profile: Profile) {
    switch (this.notificationTypeId) {
      case NotificationTypes.COMMENT:
        return profile.emailOnComment
      case NotificationTypes.COMMENT_REPLY:
        return profile.emailOnCommentReply
      default:
        throw new NotImplementedException(`Email handler for type ${this.notificationTypeId} has not been defined`)
    }
  }

  public async trySendEmail(userId: number, trx: TransactionClientContract | undefined | null = undefined) {
    const user = await User.query().where({ id: userId }).preload('profile').firstOrFail()
    
    if (!this.isEmailEnabled(user.profile)) return
    if (!trx) return Emitter.emit('notification:send', { notification: this, user })

    trx.on('commit', () => Emitter.emit('notification:send', { notification: this, user }))
  }
}