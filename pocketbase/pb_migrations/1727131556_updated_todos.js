/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("lad3e15d50ci63z")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wx0kbkjl",
    "name": "isDeleted",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("lad3e15d50ci63z")

  // remove
  collection.schema.removeField("wx0kbkjl")

  return dao.saveCollection(collection)
})
