Error saving message: Error: Message validation failed: senderId: Path `senderId` is required.
    at ValidationError.inspect (C:\Users\ANDREE\Documents\drive-download-20240927T200830Z-001\Proyecto-tesis\Proyecto-tesis\Proyecto-tesis\node_modules\mongoose\lib\error\validation.js:50:26)
    at formatValue (node:internal/util/inspect:806:19)
    at inspect (node:internal/util/inspect:365:10)
    at formatWithOptionsInternal (node:internal/util/inspect:2304:40)
    at formatWithOptions (node:internal/util/inspect:2166:10)
    at console.value (node:internal/console/constructor:358:14)
    at console.error (node:internal/console/constructor:395:61)
    at Socket.<anonymous> (file:///C:/Users/ANDREE/Documents/drive-download-20240927T200830Z-001/Proyecto-tesis/Proyecto-tesis/Proyecto-tesis/src/services/socketHandlers.js:28:25)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
  errors: {
    senderId: ValidatorError: Path `senderId` is required.
        at validate (C:\Users\ANDREE\Documents\drive-download-20240927T200830Z-001\Proyecto-tesis\Proyecto-tesis\Proyecto-tesis\node_modules\mongoose\lib\schemaType.js:1385:13)
        at SchemaType.doValidate (C:\Users\ANDREE\Documents\drive-download-20240927T200830Z-001\Proyecto-tesis\Proyecto-tesis\Proyecto-tesis\node_modules\mongoose\lib\schemaType.js:1369:7)
        at C:\Users\ANDREE\Documents\drive-download-20240927T200830Z-001\Proyecto-tesis\Proyecto-tesis\Proyecto-tesis\node_modules\mongoose\lib\document.js:3071:18
        at process.processTicksAndRejections (node:internal/process/task_queues:77:11) {
      properties: [Object],
      kind: 'required',
      path: 'senderId',
      value: undefined,
      reason: undefined,
      [Symbol(mongoose#validatorError)]: true
    }
  },
  _message: 'Message validation failed'
}