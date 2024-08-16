// import { getMFAFieldType } from 'src/views/mfa/utils'

// describe('mfa utils tests', () => {
//   it('getMFAFieldType can determine the credential.field_type', () => {
//     expect(getMFAFieldType([{ field_type: 0, type: 1 }])).toBe(0)
//   })

//   it('getMFAFieldType can fallback to the credential.type', () => {
//     expect(getMFAFieldType([{ type: 1 }])).toBe(1)
//   })

//   it('getMFAFieldType returns null when array is empty', () => {
//     expect(getMFAFieldType([])).toBeNull()
//   })

//   it("getMFAFieldType returns null when arg isn't an Array", () => {
//     expect(getMFAFieldType({ arg: 'is an object' })).toBeNull()
//   })

//   it('getMFAFieldType returns null when the credential is missing field_type and the type field', () => {
//     expect(getMFAFieldType([{ param: 1 }])).toBeNull()
//   })
// })
