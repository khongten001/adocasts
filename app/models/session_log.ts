import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import uap from 'ua-parser-js'
import UtilityService from '#services/utility_service'

export default class SessionLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare token: string

  @column()
  declare ipAddress: string | null

  @column()
  declare userAgent: string | null

  @column()
  declare city: string | null

  @column()
  declare country: string | null

  @column()
  declare countryCode: string | null

  @column.dateTime()
  declare lastTouchedAt: DateTime | null

  @column.dateTime()
  declare loginAt: DateTime | null

  @column()
  declare loginSuccessful: boolean

  @column.dateTime()
  declare logoutAt: DateTime | null

  @column()
  declare forceLogout: boolean

  @column()
  declare isRememberSession: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  public isCurrentSession: boolean = false

  @computed()
  public get lastTouchedAgo() {
    if (!this.lastTouchedAt && !this.loginAt) return ''
    
    if (!this.lastTouchedAt) {
      return UtilityService.timeago(this.loginAt)
    }

    return UtilityService.timeago(this.lastTouchedAt)
  }

  @computed()
  public get device() {
    if (!this.userAgent) return {}
    return uap(this.userAgent)
  }

  @computed()
  public get browser() {
    if (!this.device.browser) return '--'
    
    const info = [
      `${this.device.browser?.name} ${this.device.browser?.version}`,
      `${this.device.os.name} ${this.device.os.version}`
    ].filter(Boolean)
    
    return info.join(', ')
  }

  @computed()
  public get location() {
    if (!this.city && !this.country) return '--'
    
    const info = [
      this.city,
      this.country
    ].filter(Boolean).filter(i => i !== '-')

    return info.length ? info.join(', ') : '--'
  }
}