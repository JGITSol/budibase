import { FieldType, Table, ViewV2 } from "@budibase/types"
import { generator } from "@budibase/backend-core/tests"
import { enrichSchema } from ".."

describe("table sdk", () => {
  describe("enrichViewSchemas", () => {
    const basicTable: Table = {
      _id: generator.guid(),
      name: "TestTable",
      type: "table",
      schema: {
        name: {
          type: FieldType.STRING,
          name: "name",
          visible: true,
          width: 80,
          order: 2,
          constraints: {
            type: "string",
          },
        },
        description: {
          type: FieldType.STRING,
          name: "description",
          visible: true,
          width: 200,
          constraints: {
            type: "string",
          },
        },
        id: {
          type: FieldType.NUMBER,
          name: "id",
          visible: true,
          order: 1,
          constraints: {
            type: "number",
          },
        },
        hiddenField: {
          type: FieldType.STRING,
          name: "hiddenField",
          visible: false,
          constraints: {
            type: "string",
          },
        },
      },
    }

    it("should fetch the default schema if not overriden", async () => {
      const tableId = basicTable._id!
      const view: ViewV2 = {
        version: 2,
        id: generator.guid(),
        name: generator.guid(),
        tableId,
      }

      const res = enrichSchema(view, basicTable.schema)

      expect(res).toEqual({
        ...view,
        schema: {
          name: {
            type: "string",
            name: "name",
            visible: true,
            order: 2,
            width: 80,
            constraints: {
              type: "string",
            },
          },
          description: {
            type: "string",
            name: "description",
            visible: true,
            width: 200,
            constraints: {
              type: "string",
            },
          },
          id: {
            type: "number",
            name: "id",
            visible: true,
            order: 1,
            constraints: {
              type: "number",
            },
          },
          hiddenField: {
            type: "string",
            name: "hiddenField",
            visible: false,
            constraints: {
              type: "string",
            },
          },
        },
      })
    })

    it("if view schema only defines columns, should only fetch the selected fields", async () => {
      const tableId = basicTable._id!
      const view: ViewV2 = {
        version: 2,
        id: generator.guid(),
        name: generator.guid(),
        tableId,
        columns: ["name", "id"],
      }

      const res = enrichSchema(view, basicTable.schema)

      expect(res).toEqual({
        ...view,
        schema: {
          name: {
            type: "string",
            name: "name",
            visible: true,
            order: 2,
            width: 80,
            constraints: {
              type: "string",
            },
          },
          id: {
            type: "number",
            name: "id",
            visible: true,
            order: 1,
            constraints: {
              type: "number",
            },
          },
        },
      })
    })

    it("schema does not break if the view has corrupted columns", async () => {
      const tableId = basicTable._id!
      const view: ViewV2 = {
        version: 2,
        id: generator.guid(),
        name: generator.guid(),
        tableId,
        columns: ["unnexisting", "name"],
      }

      const res = enrichSchema(view, basicTable.schema)

      expect(res).toEqual(
        expect.objectContaining({
          ...view,
          schema: {
            name: {
              type: "string",
              name: "name",
              order: 2,
              visible: true,
              width: 80,
              constraints: {
                type: "string",
              },
            },
          },
        })
      )
    })

    it("if the view schema overrides the schema UI, the table schema should be overridden", async () => {
      const tableId = basicTable._id!
      const view: ViewV2 = {
        version: 2,
        id: generator.guid(),
        name: generator.guid(),
        tableId,
        columns: ["name", "id", "description"],
        schemaUI: {
          name: { visible: true, width: 100 },
          id: { visible: true, width: 20 },
          description: { visible: false },
        },
      }

      const res = enrichSchema(view, basicTable.schema)

      expect(res).toEqual(
        expect.objectContaining({
          ...view,
          schema: {
            name: {
              type: "string",
              name: "name",
              order: 2,
              visible: true,
              width: 100,
              constraints: {
                type: "string",
              },
            },
            id: {
              type: "number",
              name: "id",
              order: 1,
              visible: true,
              width: 20,
              constraints: {
                type: "number",
              },
            },
            description: {
              type: "string",
              name: "description",
              visible: false,
              width: 200,
              constraints: {
                type: "string",
              },
            },
          },
        })
      )
    })

    it("if the view defines order, the table schema order should be ignored", async () => {
      const tableId = basicTable._id!
      const view: ViewV2 = {
        version: 2,
        id: generator.guid(),
        name: generator.guid(),
        tableId,
        columns: ["name", "id", "description"],
        schemaUI: {
          name: { visible: true, order: 1 },
          id: { visible: true },
          description: { visible: false, order: 2 },
        },
      }

      const res = enrichSchema(view, basicTable.schema)

      expect(res).toEqual(
        expect.objectContaining({
          ...view,
          schema: {
            name: {
              type: "string",
              name: "name",
              order: 1,
              visible: true,
              width: 80,
              constraints: {
                type: "string",
              },
            },
            id: {
              type: "number",
              name: "id",
              visible: true,
              constraints: {
                type: "number",
              },
            },
            description: {
              type: "string",
              name: "description",
              order: 2,
              visible: false,
              width: 200,
              constraints: {
                type: "string",
              },
            },
          },
        })
      )
    })
  })
})
