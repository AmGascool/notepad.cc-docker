import diff3merge from 'diff3'
import { diffPatch, patch, stripPatch } from 'node-diff3'

type Chunk = { __chunk: any }

export type PatchUncompressed = {
  file1: {
    offset: number
    length: number
  }
  file2: {
    chunk: Chunk
  }
}[]

export type Patch = { a: [number, number]; b: Chunk }[]

const merge = (
  a: string[],
  o: string[],
  b: string[],
): { conflict: any; result: any } => {
  const results = diff3merge(a, o, b)
  const conflict = results.some((r: any) => r.conflict)
  const result = results[0].ok
  return { conflict, result }
}

function toArr(str: string): string[] {
  return str.split('\n')
}

function fromArr(str: string[] | undefined): string | undefined {
  return str && str.join('\n')
}

function compress(patch: PatchUncompressed): Patch {
  return patch.map(({ file1: { offset, length }, file2: { chunk } }: any) => ({
    a: [offset, length] as [number, number],
    b: chunk,
  }))
}

function decompress(patch: Patch): PatchUncompressed {
  return patch.map(({ a, b }: any) => ({
    file1: {
      offset: a[0],
      length: a[1],
    },
    file2: {
      chunk: b,
    },
  }))
}

export const applyPatch = (a: string, p: Patch): string | undefined =>
  fromArr(patch(toArr(a), decompress(p)))

export const merge3 = (a: string, o: string, b: string): string | undefined => {
  let { conflict, result } = merge(toArr(a), toArr(o), toArr(b))
  return conflict ? undefined : fromArr(result)
}
export const createPatch = (a: string, b: string): Patch =>
  compress(stripPatch(diffPatch(toArr(a), toArr(b))))
