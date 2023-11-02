# Compressor Images

## How to use

we can use 2 function

- `compressor`
- `getFileBlob`

### `getFileBlob` function

function for make a request with fetch and get file blob for transform like a `File` by default or change format and get `Blob` type

```js
// returning blob
const blobCreated = await getFileBlob({
  url: 'https://www.elsoldeleon.com.mx/doble-via/virales/f4kd7u-conoce-la-historia-del-famoso-flork-3.jpg/alternates/FREE_720/Conoce-la-historia-del-famoso-%E2%80%9CFlork%E2%80%9D%20(3).jpg',
  filename: 'filename',
  type: 'blob'
})

// returning file
const fileCreated = await getFileBlob({
  url: 'https://www.elsoldeleon.com.mx/doble-via/virales/f4kd7u-conoce-la-historia-del-famoso-flork-3.jpg/alternates/FREE_720/Conoce-la-historia-del-famoso-%E2%80%9CFlork%E2%80%9D%20(3).jpg',
  filename: 'filename',
  type: 'file'
})
```

### `compress` function

```js
const { blob, urlImage } = await compressor({
  fileImage: fileCreated,
  type: 'image/webp',
  percentage = 80
})

document.querySelector('img').src = urlImage
```

## for test

run

```sh
pnpm build
```

and copy `dist` folder and paste on `tests` folder
after change the next folder for add `.js` to imports files `javascript`

```js
// tests/dist/constants/index.js
// tests/dist/controller/compressor.js
// tests/dist/models/index.js
// tests/dist/main.js
```
