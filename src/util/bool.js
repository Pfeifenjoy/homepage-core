//@flow

export const implies = (c1: boolean) => (c2: boolean) => !c1 || c2

export const iff = (c1: boolean) => (c2: boolean) => implies(c1)(c2) && implies(c2)(c1)
