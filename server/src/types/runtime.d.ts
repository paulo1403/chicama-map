declare const Bun: {
  write(
    path: string,
    data: Blob | string | ArrayBuffer | ArrayBufferView,
  ): Promise<number>
}
