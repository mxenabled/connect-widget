export function classToObject(instance) {
  // Step 1: Copy all instance properties
  const obj = { ...instance }

  // Step 2: Copy all methods from the prototype
  const prototype = Object.getPrototypeOf(instance)

  // Iterate over the prototype's properties
  Object.getOwnPropertyNames(prototype).forEach((prop) => {
    if (typeof prototype[prop] === 'function' && prop !== 'constructor') {
      obj[prop] = prototype[prop].bind(instance) // Bind the method to the instance
    }
  })

  return obj
}
