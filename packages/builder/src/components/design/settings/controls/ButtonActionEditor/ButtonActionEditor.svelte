<script>
  import { ActionButton, Button, Drawer } from "@budibase/bbui"
  import { createEventDispatcher } from "svelte"
  import { notifications } from "@budibase/bbui"
  import ButtonActionDrawer from "./ButtonActionDrawer.svelte"
  import { automationStore } from "builderStore"
  import { cloneDeep } from "lodash/fp"

  const dispatch = createEventDispatcher()

  export let key
  export let value = []
  export let name
  export let bindings
  export let nested

  let drawer
  let tmpValue

  const openDrawer = () => {
    tmpValue = cloneDeep(value)
    drawer.show()
  }

  const saveEventData = async () => {
    // any automations that need created from event triggers
    const automationsToCreate = tmpValue.filter(
      action => action["##eventHandlerType"] === "Trigger Automation"
    )
    for (let action of automationsToCreate) {
      await createAutomation(action.parameters)
    }

    dispatch("change", tmpValue)
    notifications.success("Component actions saved.")
    drawer.hide()
  }

  // called by the parent modal when actions are saved
  const createAutomation = async parameters => {
    if (parameters.automationId || !parameters.newAutomationName) {
      return
    }
    try {
      let trigger = automationStore.actions.constructBlock(
        "TRIGGER",
        "APP",
        $automationStore.blockDefinitions.TRIGGER.APP
      )
      trigger.inputs = {
        fields: Object.keys(parameters.fields ?? {}).reduce((fields, key) => {
          fields[key] = "string"
          return fields
        }, {}),
      }
      const automation = await automationStore.actions.create(
        parameters.newAutomationName,
        trigger
      )
      parameters.automationId = automation._id
      delete parameters.newAutomationName
    } catch (error) {
      notifications.error("Error creating automation")
    }
  }

  $: actionCount = value?.length
  $: actionText = `${actionCount || "No"} action${
    actionCount !== 1 ? "s" : ""
  } set`
</script>

<div class="action-editor">
  <ActionButton on:click={openDrawer}>{actionText}</ActionButton>
</div>

<Drawer bind:this={drawer} title={"Actions"}>
  <svelte:fragment slot="description">
    Define what actions to run.
  </svelte:fragment>
  <Button cta slot="buttons" on:click={saveEventData}>Save</Button>
  <ButtonActionDrawer
    slot="body"
    bind:actions={tmpValue}
    eventType={name}
    {bindings}
    {key}
    {nested}
  />
</Drawer>

<style>
  .action-editor :global(.spectrum-ActionButton) {
    width: 100%;
  }
</style>
