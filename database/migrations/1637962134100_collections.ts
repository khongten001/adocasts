import { BaseSchema } from '@adonisjs/lucid/schema'
import CollectionType from '#enums/collection_types'
import State from '#enums/states'
import Status from '#enums/status'

export default class Collections extends BaseSchema {
  protected tableName = 'collections'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('owner_id').unsigned().references('id').inTable('users')
      table.integer('parent_id').unsigned().references('id').inTable(this.tableName)
      table.integer('collection_type_id').unsigned().notNullable().defaultTo(CollectionType.COURSE)
      table.integer('status_id').unsigned().notNullable().defaultTo(Status.IN_PROGRESS)
      table.integer('state_id').unsigned().notNullable().defaultTo(State.PUBLIC)
      table.integer('asset_id').unsigned().references('id').inTable('assets').nullable()
      table.string('name', 100).notNullable()
      table.string('slug', 150).notNullable()
      table.string('description', 255).notNullable().defaultTo('')
      table.string('page_title', 100).notNullable().defaultTo('')
      table.string('meta_description', 255).notNullable().defaultTo('')
      table.integer('sort_order').notNullable().defaultTo(0)

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
